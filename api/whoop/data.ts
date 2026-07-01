import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID!.trim();
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!.trim();
const TOKEN_ENDPOINT = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE = 'https://api.prod.whoop.com/developer/v2';
const ACCESS_KEY = 'whoop_access_token';
const REFRESH_KEY = 'whoop_refresh_token';
const LOCK_KEY = 'whoop_refresh_lock';
const REFRESH_TTL_SEC = 60 * 60 * 24 * 60; // 60 days

function redisHeaders() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, headers: { Authorization: `Bearer ${token}` } };
}

async function redisGet(key: string): Promise<string | null> {
  const r = redisHeaders();
  if (!r) return null;
  try {
    const res = await fetch(`${r.url}/get/${key}`, { headers: r.headers });
    const data = (await res.json()) as { result: string | null };
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function redisSetEX(key: string, value: string, ttlSec: number): Promise<void> {
  const r = redisHeaders();
  if (!r) return;
  try {
    await fetch(`${r.url}/set/${key}/${encodeURIComponent(value)}/EX/${ttlSec}`, {
      headers: r.headers,
    });
  } catch {
    /* non-fatal */
  }
}

async function redisSetNX(key: string, value: string, ttlSec: number): Promise<boolean> {
  const r = redisHeaders();
  if (!r) return true; // no redis → no lock, behave as if acquired
  try {
    const res = await fetch(`${r.url}/set/${key}/${value}/EX/${ttlSec}/NX`, {
      headers: r.headers,
    });
    const data = (await res.json()) as { result: string | null };
    return data.result === 'OK';
  } catch {
    return false;
  }
}

async function redisDel(key: string): Promise<void> {
  const r = redisHeaders();
  if (!r) return;
  try {
    await fetch(`${r.url}/del/${key}`, { headers: r.headers });
  } catch {
    /* non-fatal */
  }
}

async function getAccessToken(): Promise<string> {
  // 1) Shared cache: any instance can serve from here.
  const cached = await redisGet(ACCESS_KEY);
  if (cached) return cached;

  // 2) Distributed lock so only one instance refreshes at a time.
  //    WHOOP rotates the refresh token on every call — concurrent refreshes
  //    invalidate each other and break the chain.
  const haveLock = await redisSetNX(LOCK_KEY, '1', 15);
  if (!haveLock) {
    // Another instance is refreshing. Poll the cache for ~5s.
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const v = await redisGet(ACCESS_KEY);
      if (v) return v;
    }
    throw new Error('Timed out waiting for WHOOP token refresh');
  }

  try {
    // Re-check cache after acquiring the lock.
    const recheck = await redisGet(ACCESS_KEY);
    if (recheck) return recheck;

    const refreshToken =
      (await redisGet(REFRESH_KEY)) ?? process.env.WHOOP_REFRESH_TOKEN?.trim() ?? null;
    if (!refreshToken) throw new Error('No WHOOP refresh token available');

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        scope: 'read:recovery read:cycles read:sleep read:workout offline',
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`WHOOP token refresh failed (${response.status}): ${errBody}`);
    }

    const tokens = await response.json();
    console.log('Token refresh OK, expires_in:', tokens.expires_in);

    // Persist rotated refresh token FIRST so a crash after this point still leaves
    // the next invocation able to refresh.
    await redisSetEX(REFRESH_KEY, tokens.refresh_token, REFRESH_TTL_SEC);
    // Cache access token slightly under its real expiry.
    const ttl = Math.max(tokens.expires_in - 120, 60);
    await redisSetEX(ACCESS_KEY, tokens.access_token, ttl);

    return tokens.access_token;
  } finally {
    await redisDel(LOCK_KEY);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSleep(record: any) {
  if (!record || record.score_state !== 'SCORED' || !record.score) return null;
  const s = record.score;
  if (!s.stage_summary) return null;
  return {
    duration: Math.round(
      (s.stage_summary.total_in_bed_time_milli - s.stage_summary.total_awake_time_milli) / 60_000
    ),
    performance: Math.round(s.sleep_performance_percentage),
    efficiency: Math.round(s.sleep_efficiency_percentage),
    stages: {
      light: Math.round(s.stage_summary.total_light_sleep_time_milli / 60_000),
      rem: Math.round(s.stage_summary.total_rem_sleep_time_milli / 60_000),
      sws: Math.round(s.stage_summary.total_slow_wave_sleep_time_milli / 60_000),
      awake: Math.round(s.stage_summary.total_awake_time_milli / 60_000),
    },
    respiratoryRate: s.respiratory_rate ?? null,
    date: record.start,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // WHOOP v2 caps page size at 25. Paginate via `nextToken` to reach 30.
    const fetchPaged = async (path: string, target: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: any[] = [];
      let cursor: string | null = null;
      for (let i = 0; i < 3 && out.length < target; i++) {
        const u = new URL(`${API_BASE}${path}`);
        u.searchParams.set('limit', '25');
        if (cursor) u.searchParams.set('nextToken', cursor);
        const res = await fetch(u.toString(), { headers });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`${path} failed (${res.status}): ${body.slice(0, 200)}`);
        }
        const data = await res.json();
        out.push(...(data.records ?? []));
        cursor = data.next_token ?? null;
        if (!cursor) break;
      }
      return out.slice(0, target);
    };

    const [recoveryRecords, cycleRecords, sleepRecords] = await Promise.all([
      fetchPaged('/recovery', 30),
      fetchPaged('/cycle', 30),
      fetchPaged('/activity/sleep', 30),
    ]);

    const recoveryData = { records: recoveryRecords };
    const cycleData = { records: cycleRecords };
    const sleepData = { records: sleepRecords };

    // Latest recovery
    const latestRecovery = recoveryData.records?.[0] ?? null;
    const recovery =
      latestRecovery?.score_state === 'SCORED' && latestRecovery.score
        ? {
            score: latestRecovery.score.recovery_score,
            hrv: Math.round(latestRecovery.score.hrv_rmssd_milli),
            rhr: latestRecovery.score.resting_heart_rate,
            spo2: latestRecovery.score.spo2_percentage ?? null,
            skinTemp: latestRecovery.score.skin_temp_celsius ?? null,
            scoreState: 'SCORED' as const,
            date: latestRecovery.created_at,
          }
        : { scoreState: (latestRecovery?.score_state ?? 'UNSCORABLE') as string, score: null };

    // Latest cycle (today's strain)
    const latestCycle = cycleData.records?.[0] ?? null;
    const strain =
      latestCycle?.score_state === 'SCORED' && latestCycle.score?.strain != null
        ? {
            score: parseFloat(latestCycle.score.strain.toFixed(1)),
            calories: Math.round((latestCycle.score.kilojoule ?? 0) * 0.239006),
            avgHr: latestCycle.score.average_heart_rate ?? null,
            maxHr: latestCycle.score.max_heart_rate ?? null,
            date: latestCycle.start,
          }
        : null;

    // Latest sleep
    const sleep = normalizeSleep(sleepData.records?.[0] ?? null);

    // 30-day trends (oldest→newest)
    const trends = {
      recovery: [...(recoveryData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((r: any) => r.score_state === 'SCORED' && r.score?.recovery_score != null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => ({ date: r.created_at, score: r.score.recovery_score }))
        .reverse(),
      strain: [...(cycleData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((c: any) => c.score_state === 'SCORED' && c.score?.strain != null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => ({ date: c.start, score: parseFloat(c.score.strain.toFixed(1)) }))
        .reverse(),
      hrv: [...(recoveryData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((r: any) => r.score_state === 'SCORED' && r.score?.hrv_rmssd_milli != null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => ({ date: r.created_at, value: Math.round(r.score.hrv_rmssd_milli) }))
        .reverse(),
      sleep: [...(sleepData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((s: any) => s.score_state === 'SCORED' && s.score?.stage_summary)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any) => ({
          date: s.start,
          minutes: Math.round(
            (s.score.stage_summary.total_in_bed_time_milli -
              s.score.stage_summary.total_awake_time_milli) / 60_000
          ),
        }))
        .reverse(),
    };

    return res.status(200).json({ recovery, strain, sleep, trends });
  } catch (error) {
    console.error('WHOOP API error:', error);
    return res.status(500).json({ error: 'Failed to fetch WHOOP data' });
  }
}
