import { ipc } from '../api/ipc';
import { formatTimeForTray } from './formatTime';

export async function updateTray(
  timeLeft: number | null,
  isRunning: boolean,
  modeName: string,
): Promise<void> {
  if (!window.__ipc) return;
  const timeText = `${modeName || 'Timer'} - ${formatTimeForTray(timeLeft)}`;
  try {
    await ipc.tray.updateTime({ timeText, isRunning });
  } catch (e) {
    console.error('Failed to update tray:', e);
  }
}
