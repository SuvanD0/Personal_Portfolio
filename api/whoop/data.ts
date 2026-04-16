import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.WHOOP_CLIENT_ID!.trim();
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET!.trim();
const TOKEN_ENDPOINT = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API_BASE = 'https://api.prod.whoop.com/developer/v2';
const REDIS_KEY = 'whoop_refresh_token';

// Module-level in-memory token cache (survives across warm invocations)
let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;
let cachedRefreshToken: string | null = null; // tracks latest rotated token within this instance

async function redisGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { result: string | null };
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/set/${key}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Non-fatal
  }
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (>2 min buffer)
  if (cachedAccessToken && Date.now() < cachedTokenExpiry - 120_000) {
    return cachedAccessToken;
  }

  // Priority: in-memory rotated token → Redis → env var
  let refreshToken = cachedRefreshToken;
  if (!refreshToken) refreshToken = await redisGet(REDIS_KEY);
  if (!refreshToken) refreshToken = process.env.WHOOP_REFRESH_TOKEN?.trim() ?? null;
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

  // Cache in memory
  cachedAccessToken = tokens.access_token;
  cachedTokenExpiry = Date.now() + tokens.expires_in * 1000;
  cachedRefreshToken = tokens.refresh_token;

  // Persist rotated refresh token to Redis (awaited — ensures it completes before response)
  await redisSet(REDIS_KEY, tokens.refresh_token);

  return tokens.access_token;
}

const SPORT_NAMES: Record<number, string> = {
  [-1]: 'Activity',
  0: 'Running',
  1: 'Cycling',
  18: 'Rowing',
  33: 'Swimming',
  34: 'Tennis',
  44: 'Yoga',
  45: 'Weightlifting',
  48: 'Functional Fitness',
  52: 'Hiking',
  56: 'Martial Arts',
  59: 'Powerlifting',
  63: 'Walking',
  65: 'Elliptical',
  66: 'Stairmaster',
  70: 'Meditation',
  71: 'Other',
  96: 'HIIT',
  97: 'Spin',
  98: 'Jiu Jitsu',
  101: 'Pickleball',
  123: 'Strength',
  126: 'Assault Bike',
  127: 'Kickboxing',
  128: 'Stretching',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSleep(record: any) {
  if (!record || record.score_state !== 'SCORED') return null;
  const s = record.score;
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

    const [recoveryRes, cycleRes, sleepRes, workoutRes] = await Promise.all([
      fetch(`${API_BASE}/recovery?limit=7`, { headers }),
      fetch(`${API_BASE}/cycle?limit=7`, { headers }),
      fetch(`${API_BASE}/activity/sleep?limit=1`, { headers }),
      fetch(`${API_BASE}/activity/workout?limit=7`, { headers }),
    ]);

    const statuses = {
      recovery: recoveryRes.status,
      cycle: cycleRes.status,
      sleep: sleepRes.status,
      workout: workoutRes.status,
    };
    console.log('WHOOP API statuses:', JSON.stringify(statuses));

    if (!recoveryRes.ok || !cycleRes.ok || !sleepRes.ok || !workoutRes.ok) {
      const bodies = await Promise.all([
        recoveryRes.ok ? null : recoveryRes.text(),
        cycleRes.ok ? null : cycleRes.text(),
        sleepRes.ok ? null : sleepRes.text(),
        workoutRes.ok ? null : workoutRes.text(),
      ]);
      console.error('WHOOP API failures:', JSON.stringify({ statuses, bodies }));
      throw new Error(`WHOOP API calls failed: ${JSON.stringify(statuses)}`);
    }

    const [recoveryData, cycleData, sleepData, workoutData] = await Promise.all([
      recoveryRes.json(),
      cycleRes.json(),
      sleepRes.json(),
      workoutRes.json(),
    ]);

    // Latest recovery
    const latestRecovery = recoveryData.records?.[0] ?? null;
    const recovery =
      latestRecovery?.score_state === 'SCORED'
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
      latestCycle?.score_state === 'SCORED'
        ? {
            score: parseFloat(latestCycle.score.strain.toFixed(1)),
            calories: Math.round(latestCycle.score.kilojoule * 0.239006),
            avgHr: latestCycle.score.average_heart_rate,
            maxHr: latestCycle.score.max_heart_rate,
            date: latestCycle.start,
          }
        : null;

    // Latest sleep
    const sleep = normalizeSleep(sleepData.records?.[0] ?? null);

    // Recent workouts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workouts = (workoutData.records ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((w: any) => w.score_state === 'SCORED')
      .slice(0, 7)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((w: any) => ({
        id: String(w.id),
        sport: SPORT_NAMES[w.sport_id as number] ?? 'Activity',
        sportId: w.sport_id,
        strain: parseFloat(w.score.strain.toFixed(1)),
        duration: Math.round(
          (new Date(w.end).getTime() - new Date(w.start).getTime()) / 60_000
        ),
        avgHr: w.score.average_heart_rate,
        maxHr: w.score.max_heart_rate,
        calories: Math.round(w.score.kilojoule * 0.239006),
        date: w.start,
      }));

    // 7-day trends (oldest→newest)
    const trends = {
      recovery: [...(recoveryData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((r: any) => r.score_state === 'SCORED')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => ({ date: r.created_at, score: r.score.recovery_score }))
        .reverse(),
      strain: [...(cycleData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((c: any) => c.score_state === 'SCORED')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => ({ date: c.start, score: parseFloat(c.score.strain.toFixed(1)) }))
        .reverse(),
      hrv: [...(recoveryData.records ?? [])]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((r: any) => r.score_state === 'SCORED')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => ({ date: r.created_at, value: Math.round(r.score.hrv_rmssd_milli) }))
        .reverse(),
    };

    return res.status(200).json({ recovery, strain, sleep, workouts, trends });
  } catch (error) {
    console.error('WHOOP API error:', error);
    return res.status(500).json({ error: 'Failed to fetch WHOOP data' });
  }
}
