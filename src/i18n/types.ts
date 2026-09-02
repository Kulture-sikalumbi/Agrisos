export type AppLanguage = 'en' | 'bem';

export const LANGUAGE_OPTIONS: {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
}[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'bem', label: 'Bemba', nativeLabel: 'IciBemba' },
];

export type DiseaseKey = 'cmd' | 'cbsd' | 'healthy' | 'uncertain';

export type DiseaseCopy = {
  label: string;
  shortLabel: string;
  action: string;
  advice: string;
  prevention: string;
  treatment: string;
};

export type UiStrings = {
  appName: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  legendHealthy: string;
  legendUnclear: string;
  legendDisease: string;
  scanCamera: string;
  pickGallery: string;
  askAssistant: string;
  recentScans: string;
  worksOffline: string;
  analyzing: string;
  analyzingSub: string;
  language: string;

  back: string;
  backHome: string;
  cameraHint: string;
  frameHint: string;
  gallery: string;
  cameraNeededTitle: string;
  cameraNeededSub: string;
  allowCamera: string;
  permissionGallery: string;

  confidence: string;
  lowConfidence: string;
  whatToDoNow: string;
  prevention: string;
  moreTips: string;
  hideTips: string;
  treatmentNote: string;
  aiAdvice: string;
  gettingAdvice: string;
  aiNeedsInternet: string;
  tryAi: string;
  scanAnother: string;
  askMoreHelp: string;
  photoNotUsable: string;
  goodPhotoTitle: string;
  goodPhotoSteps: string;
  retakePhoto: string;
  rejectTooSmall: string;
  rejectTooDark: string;
  rejectTooBright: string;
  rejectTooFlat: string;
  rejectDecode: string;

  historyTitle: string;
  clear: string;
  clearConfirmTitle: string;
  clearConfirmBody: string;
  cancel: string;
  noScansYet: string;
  noScansSub: string;

  chatTitle: string;
  chatSub: string;
  chatWelcome: string;
  chatPlaceholder: string;
  chatOffline: string;

  diseases: Record<DiseaseKey, DiseaseCopy>;
};
