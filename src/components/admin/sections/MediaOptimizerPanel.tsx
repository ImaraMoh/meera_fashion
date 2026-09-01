import React from 'react';
import {
  Upload,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface MediaOptimizerPanelProps {
  uploadedImagePreview: string | null;
  compressionRatio: string;
  isCompressing: boolean;
  handleImageFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export const MediaOptimizerPanel: React.FC<
  MediaOptimizerPanelProps
> = ({
  uploadedImagePreview,
  compressionRatio,
  isCompressing,
  handleImageFileChange,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Upload */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">

          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-[#241B20]">
              Image Compression Engine
            </h3>

            <p className="text-xs text-[#8C5D6C]">
              All photos uploaded to boutique products are
              automatically compressed into optimized WebP
              formats for lightning-fast page loading.
            </p>
          </div>

          <label className="block border-2 border-dashed border-rose-200 hover:border-[#9E315A] rounded-3xl p-8 text-center cursor-pointer transition-colors bg-rose-50/40">

            <Upload className="w-10 h-10 text-[#9E315A] mx-auto mb-2" />

            <span className="font-serif font-bold text-sm text-[#241B20] block">
              Test Upload &amp; Optimization
            </span>

            <span className="text-xs text-[#8C5D6C] block mt-1">
              Drag &amp; drop or browse high-resolution JPG /
              PNG / WebP photo
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </label>

          <div className="bg-[#FFF5F8] p-4 rounded-2xl border border-rose-200 text-xs space-y-1.5">

            <div className="flex items-center gap-2 text-[#9E315A] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Compression Analytics</span>
            </div>

            <p className="text-[#5A4550] leading-relaxed">
              {compressionRatio}
            </p>

            {isCompressing && (
              <p className="text-[#9E315A] font-semibold flex items-center gap-1 mt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Optimizing image resolution &amp; WebP encoding...
              </p>
            )}

          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center justify-center">

          <p className="text-xs font-bold text-[#8C5D6C] uppercase mb-3">
            Compressed Image Preview
          </p>

          <div className="relative w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-rose-200 bg-[#FFF5F8] shadow-sm">

            <img
              src={
                uploadedImagePreview ||
                '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg'
              }
              alt="Compressed preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              OPTIMIZED WEBP
            </span>

          </div>
        </div>

      </div>
    </div>
  );
};