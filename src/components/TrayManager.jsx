// TrayManager exports helper functions for updating the system tray
// It does not render any UI

export function formatTimeForTray(seconds) {
  if (seconds === null || seconds === undefined) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export async function updateTray(timeLeft, isRunning, modeName) {
  if (!window.electronAPI) return;
  const timeText = `${modeName || 'Timer'} - ${formatTimeForTray(timeLeft)}`;
  try {
    await window.electronAPI.tray.updateTime({ timeText, isRunning });
  } catch (e) {
    console.error('Failed to update tray:', e);
  }
}
