export interface HeatmapDay {
  date: string;
  count: number;
}

export interface HeatmapData {
  data: HeatmapDay[];
}

export async function getSpotifyHeatmap(): Promise<HeatmapData> {
  const res = await fetch('/api/spotify/heatmap');
  if (!res.ok) throw new Error('Failed to fetch listening heatmap');
  return res.json();
}
