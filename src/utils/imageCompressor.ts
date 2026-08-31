/**
 * High-performance client-side image compression utility
 * Converts any uploaded image (JPEG, PNG, HEIC, WebP) into an optimized,
 * clean WebP/JPEG data URL with max dimension constraints and smooth rendering.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  formattedOriginal: string;
  formattedCompressed: string;
  savingsPercentage: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses an image file with automatic dimension clamping and quality optimization.
 * @param file The uploaded File from input[type="file"]
 * @param maxDimension Maximum width or height (defaults to 900px, optimal for fast mobile loading and crisp display)
 * @param quality Compression quality 0..1 (defaults to 0.75)
 */
export async function compressImageFile(
  file: File,
  maxDimension = 900,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read selected image file.'));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to decode image data.'));
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw to HTML5 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const rawUrl = e.target?.result as string;
          resolve({
            dataUrl: rawUrl,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
            formattedOriginal: formatFileSize(file.size),
            formattedCompressed: formatFileSize(file.size),
            savingsPercentage: 0,
          });
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try modern WebP format first, fallback to standard JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate approximate compressed byte size from Base64
        const base64Length = dataUrl.split(',')[1]?.length || 0;
        const compressedSize = Math.round((base64Length * 3) / 4);

        const savings = file.size > compressedSize
          ? Math.round(((file.size - compressedSize) / file.size) * 100)
          : 0;

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
          width,
          height,
          formattedOriginal: formatFileSize(file.size),
          formattedCompressed: formatFileSize(compressedSize),
          savingsPercentage: savings,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
