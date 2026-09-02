declare module 'jpeg-js' {
  export type DecodedJpeg = {
    width: number;
    height: number;
    // Raw pixel data in RGBA format
    data: Uint8Array;
  };

  export function decode(
    data: Uint8Array,
    options?: { useTArray?: boolean }
  ): DecodedJpeg;
}

