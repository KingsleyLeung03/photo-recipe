
"use client";

/**
 * Compresses an image data URI.
 * @param dataUri The original image data URI.
 * @param quality The quality for JPEG compression (0.0 to 1.0). Defaults to 0.7.
 * @param maxDimension The maximum width or height for the compressed image. Defaults to 800.
 * @returns A Promise that resolves with the compressed image data URI, or the original if compression fails.
 */
export async function compressDataUri(
  dataUri: string,
  quality: number = 0.7,
  maxDimension: number = 800
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUri.startsWith('data:image')) {
      console.warn('compressDataUri: Not an image data URI, returning original.');
      resolve(dataUri);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width === 0 || height === 0) {
        console.warn('compressDataUri: Image has zero dimensions, returning original.');
        resolve(dataUri);
        return;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      // Ensure width and height are at least 1px
      width = Math.max(1, width);
      height = Math.max(1, height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('compressDataUri: Failed to get canvas context for image compression.');
        resolve(dataUri); // Fallback to original if context fails
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`compressDataUri: Original size (approx chars): ${dataUri.length}, Compressed size: ${compressedDataUrl.length}`);
        resolve(compressedDataUrl);
      } catch (e) {
        console.error('compressDataUri: Error compressing image to JPEG:', e);
        // Try PNG as a fallback if JPEG fails (e.g., transparency issues with some image types)
        try {
            const pngDataUrl = canvas.toDataURL('image/png');
            console.log(`compressDataUri: Original size (approx chars): ${dataUri.length}, Compressed to PNG size: ${pngDataUrl.length}`);
            resolve(pngDataUrl);
        } catch (pngError) {
            console.error('compressDataUri: Error compressing image to PNG:', pngError);
            resolve(dataUri); // Ultimate fallback
        }
      }
    };
    img.onerror = (err) => {
      console.error('compressDataUri: Failed to load image for compression:', err);
      resolve(dataUri); // Fallback to original if image doesn't load
    };
    img.src = dataUri;
  });
}
