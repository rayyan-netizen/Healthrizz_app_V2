/**
 * Haptic feedback wrapper using expo-haptics.
 * Reads the user's haptics-enabled preference synchronously so callers
 * don't need to thread a flag through every call site.
 */
import * as Haptics from 'expo-haptics';
import { getPrefs } from '@stores/prefsStore';

function on(): boolean {
  const p = getPrefs();
  // Suppress haptics until persist rehydrates: prevents a "haptics off" user
  // from getting one stray tap haptic during the AsyncStorage round-trip on
  // cold start.
  if (!p.hydrated) return false;
  return p.hapticsEnabled;
}

export function hapticLight(): void {
  if (!on()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium(): void {
  if (!on()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticHeavy(): void {
  if (!on()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function hapticSuccess(): void {
  if (!on()) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticWarning(): void {
  if (!on()) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function hapticError(): void {
  if (!on()) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function hapticSelection(): void {
  if (!on()) return;
  void Haptics.selectionAsync();
}
