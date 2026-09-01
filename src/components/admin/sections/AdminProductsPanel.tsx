import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Save,
  ArrowLeft,
} from 'lucide-react';
import type { Product, ProductCategory } from '../../../types';

interface AdminProductsPanelProps {
  products: Product[];
  onSaveProducts: (products: Product[]) => void;
}

const STOCK_UNAVAILABILITY_PRESETS = [
  'Sold Out - Awaiting New Weaving Batch from Kanchipuram',
  'Reserved for Bespoke Bridal Client',
  'Temporary Out of Stock - Restocking Soon',
  'On Loan to Fashion Blogger',
  'Custom Order in Production',
];

export const AdminProductsPanel: React.FC<AdminProductsPanelProps> = ({
  products,
  onSaveProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentEditProduct, setCurrentEditProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentEditProduct({ ...product });
  };

  const handleSaveProduct = () => {
    if (!currentEditProduct) return;
    const updated = products.map(p => p.id === currentEditProduct.id ? currentEditProduct : p);
    onSaveProducts(updated);
    setEditingProduct(null);
    setCurrentEditProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    onSaveProducts(updated);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: 'New Product',
      slug: `new-product-${Date.now()}`,
      category: 'sarees' as ProductCategory,
      subcategory: '',
      price: 0,
      images: { main: '' },
      description: '',
      shortDescription: '',
      material: '',
      color: '',
      stockStatus: 'In Stock',
      stockQuantity: 0,
      isPreOrder: false,
      isFeatured: false,
      isNewArrival: false,
      isOffer: false,
      isDancePerformance: false,
      saleEnabled: true,
      rentalEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleEditProduct(newProduct);
  };

  if (editingProduct && currentEditProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setEditingProduct(null)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct.id.startsWith('prod-') && editingProduct.createdAt === new Date().toISOString() ? 'New Product' : 'Edit Product'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow">
          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Product Images</h3>
            <div className="space-y-3">
              {Object.entries(currentEditProduct.images).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 capitalize">{key} Image URL</label>
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => setCurrentEditProduct({
                      ...currentEditProduct,
                      images: { ...currentEditProduct.images, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={`Enter ${key} image URL`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={currentEditProduct.name}
                onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Price (£)</label>
              <input
                type="number"
                value={currentEditProduct.price}
                onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                value={currentEditProduct.stockQuantity}
                onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-1"
              />
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentEditProduct.isFeatured}
                  onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isFeatured: e.target.checked })}
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentEditProduct.isNewArrival}
                  onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isNewArrival: e.target.checked })}
                />
                <span className="text-sm">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentEditProduct.isOffer}
                  onChange={(e) => setCurrentEditProduct({ ...currentEditProduct, isOffer: e.target.checked })}
                />
                <span className="text-sm">Offer</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProduct}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                <Save size={16} />
                Save Product
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">Product Name</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">Price</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">Stock</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">£{product.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.stockQuantity}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    product.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2 flex">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
