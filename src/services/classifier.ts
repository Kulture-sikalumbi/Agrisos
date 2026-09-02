/**
 * Offline image classifier service.
 *
 * Uses the bundled TFLite model when available. Rejects poor-quality /
 * non-useful photos before giving disease advice.
 */

import { DiseaseKey } from '../constants/strings';
import { TFLITE_MODEL_CONFIG } from '../config/tfliteModelConfig';
import { runTfliteClassifier, isConfident as isTfliteConfident } from './tflite';
import { assessImageQuality } from './imageQuality';

export interface ClassifierResult {
  disease: DiseaseKey;
  confidence: number; // 0–1
  isConfident: boolean; // true if confidence >= CONFIDENCE_THRESHOLD
  /** Per-class scores when available (healthy, cmd, cbsd). */
  scores?: number[];
  /** Gap between top-1 and top-2 class scores. */
  topTwoDelta?: number;
  /** True when Gemini cloud advice is especially useful. */
  needsCloudAdvice: boolean;
  /** True when the photo was rejected (no disease advice should be shown). */
  rejected?: boolean;
  /** Machine code for localized reject copy. */
  rejectCode?: import('./imageQuality').ImageRejectCode;
  /** Farmer-facing reason when rejected (English fallback). */
  rejectReason?: string;
}

const CONFIDENCE_THRESHOLD = TFLITE_MODEL_CONFIG.confidenceThreshold;
const CLOUD_CONFIDENCE_TRIGGER = 0.8;
const CLOUD_TOP_TWO_DELTA_TRIGGER = 0.15;

export function shouldRequestCloudAdvice(input: {
  confidence: number;
  isConfident: boolean;
  topTwoDelta?: number;
  disease: DiseaseKey;
  rejected?: boolean;
}): boolean {
  if (input.rejected) return false;
  if (!input.isConfident || input.disease === 'uncertain') return true;
  if (input.confidence < CLOUD_CONFIDENCE_TRIGGER) return true;
  if (
    typeof input.topTwoDelta === 'number' &&
    input.topTwoDelta < CLOUD_TOP_TWO_DELTA_TRIGGER
  ) {
    return true;
  }
  return input.disease === 'cmd' || input.disease === 'cbsd';
}

function rejectedResult(
  message: string,
  code?: import('./imageQuality').ImageRejectCode
): ClassifierResult {
  return {
    disease: 'uncertain',
    confidence: 0,
    isConfident: false,
    needsCloudAdvice: false,
    rejected: true,
    rejectCode: code,
    rejectReason: message,
  };
}

export async function classifyImage(imageUri: string): Promise<ClassifierResult> {
  const quality = await assessImageQuality(imageUri);
  if (!quality.ok) {
    console.warn('[Classifier] Rejected image:', quality.code, quality.message);
    return rejectedResult(quality.message, quality.code);
  }

  const tfliteResult = await runTfliteClassifier(imageUri);
  if (tfliteResult) {
    const isConfident = isTfliteConfident(tfliteResult.confidence);
    const disease = isConfident ? tfliteResult.disease : 'uncertain';
    const result: ClassifierResult = {
      disease,
      confidence: tfliteResult.confidence,
      isConfident,
      scores: tfliteResult.scores,
      topTwoDelta: tfliteResult.topTwoDelta,
      needsCloudAdvice: shouldRequestCloudAdvice({
        confidence: tfliteResult.confidence,
        isConfident,
        topTwoDelta: tfliteResult.topTwoDelta,
        disease,
      }),
    };
    console.log('[Classifier] Using TFLite result', result);
    return result;
  }

  console.warn('[Classifier] TFLite unavailable — asking for a retake');
  return rejectedResult(
    'Could not analyze this photo on your device. Please retake a clear leaf photo and try again.'
  );
}
