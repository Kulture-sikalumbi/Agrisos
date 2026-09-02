import type { DiseaseKey } from '../i18n/types';

/** Non-translated disease chrome (colors / icons). */
export const DISEASE_CHROME: Record<
  DiseaseKey,
  { color: 'red' | 'yellow' | 'green'; icon: string }
> = {
  cmd: { color: 'red', icon: '🔴' },
  cbsd: { color: 'red', icon: '🔴' },
  healthy: { color: 'green', icon: '🟢' },
  uncertain: { color: 'yellow', icon: '🟡' },
};
