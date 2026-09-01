import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Trash2,
  Check,
  RefreshCw,
  Camera,
  AlertCircle,
  Info,
} from 'lucide-react';

import {
  Product,
  ProductCategory,
  StockStatus,
} from '../../../types';

import {
  handleImageError,
} from '../../../utils/imageFallback';

import {
  compressImageFile,
} from '../../../utils/imageCompressor';

interface ProductFormModalProps {
  isOpen: boolean;
  product: Partial<Product> | null;
  products: Product[];

  onChange: (product: Partial<Product>) => void;
  onClose: () => void;
  onSave: (event: React.FormEvent) => void;

  showToast: (
    title: string,
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
}

const STOCK_UNAVAILABILITY_PRESETS = [
  'Sold Out - Awaiting New Weaving Batch from Kanchipuram',
  'Reserved for Bespoke Bridal Client',
  'Temporary Out of Stock - Restocking Soon',
  'Seasonal Archive / Not in Production',
  'Discontinued Edition',
  'Exclusively Made to Order',
];

type ProductImageKey =
  | 'main'
  | 'front'
  | 'back'
  | 'detail'
  | 'wearing';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  product,
  products,
  onChange,
  onClose,
  onSave,
  showToast,
}) => {
  const [compressingAngle, setCompressingAngle] =
    useState<ProductImageKey | null>(null);

  const [compressionStats, setCompressionStats] = useState<
    Record<string, string>
  >({});

  const mainImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !product) {
    return null;
  }

  const updateProduct = (changes: Partial<Product>) => {
    onChange({
      ...product,
      ...changes,
    });
  };

  const updateImages = (
    key: ProductImageKey,
    value: string
  ) => {
    onChange({
      ...product,
      images: {
        ...(product.images || {
          main: '',
        }),
        [key]: value,
      },
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageKey: ProductImageKey
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setCompressingAngle(imageKey);

      const result = await compressImageFile(
        file,
        1400,
        0.82
      );

      updateImages(imageKey, result.dataUrl);

      setCompressionStats((previous) => ({
        ...previous,
        [imageKey]: `${result.formattedCompressed} (${result.savingsPercentage}% smaller)`,
      }));

      showToast(
        'Photo Compressed & Ready',
        `${imageKey.toUpperCase()} view optimized to ${result.formattedCompressed} (${result.savingsPercentage}% size reduction).`
      );
    } catch (error) {
      console.error(
        'Image compression failed:',
        error
      );

      showToast(
        'Image Error',
        'Could not compress this image file. Please try another photo.',
        'error'
      );
    } finally {
      setCompressingAngle(null);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (
    imageKey: ProductImageKey
  ) => {
    updateImages(imageKey, '');

    setCompressionStats((previous) => {
      const next = {
        ...previous,
      };

      delete next[imageKey];

      return next;
    });
  };

  const isEditing = Boolean(
    product.id &&
      products.some((item) => item.id === product.id)
  );

  const imageDefinitions: Array<{
    key: Exclude<ProductImageKey, 'main'>;
    label: string;
    hint: string;
  }> = [
    {
      key: 'front',
      label: 'Front Drape View',
      hint: 'Full-length front presentation',
    },
    {
      key: 'back',
      label: 'Back / Pallu View',
      hint: 'Pallu or blouse back detail',
    },
    {
      key: 'detail',
      label: 'Detail & Craft Close-Up',
      hint: 'Zari, border or texture close-up',
    },
    {
      key: 'wearing',
      label: 'Model Drape View',
      hint: 'Occasion styling or worn look',
    },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-rose-100">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#241B20]">
              {isEditing
                ? 'Edit Boutique Product'
                : 'Add New Boutique Piece'}
            </h3>

            <p className="text-[11px] text-[#8C5D6C] mt-1">
              Manage product information, stock and boutique photography.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-50 text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={onSave}
          className="space-y-4 text-xs"
        >

          {/* Product Title */}
          <div>
            <label className="font-bold text-[#9E315A] uppercase block mb-1">
              Product Title
            </label>

            <input
              type="text"
              required
              placeholder="e.g. Royal Maroon Kanjivaram Silk Saree"
              value={product.name || ''}
              onChange={(event) =>
                updateProduct({
                  name: event.target.value,
                })
              }
              className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20] outline-none focus:border-[#9E315A]"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Category
              </label>

              <select
                value={product.category || 'sarees'}
                onChange={(event) =>
                  updateProduct({
                    category:
                      event.target.value as ProductCategory,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              >
                <option value="sarees">
                  Sarees
                </option>

                <option value="jewellery">
                  Jewellery & Bangles
                </option>

                <option value="performance">
                  Dance Performance Edit
                </option>

                <option value="lehengas">
                  Lehengas
                </option>

                <option value="shalwar">
                  Shalwar
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Subcategory / Style
              </label>

              <input
                type="text"
                placeholder="e.g. Kanjivaram Silk, Kundan Bangles"
                value={product.subcategory || ''}
                onChange={(event) =>
                  updateProduct({
                    subcategory: event.target.value,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              />
            </div>

          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Selling Price (£)
              </label>

              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 145"
                value={
                  product.price === 0
                    ? ''
                    : product.price || ''
                }
                onChange={(event) =>
                  updateProduct({
                    price:
                      Number(event.target.value) || 0,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Original Price (£)
              </label>

              <input
                type="number"
                min="0"
                placeholder="e.g. 185"
                value={product.originalPrice || ''}
                onChange={(event) =>
                  updateProduct({
                    originalPrice:
                      Number(event.target.value) ||
                      undefined,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Stock Status
              </label>

              <select
                value={
                  product.stockStatus || 'In Stock'
                }
                onChange={(event) =>
                  updateProduct({
                    stockStatus:
                      event.target.value as StockStatus,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              >
                <option value="In Stock">
                  In Stock
                </option>

                <option value="Low Stock">
                  Low Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>

                <option value="Pre-Order">
                  Pre-Order
                </option>

                <option value="Coming Soon">
                  Coming Soon
                </option>
              </select>
            </div>

          </div>

          {/* Stock Reason */}
          {(product.stockStatus === 'Out of Stock' ||
            product.stockStatus === 'Unavailable' ||
            product.stockStatus === 'Low Stock') && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">

              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Info className="w-3.5 h-3.5" />

                <span>
                  Stock Status Note / Reason for Customers:
                </span>
              </div>

              <input
                type="text"
                placeholder="e.g. Sold Out - Awaiting New Weaving Batch from Kanchipuram"
                value={
                  product.unavailabilityReason || ''
                }
                onChange={(event) =>
                  updateProduct({
                    unavailabilityReason:
                      event.target.value,
                  })
                }
                className="w-full bg-white border border-amber-200 rounded-xl p-2 text-xs text-[#241B20]"
              />

              <div className="flex items-center gap-1.5 flex-wrap pt-1">

                <span className="text-[10px] text-amber-800 font-semibold">
                  Quick Presets:
                </span>

                {STOCK_UNAVAILABILITY_PRESETS.map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        updateProduct({
                          unavailabilityReason:
                            preset,
                        })
                      }
                      className="text-[10px] bg-white hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 cursor-pointer"
                    >
                      {preset}
                    </button>
                  )
                )}

              </div>
            </div>
          )}

          {/* Photography */}
          <div className="p-5 rounded-2xl bg-[#FFF8FA] border border-rose-200/80 space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-rose-200/60">

              <div>
                <label className="font-bold text-[#9E315A] uppercase text-xs sm:text-sm block">
                  Product Photography & Angles
                </label>

                <span className="text-[11px] text-[#8C5D6C]">
                  Upload photos directly from your device.
                  Images are automatically compressed to WebP.
                </span>
              </div>

              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full shrink-0 self-start">
                * Main Image Required
              </span>

            </div>

            {/* Main image */}
            <div className="bg-white p-4 rounded-2xl border-2 border-rose-200 shadow-sm space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider">
                    1. Main Product Photo{' '}
                    <span className="text-rose-600">
                      * Required
                    </span>
                  </span>

                  {product.images?.main && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />

                      <span>
                        {compressionStats.main ||
                          'Ready & Compressed'}
                      </span>
                    </span>
                  )}

                </div>

                <span className="text-[10px] text-[#8C5D6C]">
                  Primary showcase
                </span>

              </div>

              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleImageUpload(
                    event,
                    'main'
                  )
                }
                className="hidden"
              />

              {product.images?.main ? (

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FFF8FA] p-3 rounded-xl border border-rose-100">

                  <div className="w-24 h-32 rounded-xl bg-white border border-rose-200 overflow-hidden shrink-0 shadow-sm relative">

                    <img
                      src={product.images.main}
                      alt="Main Preview"
                      className="w-full h-full object-cover"
                      onError={(event) =>
                        handleImageError(
                          event,
                          'general'
                        )
                      }
                    />

                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      MAIN
                    </span>

                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">

                    <p className="text-xs font-semibold text-[#241B20]">
                      Main photo uploaded and ready.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          mainImageInputRef.current?.click()
                        }
                        className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace Main Photo
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage('main')
                        }
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    mainImageInputRef.current?.click()
                  }
                  disabled={
                    compressingAngle === 'main'
                  }
                  className="w-full border-2 border-dashed border-rose-300 hover:border-[#9E315A] bg-[#FFF5F8] hover:bg-rose-100/50 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center"
                >

                  {compressingAngle === 'main' ? (

                    <div className="flex items-center gap-2 text-xs font-bold text-[#9E315A]">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Auto-compressing main photo...
                    </div>

                  ) : (

                    <>
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#9E315A]">
                        <Camera className="w-5 h-5" />
                      </div>

                      <div>
                        <span className="text-xs font-bold text-[#9E315A] block">
                          Click to Upload Main Product Photo
                        </span>

                        <span className="text-[11px] text-[#8C5D6C] block mt-0.5">
                          JPG, PNG, WebP supported
                        </span>
                      </div>
                    </>

                  )}

                </button>

              )}

            </div>

            {/* Additional images */}
            <div className="space-y-2 pt-1">

              <div className="flex items-center justify-between">

                <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider">
                  2. Additional Perspective Views
                </span>

                <span className="text-[10px] text-[#8C5D6C]">
                  Front, Back, Detail & Model
                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {imageDefinitions.map(
                  ({
                    key,
                    label,
                    hint,
                  }) => {

                    const imageValue =
                      product.images?.[key];

                    const isCompressing =
                      compressingAngle === key;

                    const inputId =
                      `product-image-${key}`;

                    return (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-xl border border-rose-200 flex flex-col justify-between space-y-2 shadow-sm"
                      >

                        <div>

                          <div className="flex items-center justify-between mb-1">

                            <span className="text-[11px] font-bold text-[#241B20]">
                              {label}
                            </span>

                            {imageValue && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                ✓ Added
                              </span>
                            )}

                          </div>

                          <p className="text-[9px] text-[#8C5D6C]">
                            {hint}
                          </p>

                        </div>

                        <input
                          id={inputId}
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleImageUpload(
                              event,
                              key
                            )
                          }
                          className="hidden"
                        />

                        {imageValue ? (

                          <div className="space-y-2">

                            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-rose-100 bg-[#FFF5F8]">

                              <img
                                src={imageValue}
                                alt={label}
                                className="w-full h-full object-cover"
                                onError={(event) =>
                                  handleImageError(
                                    event,
                                    'general'
                                  )
                                }
                              />

                              {compressionStats[key] && (
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[7px] px-1 rounded">
                                  {compressionStats[key]}
                                </span>
                              )}

                            </div>

                            <div className="flex items-center gap-1.5">

                              <label
                                htmlFor={inputId}
                                className="flex-1 text-center bg-rose-50 hover:bg-rose-100 text-[#9E315A] text-[10px] font-bold py-1.5 rounded-lg border border-rose-200 cursor-pointer"
                              >
                                Replace
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveImage(key)
                                }
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          </div>

                        ) : (

                          <label
                            htmlFor={inputId}
                            className="border border-dashed border-rose-200 hover:border-[#9E315A] bg-[#FFF8FA] hover:bg-rose-50/70 aspect-[3/4] rounded-xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors"
                          >

                            {isCompressing ? (

                              <div className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9E315A]">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>
                                  Compressing...
                                </span>
                              </div>

                            ) : (

                              <>
                                <Upload className="w-5 h-5 text-rose-400 mb-1" />

                                <span className="text-[10px] font-bold text-[#9E315A] block">
                                  Upload {key}
                                </span>

                                <span className="text-[8px] text-[#8C5D6C] block mt-0.5">
                                  Browse photo
                                </span>
                              </>

                            )}

                          </label>

                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {!product.images?.main && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />

                <span>
                  Please upload at least 1 image.
                  Products cannot be published without a
                  primary photograph.
                </span>
              </div>
            )}

          </div>

          {/* Material / Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Fabric / Material
              </label>

              <input
                type="text"
                placeholder="e.g. Pure Kanjivaram Silk with Zari Border"
                value={product.material || ''}
                onChange={(event) =>
                  updateProduct({
                    material:
                      event.target.value,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              />
            </div>

            <div>
              <label className="font-bold text-[#9E315A] uppercase block mb-1">
                Primary Color
              </label>

              <input
                type="text"
                placeholder="e.g. Peacock Blue & Gold"
                value={product.color || ''}
                onChange={(event) =>
                  updateProduct({
                    color: event.target.value,
                  })
                }
                className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20]"
              />
            </div>

          </div>

          {/* Description */}
          <div>

            <label className="font-bold text-[#9E315A] uppercase block mb-1">
              Detailed Description
            </label>

            <textarea
              rows={3}
              value={product.description || ''}
              onChange={(event) =>
                updateProduct({
                  description:
                    event.target.value,
                })
              }
              className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20] resize-none"
            />

          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-4 pt-2">

            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                checked={Boolean(product.isPreOrder)}
                onChange={(event) =>
                  updateProduct({
                    isPreOrder:
                      event.target.checked,
                  })
                }
                className="rounded text-[#9E315A]"
              />

              <span>
                Pre-Order Item
              </span>

            </label>

            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                checked={Boolean(
                  product.isDancePerformance
                )}
                onChange={(event) =>
                  updateProduct({
                    isDancePerformance:
                      event.target.checked,
                  })
                }
                className="rounded text-[#9E315A]"
              />

              <span>
                Dance Performance Collection
              </span>

            </label>

            <label className="flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                checked={Boolean(product.isOffer)}
                onChange={(event) =>
                  updateProduct({
                    isOffer:
                      event.target.checked,
                  })
                }
                className="rounded text-[#9E315A]"
              />

              <span>
                Special Offer / Sale
              </span>

            </label>

          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-rose-100 flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!product.images?.main}
              className="px-6 py-2 bg-[#9E315A] hover:bg-[#832247] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
            >
              {isEditing
                ? 'Update Piece'
                : 'Save Piece'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};