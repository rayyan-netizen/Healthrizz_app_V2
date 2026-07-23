/**
 * Subscribes to the user's reduced-motion preference.
 * Components with looping animations (`withRepeat`) should skip starting
 * the loop when this returns true — keeps the value at rest position.
 */
import { usePrefsStore } from '@stores/prefsStore';

export function useReducedMotion(): boolean {
  return usePrefsStore((s) => s.reducedMotion);
}
