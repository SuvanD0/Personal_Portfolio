export interface WhoopRecovery {
  score: number;
  hrv: number;
  rhr: number;
  spo2: number | null;
  skinTemp: number | null;
  scoreState: 'SCORED';
  date: string;
}

export interface WhoopSleep {
  duration: number; // minutes
  performance: number; // %
  efficiency: number; // %
  stages: {
    light: number; // minutes
    rem: number;
    sws: number;
    awake: number;
  };
  respiratoryRate: number | null;
  date: string;
}

export interface WhoopStrain {
  score: number; // 0–21
  calories: number;
  avgHr: number;
  maxHr: number;
  date: string;
}

export interface WhoopWorkout {
  id: string;
  sport: string;
  sportId: number;
  strain: number;
  duration: number; // minutes
  avgHr: number;
  maxHr: number;
  calories: number;
  date: string;
}

export interface WhoopData {
  recovery: (WhoopRecovery | { scoreState: string; score: null }) | null;
  sleep: WhoopSleep | null;
  strain: WhoopStrain | null;
  workouts: WhoopWorkout[];
  trends: {
    recovery: { date: string; score: number }[];
    strain: { date: string; score: number }[];
    hrv: { date: string; value: number }[];
  };
}

export async function getWhoopData(): Promise<WhoopData> {
  const response = await fetch('/api/whoop/data');
  if (!response.ok) {
    throw new Error('Failed to fetch WHOOP data');
  }
  return response.json();
}
