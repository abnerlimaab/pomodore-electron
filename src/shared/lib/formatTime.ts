export function formatTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatTimeForTray(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '--:--';
  const m = Math.floor((seconds as number) / 60);
  const s = (seconds as number) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
