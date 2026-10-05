import { Alert } from 'react-native';
import type { UiStrings } from '../i18n/types';

/**
 * Extra guardrail before running a gallery-picked photo through the
 * classifier: a plain confirmation nudge so people (especially during demos)
 * don't feed the model random test images and expect a meaningful result.
 *
 * This is not a real verification step — it can't stop someone from tapping
 * "yes" on a photo of a car — but it sets clear expectations and cuts down
 * on accidental misuse. Not shown for live camera captures, since pointing
 * the camera at something already implies intent to scan it.
 */
export function confirmCassavaLeafPhoto(t: UiStrings): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(t.confirmLeafTitle, t.confirmLeafMessage, [
      { text: t.confirmLeafCancel, style: 'cancel', onPress: () => resolve(false) },
      { text: t.confirmLeafContinue, onPress: () => resolve(true) },
    ]);
  });
}
