import type { DiseaseKey } from '../constants/strings';

export type InputDType = 'float32' | 'uint8';

export const TFLITE_MODEL_CONFIG = {
  /**
   * Local bundled model path.
   * Keep this file at `src/assets/model.tflite`.
   */
  bundledModelPath: 'src/assets/model.tflite',

  /**
   * Optional remote model URL.
   * Keep empty to use bundled model.
   */
  modelUrl: '',

  /**
   * If true, use bundled model from `src/assets/model.tflite`.
   * If false, try `modelUrl`.
   */
  useBundledModel: true,

  /**
   * Custom MobileNetV2 3-class model export order.
   * Must match ml/train.py CLASS_NAMES.
   */
  classOrder: [
    'healthy', // 0
    'cmd', // 1 Cassava Mosaic Disease
    'cbsd', // 2 Cassava Brown Streak Disease
  ] as DiseaseKey[],

  /**
   * Matches MobileNetV2 preprocess_input used in ml/train.py:
   * normalized = (pixel - 127.5) / 127.5
   */
  input: {
    size: { width: 224, height: 224 },
    dtype: 'float32' as InputDType,
    normalization: {
      mean: 127.5,
      std: 127.5,
    },
    centerCrop: true,
  },

  /**
   * Confidence threshold for "confident" prediction.
   */
  confidenceThreshold: 0.75,
} as const;

