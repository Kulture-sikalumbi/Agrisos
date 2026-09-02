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

/**
 * Fast quality gate on a downscaled JPEG.
 * Rejects dark/bright/blank images so we do not invent disease advice.
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
    const rgba = decoded.data;
    const pixelCount = decoded.width * decoded.height;
    if (pixelCount < 100) {
      return { ok: false, code: 'too_small', message: REJECT_MESSAGES.too_small };
    }

    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < pixelCount; i++) {
      const r = rgba[i * 4] ?? 0;
      const g = rgba[i * 4 + 1] ?? 0;
      const b = rgba[i * 4 + 2] ?? 0;
      // Perceived luminance
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += y;
      sumSq += y * y;
    }

    const mean = sum / pixelCount;
    const variance = sumSq / pixelCount - mean * mean;
    const std = Math.sqrt(Math.max(0, variance));

    if (mean < 28) {
      return { ok: false, code: 'too_dark', message: REJECT_MESSAGES.too_dark };
    }
    if (mean > 235) {
      return { ok: false, code: 'too_bright', message: REJECT_MESSAGES.too_bright };
    }
    // Very low contrast → blank wall, solid color, heavy blur, non-leaf junk
    if (std < 12) {
      return { ok: false, code: 'too_flat', message: REJECT_MESSAGES.too_flat };
    }

    return { ok: true };
  } catch {
    return { ok: false, code: 'decode_failed', message: REJECT_MESSAGES.decode_failed };
  }
}
