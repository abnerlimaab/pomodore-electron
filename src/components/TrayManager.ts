export function formatTimeForTray(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export async function updateTray(
  timeLeft: number | null,
  isRunning: boolean,
  modeName: string
): Promise<void> {
  if (!window.electronAPI) return;
  const timeText = `${modeName || 'Timer'} - ${formatTimeForTray(timeLeft)}`;
  try {
    await window.electronAPI.tray.updateTime({ timeText, isRunning });
  } catch (e) {
    console.error('Failed to update tray:', e);
  }
}
