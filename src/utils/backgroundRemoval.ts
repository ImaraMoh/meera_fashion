/**
 * Advanced Client-Side Brand Logo Background Removal & Auto-Cropping Utility
 * 
 * Takes any brand logo (JPEG, PNG with white/solid background, WebP) and:
 * 1. Analyzes corner & edge pixels to detect background color (white, off-white, cream, dark, etc.)
 * 2. Removes background with smooth anti-aliased edge feathering (zero jagged white halos)
 * 3. Auto-trims unnecessary transparent empty space around the logo
 * 4. Outputs a crisp transparent PNG/WebP data URL ready for instant use across navbar, footer, invoices
 */

export interface LogoProcessingResult {
  dataUrl: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
  detectedBgColor: string;
  isTransparent: boolean;
}

export interface RemoveBackgroundOptions {
  tolerance?: number; // 15 to 70 (default 38)
  feather?: number; // edge smoothing radius (default 18)
  trimPadding?: number; // padding around cropped logo in px (default 8)
  forceWhiteBackgroundRemoval?: boolean;
}

/**
 * Remove background from an image file or Data URL and trim excess padding
 */
export async function removeLogoBackground(
  input: File | string,
  options: RemoveBackgroundOptions = {}
): Promise<LogoProcessingResult> {
  const {
    tolerance = 38,
    feather = 20,
    trimPadding = 8,
    forceWhiteBackgroundRemoval = true,
  } = options;

  let originalSize = 0;
  let rawDataUrl = '';

  if (typeof input === 'string') {
    rawDataUrl = input;
    const base64Part = input.split(',')[1] || '';
    originalSize = Math.round((base64Part.length * 3) / 4);
  } else {
    originalSize = input.size;
    rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read logo file'));
      reader.readAsDataURL(input);
    });
  }

  return new Promise<LogoProcessingResult>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => {
      reject(new Error('Failed to load image for background removal'));
    };

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      // Scale to max 1200px for optimal logo fidelity
      const maxDim = 1200;
      let targetW = w;
      let targetH = h;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          targetH = Math.round((h * maxDim) / w);
          targetW = maxDim;
        } else {
          targetW = Math.round((w * maxDim) / h);
          targetH = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({
          dataUrl: rawDataUrl,
          originalSize,
          processedSize: originalSize,
          width: targetW,
          height: targetH,
          detectedBgColor: '#FFFFFF',
          isTransparent: false,
        });
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      // 1. Sample Corner & Perimeter Pixels to Detect Background Color
      const cornerSamples: { r: number; g: number; b: number; a: number }[] = [];
      const samplePoints = [
        [2, 2],
        [targetW - 3, 2],
        [2, targetH - 3],
        [targetW - 3, targetH - 3],
        [Math.floor(targetW / 2), 2],
        [Math.floor(targetW / 2), targetH - 3],
        [2, Math.floor(targetH / 2)],
        [targetW - 3, Math.floor(targetH / 2)],
      ];

      for (const [sx, sy] of samplePoints) {
        const idx = (sy * targetW + sx) * 4;
        cornerSamples.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          a: data[idx + 3],
        });
      }

      // Check if image already has significant transparent pixels
      let transparentPixelCount = 0;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 50) transparentPixelCount++;
      }
      const alreadyHasAlpha = transparentPixelCount > (data.length / 16) * 0.05;

      // Average corner RGB
      let bgR = 0, bgG = 0, bgB = 0;
      cornerSamples.forEach((s) => {
        bgR += s.r;
        bgG += s.g;
        bgB += s.b;
      });
      bgR = Math.round(bgR / cornerSamples.length);
      bgG = Math.round(bgG / cornerSamples.length);
      bgB = Math.round(bgB / cornerSamples.length);

      const detectedBgColor = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`.toUpperCase();

      // 2. Perform Intelligent Background Extraction
      const isWhiteBg = (bgR > 225 && bgG > 225 && bgB > 225) || forceWhiteBackgroundRemoval;

      const innerTol = tolerance;
      const outerTol = tolerance + feather;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Euclidean color distance from detected background
        const dist = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );

        // Near-white detection
        const isNearWhite = r > 240 && g > 240 && b > 240;
        const isVeryLight = r > 248 && g > 248 && b > 248;

        if (isWhiteBg && isVeryLight) {
          data[i + 3] = 0; // Pure transparent
        } else if (dist <= innerTol) {
          data[i + 3] = 0; // Transparent
        } else if (dist < outerTol) {
          // Soft anti-aliased gradient falloff
          const factor = (dist - innerTol) / (outerTol - innerTol);
          data[i + 3] = Math.round(a * factor);
        } else if (isWhiteBg && isNearWhite) {
          // Smooth luminance based alpha
          const avg = (r + g + b) / 3;
          const lumAlpha = Math.max(0, 1 - (avg - 235) / 20);
          data[i + 3] = Math.min(a, Math.round(lumAlpha * 255));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // 3. Auto-Trim / Crop Transparent Bounding Box
      let minX = targetW, minY = targetH, maxX = 0, maxY = 0;
      let hasVisiblePixels = false;

      for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
          const alpha = data[(y * targetW + x) * 4 + 3];
          if (alpha > 15) {
            hasVisiblePixels = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      let finalCanvas = canvas;
      let finalW = targetW;
      let finalH = targetH;

      if (hasVisiblePixels && minX <= maxX && minY <= maxY) {
        // Apply comfortable padding
        const cropX = Math.max(0, minX - trimPadding);
        const cropY = Math.max(0, minY - trimPadding);
        const cropW = Math.min(targetW - cropX, (maxX - minX + 1) + trimPadding * 2);
        const cropH = Math.min(targetH - cropY, (maxY - minY + 1) + trimPadding * 2);

        if (cropW > 10 && cropH > 10) {
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropW;
          croppedCanvas.height = cropH;
          const cropCtx = croppedCanvas.getContext('2d');

          if (cropCtx) {
            cropCtx.drawImage(
              canvas,
              cropX, cropY, cropW, cropH,
              0, 0, cropW, cropH
            );
            finalCanvas = croppedCanvas;
            finalW = cropW;
            finalH = cropH;
          }
        }
      }

      // 4. Export as Transparent PNG
      const transparentDataUrl = finalCanvas.toDataURL('image/png');
      const base64Str = transparentDataUrl.split(',')[1] || '';
      const processedSize = Math.round((base64Str.length * 3) / 4);

      resolve({
        dataUrl: transparentDataUrl,
        originalSize,
        processedSize,
        width: finalW,
        height: finalH,
        detectedBgColor,
        isTransparent: true,
      });
    };

    img.src = rawDataUrl;
  });
}
