import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import { loadTensorflowModel, type ModelSource } from 'react-native-fast-tflite';
import type { DiseaseKey } from '../constants/strings';
import { decode as decodeJpeg } from 'jpeg-js';
import bundledModel from '../assets/model.tflite';
import { TFLITE_MODEL_CONFIG } from '../config/tfliteModelConfig';

type TensorInfo = {
  shape?: number[];
  dataType?: string;
  name?: string;
};

type TensorflowModel = {
  inputs?: TensorInfo[];
  outputs?: TensorInfo[];
  // react-native-fast-tflite returns one ArrayBuffer per output tensor.
  run: (inputs: Array<ArrayBuffer>) => Promise<Array<ArrayBuffer>>;
};

type TfliteClass = {
  disease: DiseaseKey;
  confidence: number; // 0..1
  /** Per-class scores in CLASS_MAP order (probabilities when available). */
  scores: number[];
  /** Absolute gap between top-1 and top-2 scores (0..1). */
  topTwoDelta: number;
};

const CLASS_MAP = TFLITE_MODEL_CONFIG.classOrder as DiseaseKey[];
const CONFIDENCE_THRESHOLD = TFLITE_MODEL_CONFIG.confidenceThreshold;

let modelPromise: Promise<TensorflowModel | null> | null = null;
let hasLoggedModelInfo = false;

