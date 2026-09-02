import type { UiStrings } from './types';

export const en: UiStrings = {
  appName: 'Agrisos+',
  tagline: 'Cassava Disease Detector',
  heroTitle: 'Is your cassava healthy?',
  heroSub: 'Take a photo or pick a leaf image.\nGet your answer in seconds.',
  legendHealthy: 'Healthy',
  legendUnclear: 'Unclear',
  legendDisease: 'Disease',
  scanCamera: 'Scan with Camera',
  pickGallery: 'Pick from Gallery',
  askAssistant: 'Ask the Assistant',
  recentScans: 'Recent scans',
  worksOffline: 'Works offline • No data needed',
  analyzing: 'Analyzing leaf...',
  analyzingSub: 'Checking photo quality, then classifying',
  language: 'Language',

  back: 'Back',
  backHome: 'Back home',
  cameraHint: 'Point at ONE cassava leaf',
  frameHint: 'Fill the frame with the leaf',
  gallery: 'Gallery',
  cameraNeededTitle: 'Camera Access Needed',
  cameraNeededSub: 'Allow the camera, or pick a leaf photo from your gallery.',
  allowCamera: 'Allow Camera',
  permissionGallery: 'Pick from Gallery',

  confidence: 'Confidence',
  lowConfidence: 'Low confidence — prefer a clearer daylight photo if you can.',
  whatToDoNow: 'What to do now',
  prevention: 'Prevention',
  moreTips: 'Treatment & AI tips',
  hideTips: 'Hide extra tips',
  treatmentNote: 'Treatment note',
  aiAdvice: 'AI advice',
  gettingAdvice: 'Getting advice...',
  aiNeedsInternet: 'AI tips need internet. Offline steps above still apply.',
  tryAi: 'Try AI advice',
  scanAnother: 'Scan another',
  askMoreHelp: 'Ask for more help',
  photoNotUsable: 'Photo not usable',
  goodPhotoTitle: 'How to take a good photo',
  goodPhotoSteps:
    '1. Use daylight (not night / heavy shade).\n2. Fill the frame with ONE leaf.\n3. Hold steady — avoid blur.\n4. Do not scan random objects, screens, or blank walls.',
  retakePhoto: 'Retake photo',
  rejectTooSmall: 'Photo is too small. Move closer and take a clearer leaf photo.',
  rejectTooDark: 'Photo is too dark. Retake outside in good daylight.',
  rejectTooBright: 'Photo is too bright / washed out. Avoid direct flash glare.',
  rejectTooFlat:
    'This does not look like a useful leaf photo. Retake with one cassava leaf filling the frame.',
  rejectDecode: 'Could not read this image. Try another photo.',

  historyTitle: 'Recent scans',
  clear: 'Clear',
  clearConfirmTitle: 'Clear recent scans?',
  clearConfirmBody: 'This only deletes history saved on this phone.',
  cancel: 'Cancel',
  noScansYet: 'No scans yet',
  noScansSub: 'After you scan a leaf, the last few results stay here on this phone.',

  chatTitle: 'Agrisos Assistant',
  chatSub: 'Powered by Gemini AI',
  chatWelcome:
    "Hello! I'm your Agrisos farming assistant. Ask me what to do about CMD, CBSD, prevention, clean cuttings, or whiteflies.",
  chatPlaceholder: 'Type your question...',
  chatOffline:
    "I couldn't reach the AI helper right now. Check your internet and try again. Meanwhile, use the scan result screen — it already shows offline steps.",

  diseases: {
    cmd: {
      label: 'Cassava Mosaic Disease',
      shortLabel: 'CMD',
      action: 'Remove this plant to stop spread',
      advice:
        '1. Pull out this plant and destroy it away from the field.\n2. Do not replant cuttings from it.\n3. Check nearby plants for mosaic or twisted leaves.',
      prevention:
        '• Plant only clean / certified stems\n• Ask extension about CMD-resistant varieties\n• Keep weeds down and watch for whiteflies',
      treatment:
        'CMD is a virus — spraying leaves will not cure an infected plant. Remove sick plants. For whiteflies, ask your agricultural extension officer which locally approved product is safe.',
    },
    cbsd: {
      label: 'Cassava Brown Streak Disease',
      shortLabel: 'CBSD',
      action: 'Remove this plant — roots may be rotten',
      advice:
        '1. Pull out and destroy this plant.\n2. Do not eat soft/rotten roots; do not replant cuttings from it.\n3. Tell your extension officer — CBSD spreads fast.',
      prevention:
        '• Use clean planting material only\n• Ask about CBSD-resistant varieties\n• Remove sick plants early; do not share infected stems',
      treatment:
        'CBSD is a virus — there is no leaf spray that cures it. Remove the plant. Check stems for brown streaks and roots for brown dry rot. Ask your extension officer for local guidance.',
    },
    healthy: {
      label: 'Healthy Plant',
      shortLabel: 'Healthy',
      action: 'Looks healthy — keep monitoring',
      advice:
        '1. Check leaves weekly for mosaic, yellow veins, or stem streaks.\n2. Keep good spacing and control weeds.\n3. Only take cuttings from plants that stay healthy.',
      prevention:
        '• Prefer disease-free planting stems\n• Scout weekly for whiteflies and early leaf symptoms\n• Do not bring cuttings from unknown sick fields',
      treatment:
        'No treatment needed. If whiteflies become heavy, ask an extension officer before using any insecticide.',
    },
    uncertain: {
      label: 'Result Unclear',
      shortLabel: 'Uncertain',
      action: 'Retake photo or ask for help',
      advice:
        '1. Retake in good daylight with one full leaf in frame.\n2. Avoid blur, heavy shadow, or mixed plants.\n3. If the plant still looks sick, ask your extension officer.',
      prevention:
        '• Good photos help: one leaf, daylight, close enough\n• Clean planting material prevents most field outbreaks',
      treatment: 'No chemical advice until we have a clearer diagnosis. Retake the photo first.',
    },
  },
};
