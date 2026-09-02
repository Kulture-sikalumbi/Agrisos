/**
 * Shared disease keys. UI copy lives in `src/i18n/*` (EN / Bemba).
 */
export type { DiseaseKey } from '../i18n/types';
export { en as DISEASE_INFO_EN } from '../i18n/en';

/** @deprecated Prefer useLanguage().t.diseases — kept for non-UI services. */
export { en as _EN_FALLBACK } from '../i18n/en';
