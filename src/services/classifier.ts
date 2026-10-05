/**
 * Offline image classifier service.
 *
 * Uses the bundled TFLite model when available. Rejects poor-quality /
 * non-useful photos before giving disease advice.
 */

import { DiseaseKey } from '../constants/strings';
import { TFLITE_MODEL_CONFIG } from '../config/tfliteModelConfig';
import {
  runTfliteClassifier,
  isConfident as isTfliteConfident,
  getLastTfliteError,
} from './tflite';
import { assessImageQuality } from './imageQuality';

export interface ClassifierResult {
  disease: DiseaseKey;
  confidence: number; // 0–1
  isConfident: boolean; // true if confidence >= CONFIDENCE_THRESHOLD
  /** True when this result came from the bundled on-device model. */
  offlineModelAvailable?: boolean;
  /** Technical reason when the offline model could not produce a result. */
  offlineFailureReason?: string;
  /** Per-class scores when available (healthy, cmd, cbsd). */
  scores?: number[];
  /** Gap between top-1 and top-2 class scores. */
  topTwoDelta?: number;
  /** True when the photo was rejected (no disease advice should be shown). */
  rejected?: boolean;
  /** Machine code for localized reject copy. */
  rejectCode?: import('./imageQuality').ImageRejectCode;
  /** Farmer-facing reason when rejected (English fallback). */
  rejectReason?: string;
}

const CONFIDENCE_THRESHOLD = TFLITE_MODEL_CONFIG.confidenceThreshold;
function rejectedResult(
  message: string,
  code?: import('./imageQuality').ImageRejectCode
): ClassifierResult {
  return {
    disease: 'uncertain',
    confidence: 0,
    isConfident: false,
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
    const disease = tfliteResult.disease;
    const result: ClassifierResult = {
      disease,
      confidence: tfliteResult.confidence,
      isConfident,
      offlineModelAvailable: true,
      scores: tfliteResult.scores,
      topTwoDelta: tfliteResult.topTwoDelta,
    };
    console.log('[Classifier] Using TFLite result', result);
    return result;
  }

  console.warn('[Classifier] TFLite unavailable');
  return {
    disease: 'uncertain',
    confidence: 0,
    isConfident: false,
    offlineModelAvailable: false,
    offlineFailureReason: getLastTfliteError(),
  };
}
