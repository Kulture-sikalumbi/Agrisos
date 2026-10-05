/**
 * Lightweight offline checks to reject useless / fake-looking inputs
 * before we show disease advice.
 */
import * as ImageManipulator from 'expo-image-manipulator';
import { decode as decodeJpeg } from 'jpeg-js';

export type ImageRejectCode =
  | 'too_small'
  | 'too_dark'
  | 'too_bright'
  | 'too_flat'
  | 'not_leaf'
  | 'decode_failed';

export type ImageQualityResult =
  | { ok: true }
  | { ok: false; code: ImageRejectCode; message: string };

const REJECT_MESSAGES: Record<ImageRejectCode, string> = {
  too_small: 'Photo is too small. Move closer and take a clearer leaf photo.',
  too_dark: 'Photo is too dark. Retake outside in good daylight.',
  too_bright: 'Photo is too bright / washed out. Avoid direct flash glare.',
  too_flat:
    'This does not look like a useful leaf photo (blank, blurry, or not a plant). Retake with one cassava leaf filling the frame.',
  not_leaf:
    'This does not look like a cassava leaf. Point the camera at one leaf so it fills the frame.',
  decode_failed: 'Could not read this image. Try another photo.',
};

function base64ToUint8Array(base64: string): Uint8Array {
  const atobFn = globalThis.atob;
  if (typeof atobFn !== 'function') {
    throw new Error('Base64 decode not available');
  }
  const binary = atobFn(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Hue (degrees, 0-360) and saturation/value (0-1) from 8-bit RGB. */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const v = max;
  const s = max === 0 ? 0 : delta / max;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

/**
 * Cassava leaves (healthy or diseased) are dominated by green / yellow-green
 * tones where the green channel is never far behind red. This is a loose
 * heuristic, not a leaf detector — it cannot tell a cassava leaf apart from
 * any other green/yellow object (grass, another plant, a green shirt) — but
 * it does reliably catch obviously-wrong warm-toned photos (vehicles, skin,
 * wood, brick, rust, sunsets) where red clearly dominates green.
 */
function isPlantLikeColor(r: number, g: number, b: number): boolean {
  const { h, s, v } = rgbToHsv(r, g, b);
  if (s < 0.18 || v < 0.08 || v > 0.97) return false;
  // Real foliage (even yellowing/diseased) keeps green at or above red.
  // Orange/red/brown objects (paint, skin, rust, wood, sunsets) have red
  // clearly ahead of green — this is what a hue check alone can miss,
  // since orange and yellow-green hues sit close together on the wheel.
  if (g < r - 10) return false;
  return h >= 35 && h <= 170;
}

const MIN_MEAN_LUMA = 25;
const MAX_MEAN_LUMA = 240;
const MIN_LUMA_STD_DEV = 6;
const MIN_VEGETATION_RATIO = 0.18;

/**
 * Fast validity + content gate on a downscaled JPEG.
 * Rejects images that cannot be decoded, are too small, too dark/bright,
 * essentially blank/blurry (flat), or clearly don't contain leaf-like colors
 * (i.e. not a plant at all).
 */
export async function assessImageQuality(imageUri: string): Promise<ImageQualityResult> {
  try {
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 96 } }],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: 0.7,
        base64: true,
      }
    );

    if (!resized.base64) {
      return { ok: false, code: 'decode_failed', message: REJECT_MESSAGES.decode_failed };
    }
    if ((resized.width ?? 0) < 40 || (resized.height ?? 0) < 40) {
      return { ok: false, code: 'too_small', message: REJECT_MESSAGES.too_small };
    }

    const decoded = decodeJpeg(base64ToUint8Array(resized.base64), { useTArray: true });
    const pixelCount = decoded.width * decoded.height;
    if (pixelCount < 100) {
      return { ok: false, code: 'too_small', message: REJECT_MESSAGES.too_small };
    }

    const data = decoded.data;
    let sumLuma = 0;
    let sumLumaSq = 0;
    let vegetationCount = 0;

    for (let i = 0; i < pixelCount; i++) {
      const r = data[i * 4] ?? 0;
      const g = data[i * 4 + 1] ?? 0;
      const b = data[i * 4 + 2] ?? 0;
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      sumLuma += luma;
      sumLumaSq += luma * luma;
      if (isPlantLikeColor(r, g, b)) vegetationCount++;
    }

    const meanLuma = sumLuma / pixelCount;
    const variance = Math.max(0, sumLumaSq / pixelCount - meanLuma * meanLuma);
    const lumaStdDev = Math.sqrt(variance);
    const vegetationRatio = vegetationCount / pixelCount;

    if (meanLuma < MIN_MEAN_LUMA) {
      return { ok: false, code: 'too_dark', message: REJECT_MESSAGES.too_dark };
    }
    if (meanLuma > MAX_MEAN_LUMA) {
      return { ok: false, code: 'too_bright', message: REJECT_MESSAGES.too_bright };
    }
    if (lumaStdDev < MIN_LUMA_STD_DEV) {
      return { ok: false, code: 'too_flat', message: REJECT_MESSAGES.too_flat };
    }
    if (vegetationRatio < MIN_VEGETATION_RATIO) {
      return { ok: false, code: 'not_leaf', message: REJECT_MESSAGES.not_leaf };
    }

    return { ok: true };
  } catch {
    return { ok: false, code: 'decode_failed', message: REJECT_MESSAGES.decode_failed };
  }
}
