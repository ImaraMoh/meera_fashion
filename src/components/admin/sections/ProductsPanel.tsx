import React from 'react';
import {
  X,
  Package,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

import { Product, ProductCategory, StockStatus } from '../../../types';
import {
  handleImageError,
  getOptimizedImageUrl,
} from '../../../utils/imageFallback';

interface ProductsPanelProps {
  products: Product[];

  productSearch: string;
  setProductSearch: React.Dispatch<React.SetStateAction<string>>;

  productCategoryFilter: string;
  setProductCategoryFilter: React.Dispatch<React.SetStateAction<string>>;

  productStockFilter: string;
  setProductStockFilter: React.Dispatch<React.SetStateAction<string>>;

  adminProductPage: number;
  setAdminProductPage: React.Dispatch<React.SetStateAction<number>>;

  adminProductsPerPage: number;

  handleOpenAddProduct: () => void;
  handleOpenEditProduct: (product: Product) => void;
  handleDeleteProduct: (product: Product) => void;
  handleQuickStockStatusChange: (
    productId: string,
    status: StockStatus
  ) => void;
}

export const ProductsPanel: React.FC<ProductsPanelProps> = ({
  products,

  productSearch,
  setProductSearch,

  productCategoryFilter,
  setProductCategoryFilter,

  productStockFilter,
  setProductStockFilter,

  adminProductPage,
  setAdminProductPage,

  adminProductsPerPage,

  handleOpenAddProduct,
  handleOpenEditProduct,
  handleDeleteProduct,
  handleQuickStockStatusChange,
}) => {
  const filteredProducts = products
    .filter(
      (p) =>
        productCategoryFilter === 'all' ||
        p.category === productCategoryFilter
    )
    .filter(
      (p) =>
        productStockFilter === 'all' ||
        p.stockStatus === productStockFilter
    )
    .filter(
      (p) =>
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.color.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.material.toLowerCase().includes(productSearch.toLowerCase())
    );

  const startIdx =
    (adminProductPage - 1) * adminProductsPerPage;

  const pagedProducts = filteredProducts.slice(
    startIdx,
    startIdx + adminProductsPerPage
  );

  const totalPages =
    Math.ceil(
      filteredProducts.length / adminProductsPerPage
    ) || 1;

  const startItem =
    filteredProducts.length === 0
      ? 0
      : startIdx + 1;

  const endItem = Math.min(
    adminProductPage * adminProductsPerPage,
    filteredProducts.length
  );

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#FFF5F8] px-3.5 py-2 rounded-2xl border border-rose-200/80 flex-1">
          <Package className="w-4 h-4 text-[#9E315A] shrink-0" />

          <input
            type="text"
            placeholder="Search by piece name, fabric, color, ID..."
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setAdminProductPage(1);
            }}
            className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300"
          />

          {productSearch && (
            <button
              onClick={() => {
                setProductSearch('');
                setAdminProductPage(1);
              }}
              className="p-1 text-rose-400 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">

          <select
            value={productCategoryFilter}
            onChange={(e) => {
              setProductCategoryFilter(e.target.value);
              setAdminProductPage(1);
            }}
            className="bg-white border border-rose-200 text-xs font-semibold text-[#241B20] px-3 py-2 rounded-2xl outline-none shadow-2xs"
          >
            <option value="all">
              All Categories ({products.length})
            </option>
            <option value="sarees">Sarees</option>
            <option value="jewellery">
              Jewellery &amp; Bangles
            </option>
            <option value="performance">
              Dance Performance Edit
            </option>
            <option value="lehengas">Lehengas</option>
            <option value="shalwar">Shalwar</option>
          </select>

          <select
            value={productStockFilter}
            onChange={(e) => {
              setProductStockFilter(e.target.value);
              setAdminProductPage(1);
            }}
            className="bg-white border border-rose-200 text-xs font-semibold text-[#241B20] px-3 py-2 rounded-2xl outline-none shadow-2xs"
          >
            <option value="all">
              All Stock Statuses
            </option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Pre-Order">Pre-Order</option>
          </select>

          <button
            onClick={handleOpenAddProduct}
            className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Piece</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-rose-100/90 overflow-hidden shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">

            <thead>
              <tr className="bg-[#FFF5F8] border-b border-rose-100 text-[#8C5D6C] uppercase font-bold text-[10px]">
                <th className="p-4">Piece</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status &amp; Reason</th>
                <th className="p-4">Bangle Sizes</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-rose-50">

              {pagedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[#8C5D6C]"
                  >
                    <Package className="w-8 h-8 text-rose-300 mx-auto mb-2" />

                    <p className="font-serif font-bold text-sm text-[#241B20]">
                      No pieces found
                    </p>

                    <p className="text-xs">
                      Try adjusting your search query or filters
                    </p>
                  </td>
                </tr>
              ) : (
                pagedProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-rose-50/40 transition-colors"
                  >

                    {/* Product */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">

                        <img
                          src={getOptimizedImageUrl(
                            prod.images.main,
                            {
                              width: 120,
                              quality: 60,
                            }
                          )}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) =>
                            handleImageError(e, 'general')
                          }
                          className="w-12 h-14 rounded-xl object-cover border border-rose-200/80 shadow-2xs shrink-0"
                        />

                        <div>
                          <p className="font-serif font-bold text-sm text-[#241B20] line-clamp-1">
                            {prod.name}
                          </p>

                          <p className="text-[10px] text-[#8C5D6C]">
                            {prod.color} • {prod.material}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 uppercase text-[10px] font-bold text-[#9E315A]">
                      {prod.category}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-serif font-bold text-sm text-[#241B20]">
                      £{prod.price}

                      {prod.originalPrice && (
                        <span className="text-[10px] text-rose-300 line-through ml-1 font-light">
                          £{prod.originalPrice}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="space-y-1">

                        <div className="flex items-center gap-1.5">

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.stockStatus === 'In Stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prod.stockStatus === 'Pre-Order'
                                ? 'bg-purple-100 text-purple-800'
                                : prod.stockStatus === 'Out of Stock'
                                ? 'bg-gray-800 text-white'
                                : prod.stockStatus === 'Unavailable'
                                ? 'bg-rose-900 text-rose-100'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {prod.stockStatus}
                          </span>

                          <select
                            value={prod.stockStatus}
                            onChange={(e) =>
                              handleQuickStockStatusChange(
                                prod.id,
                                e.target.value as StockStatus
                              )
                            }
                            className="bg-transparent border border-rose-200 rounded text-[9px] text-[#5A4550] px-1 py-0.5 outline-none cursor-pointer"
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
                          </select>

                        </div>

                        {prod.unavailabilityReason && (
                          <p
                            className="text-[10px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 max-w-[200px] truncate"
                            title={prod.unavailabilityReason}
                          >
                            Note: {prod.unavailabilityReason}
                          </p>
                        )}

                      </div>
                    </td>

                    {/* Bangle Sizes */}
                    <td className="p-4">
                      {prod.bangleSizes ? (
                        <span className="text-[10px] text-[#5A4550]">
                          {prod.bangleSizes.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Badges */}
                    <td className="p-4 space-x-1">
                      {prod.isOffer && (
                        <span className="bg-rose-100 text-[#9E315A] text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Sale
                        </span>
                      )}

                      {prod.isDancePerformance && (
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Dance
                        </span>
                      )}

                      {prod.isNewArrival && (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">

                        <button
                          onClick={() =>
                            handleOpenEditProduct(prod)
                          }
                          className="p-2 text-[#3E2F37] hover:text-[#9E315A] hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProduct(prod)
                          }
                          className="p-2 text-rose-400 hover:text-red-700 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 bg-[#FFF8FA] border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">

          <div className="text-[#8C5D6C]">
            Showing{' '}
            <strong className="text-[#241B20]">
              {startItem}–{endItem}
            </strong>{' '}
            of{' '}
            <strong className="text-[#241B20]">
              {filteredProducts.length}
            </strong>{' '}
            pieces
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">

              <button
                onClick={() =>
                  setAdminProductPage((prev) =>
                    Math.max(1, prev - 1)
                  )
                }
                disabled={adminProductPage <= 1}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 hover:bg-rose-50 cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() =>
                      setAdminProductPage(pageNum)
                    }
                    className={`w-7 h-7 rounded-lg text-xs font-bold ${
                      adminProductPage === pageNum
                        ? 'bg-[#9E315A] text-white'
                        : 'bg-white text-[#5A4550] border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setAdminProductPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
                disabled={
                  adminProductPage >= totalPages
                }
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 hover:bg-rose-50 cursor-pointer"
              >
                Next
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};