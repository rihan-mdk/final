export function formatElapsedTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function calculateElapsedSeconds(
  startTimeMs: number | null,
  endTimeMs: number | null,
  isPaused: boolean,
  pausedAtMs: number | null,
  baseElapsedSeconds = 0
): number {
  if (!startTimeMs) return 0;
  
  const end = endTimeMs || (isPaused && pausedAtMs ? pausedAtMs : Date.now());
  const diffSec = Math.max(0, Math.floor((end - startTimeMs) / 1000));
  return Math.max(baseElapsedSeconds, diffSec);
}