function base64ToUint8Array(base64: string): Uint8Array {
  const atobFn = globalThis.atob;
  if (typeof atobFn !== 'function') {
    throw new Error('Base64 decode not available: globalThis.atob is missing.');
  }

  const binaryString = atobFn(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function argMax(arr: ArrayLike<number>): { index: number; value: number } {
  let bestIndex = 0;
  let bestValue = Number(arr[0] ?? -Infinity);
  for (let i = 1; i < arr.length; i++) {
    const v = Number(arr[i] ?? -Infinity);
    if (v > bestValue) {
      bestValue = v;
      bestIndex = i;
    }
  }
  return { index: bestIndex, value: bestValue };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function getInputSize(input: TensorInfo): { width: number; height: number } | null {
  const shape = input.shape;
  if (!Array.isArray(shape) || shape.length < 3) return null;

  // Common layouts:
  // - [1, height, width, 3]
  // - [1, 3, height, width]
  if (shape.length === 4) {
    if (shape[3] === 3) {
      return { width: shape[2], height: shape[1] };
    }
    if (shape[1] === 3) {
      return { width: shape[3], height: shape[2] };
    }
  }

  // Fallback: assume [batch, height, width, channels]
  if (shape.length >= 3) {
    return { width: shape[2], height: shape[1] };
  }

  return null;
}

function normalizeConfidence(raw: number, maybeHasLogits: boolean): number {
  // Many classification models output either:
  // - probabilities (0..1)
  // - logits (unbounded)
  if (!Number.isFinite(raw)) return 0;

  if (!maybeHasLogits) return clamp01(raw);

  // Cheap logit->prob approximation: sigmoid
  const sigmoid = 1 / (1 + Math.exp(-raw));
  return clamp01(sigmoid);
}

function getModelSource(): ModelSource | null {
  if (TFLITE_MODEL_CONFIG.useBundledModel) {
    return bundledModel;
  }
  if (TFLITE_MODEL_CONFIG.modelUrl) {
    return { url: TFLITE_MODEL_CONFIG.modelUrl };
  }
  return null;
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

async function getModel(): Promise<TensorflowModel | null> {
  const source = getModelSource();
  if (!source) return null;
  if (modelPromise) return modelPromise;

  modelPromise = loadTensorflowModel(source, [])
    .then((m) => m as TensorflowModel)
    .catch(() => null);

  return modelPromise;
}

function logModelInfoOnce(model: TensorflowModel): void {
  if (hasLoggedModelInfo) return;
  hasLoggedModelInfo = true;
  try {
    const input = model.inputs?.[0];
    const output = model.outputs?.[0];
    console.log('[TFLite] Model loaded');
    console.log('[TFLite] Input[0]:', input);
    console.log('[TFLite] Output[0]:', output);
    console.log('[TFLite] Class order:', CLASS_MAP);
    console.log('[TFLite] Input config:', TFLITE_MODEL_CONFIG.input);
  } catch {
    // Intentionally ignore logging failures.
  }
}

async function preprocessImageToInputBuffer(
  imageUri: string,
  model: TensorflowModel
): Promise<ArrayBuffer | null> {
  const inputInfo = model.inputs?.[0];
  if (!inputInfo) return null;

  const dims = getInputSize(inputInfo);
  if (!dims) return null;

  const width = TFLITE_MODEL_CONFIG.input.size.width || dims.width;
  const height = TFLITE_MODEL_CONFIG.input.size.height || dims.height;

  const { width: imageWidth, height: imageHeight } = await getImageSize(imageUri);
  const cropSize = Math.min(imageWidth, imageHeight);
  const originX = Math.floor((imageWidth - cropSize) / 2);
  const originY = Math.floor((imageHeight - cropSize) / 2);

  const actions: ImageManipulator.Action[] = [];
  if (TFLITE_MODEL_CONFIG.input.centerCrop) {
    actions.push({
      crop: {
        originX,
        originY,
        width: cropSize,
        height: cropSize,
      },
    });
  }
  actions.push({ resize: { width, height } });

  const resized = await ImageManipulator.manipulateAsync(imageUri, actions, {
    format: ImageManipulator.SaveFormat.JPEG,
    compress: 1,
    base64: true,
  });

  if (!resized.base64) return null;

  const jpegBytes = base64ToUint8Array(resized.base64);
  const decoded = decodeJpeg(jpegBytes, { useTArray: true });

  // `decoded.data` is RGBA, drop alpha => RGB.
  const rgba = decoded.data;
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4] ?? 0;
    const g = rgba[i * 4 + 1] ?? 0;
    const b = rgba[i * 4 + 2] ?? 0;
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
  }

  const dataType = (inputInfo.dataType ?? '').toLowerCase();
  if (dataType.includes('float') || TFLITE_MODEL_CONFIG.input.dtype === 'float32') {
    const f32 = new Float32Array(rgb.length);
    const mean = TFLITE_MODEL_CONFIG.input.normalization.mean;
    const std = TFLITE_MODEL_CONFIG.input.normalization.std;
    for (let i = 0; i < rgb.length; i++) {
      f32[i] = (rgb[i]! - mean) / std;
    }
    return f32.buffer.slice(f32.byteOffset, f32.byteOffset + f32.byteLength);
  }

  // Default to uint8.
  return rgb.buffer.slice(rgb.byteOffset, rgb.byteOffset + rgb.byteLength);
}

function toFloatScores(output0: unknown): Float32Array | null {
  if (output0 == null) return null;

  // react-native-fast-tflite returns ArrayBuffer per output tensor.
  if (output0 instanceof ArrayBuffer) {
    return new Float32Array(output0);
  }
  if (ArrayBuffer.isView(output0)) {
    const view = output0 as ArrayBufferView;
    return new Float32Array(view.buffer, view.byteOffset, view.byteLength / 4);
  }
  if (Array.isArray(output0)) {
    // Nested batch form: [[p0, p1, p2]] or flat [p0, p1, p2]
    const flat = (output0 as unknown[]).flat(Infinity) as number[];
    if (flat.length < 2 || flat.some((n) => typeof n !== 'number')) return null;
    return Float32Array.from(flat);
  }

  const arrLike = output0 as { length?: number } & ArrayLike<number>;
  if (typeof arrLike.length === 'number' && arrLike.length >= 2) {
    return Float32Array.from({ length: arrLike.length }, (_, i) => Number(arrLike[i]));
  }
  return null;
}

function interpretFirstOutput(
  output0: unknown
): { classIndex: number; confidence: number; scores: number[]; topTwoDelta: number } | null {
  const raw = toFloatScores(output0);
  if (!raw || raw.length < 2) return null;

  const maybeHasLogits = Number(raw[argMax(raw).index] ?? 0) > 1;
  const scores = Array.from(raw, (v) => normalizeConfidence(Number(v), maybeHasLogits));

  const ranked = scores
    .map((value, index) => ({ index, value }))
    .sort((a, b) => b.value - a.value);
  const best = ranked[0]!;
  const second = ranked[1];
  const topTwoDelta = second ? Math.abs(best.value - second.value) : 1;

  return {
    classIndex: best.index,
    confidence: best.value,
    scores,
    topTwoDelta,
  };
}

export async function runTfliteClassifier(imageUri: string): Promise<TfliteClass | null> {
  try {
    const model = await getModel();
    if (!model) {
      console.warn('[TFLite] Model unavailable');
      return null;
    }
    logModelInfoOnce(model);

    const inputBuffer = await preprocessImageToInputBuffer(imageUri, model);
    if (!inputBuffer) {
      console.warn('[TFLite] Preprocess failed for', imageUri);
      return null;
    }

    const outputs = await model.run([inputBuffer]);
    const output0 = outputs[0];

    const interpreted = interpretFirstOutput(output0);
    if (!interpreted) {
      console.warn('[TFLite] Could not interpret output', output0);
      return null;
    }

    const { classIndex, confidence, scores, topTwoDelta } = interpreted;
    const disease = CLASS_MAP[classIndex];
    if (!disease) {
      console.warn('[TFLite] Class index out of range', classIndex);
      return null;
    }

    console.log('[TFLite] Prediction:', { disease, confidence, classIndex, topTwoDelta });
    return {
      disease,
      confidence,
      scores,
      topTwoDelta,
    };
  } catch (err) {
    console.warn('[TFLite] Classifier error:', err);
    return null;
  }
}

// Helper for tuning logic in classifier.ts
export function isConfident(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}

