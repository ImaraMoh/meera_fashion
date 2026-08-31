import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SelectionItem, BrandSettings, EnquiryOrder } from '../../types';
import {
  generateWhatsAppSelectionMessage,
  openWhatsAppChat
} from '../../services/whatsapp';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface SelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectionItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearSelection: () => void;
  onRecordEnquiry: (enquiry: EnquiryOrder) => void;
  settings: BrandSettings;
  onContinueShopping: () => void;
}

export const SelectionDrawer: React.FC<SelectionDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearSelection,
  onRecordEnquiry,
  settings,
  onContinueShopping,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Live generated WhatsApp text
  const liveMessage = generateWhatsAppSelectionMessage(
    items,
    {
      name: customerName,
      phone: customerPhone,
      notes: customerNotes,
    },
    settings.brandName,
    settings.currencySymbol || '£'
  );

  const handleSendToWhatsApp = () => {
    if (items.length === 0) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C94F7C', '#9E315A', '#E8CFAF', '#F8DDE7'],
      });
    } catch (e) {
      // ignore
    }

    // Record this enquiry in CMS local storage
    const newEnquiry: EnquiryOrder = {
      id: `enq-${Date.now()}`,
      orderNumber: `MF-ENQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerName || 'WhatsApp Customer',
      customerPhone: customerPhone || 'Via WhatsApp',
      customerEmail: 'Pending confirmation',
      items: items.map((it) => ({
        productId: it.productId,
        productName: it.product.name,
        quantity: it.quantity,
        price: it.unitPrice,
        size: it.selectedSize,
        image: it.product.images.main,
      })),
      subtotal: totalAmount,
      discount: 0,
      total: totalAmount,
      status: 'New',
      notes: customerNotes || 'Sent via boutique selection drawer',
      createdAt: new Date().toISOString(),
      source: 'WhatsApp',
    };

    onRecordEnquiry(newEnquiry);

    // Open WhatsApp
    openWhatsAppChat(settings.whatsappNumber, liveMessage);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-rose-100">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FFF5F8] to-[#FFF0F5] border-b border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#9E315A] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#241B20]">
                My Selection
              </h3>
              <p className="text-[11px] text-[#8C5D6C] font-medium">
                {items.length} {items.length === 1 ? 'curated piece' : 'curated pieces'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#3E2F37] hover:text-[#9E315A] hover:bg-white rounded-full transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-300 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-lg text-[#241B20] mb-1">
                Your Selection is Empty
              </h4>
              <p className="text-xs text-[#5A4550] max-w-xs mb-6">
                Explore our silk sarees, temple jewellery bangles, and bridal collections to build your dream ensemble.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onContinueShopping();
                }}
                className="bg-[#9E315A] hover:bg-[#C94F7C] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#FFF8FA] border border-rose-100 flex items-center justify-between gap-3 shadow-2xs hover:border-rose-200 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-18 rounded-xl overflow-hidden shrink-0 border border-rose-200/80 bg-white">
                      <img
                        src={getOptimizedImageUrl(item.product.images.main, { width: 140, quality: 60, fallbackType: item.product.category === 'jewellery' ? 'jewellery' : item.product.category === 'performance' ? 'performance' : 'saree' })}
                        alt={item.product.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) =>
                          handleImageError(
                            e,
                            item.product.category === 'jewellery'
                              ? 'jewellery'
                              : item.product.category === 'performance'
                              ? 'performance'
                              : 'saree'
                          )
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#241B20] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#9E315A]">
                        {settings.currencySymbol || '£'}{item.unitPrice}
                      </p>
                      {item.selectedSize && (
                        <span className="inline-block text-[10px] bg-rose-100/80 text-[#9E315A] font-bold px-2 py-0.5 rounded mt-1">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border border-rose-200 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-rose-800 hover:bg-rose-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#241B20]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-rose-800 hover:bg-rose-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-rose-400 hover:text-rose-700 text-xs p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details Form (Optional for WhatsApp message personalization) */}
              <div className="bg-[#FFF5F8] p-4 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9E315A] uppercase tracking-wider">
                    Concierge Details (Optional)
                  </span>
                  <span className="text-[10px] text-[#8C5D6C]">Included in WhatsApp chat</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Priya)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-[#241B20] outline-none focus:border-[#9E315A]"
                  />
                  <input
                    type="text"
                    placeholder="Phone / City"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-[#241B20] outline-none focus:border-[#9E315A]"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Special requests, wedding dates, or sizing queries..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-white border border-rose-200 rounded-xl p-2.5 text-xs text-[#241B20] outline-none focus:border-[#9E315A] resize-none"
                />

                {/* WhatsApp Message Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-[11px] font-semibold text-[#9E315A] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{showPreview ? 'Hide Message Preview' : 'Preview WhatsApp Message'}</span>
                </button>

                {showPreview && (
                  <pre className="mt-2 p-3 bg-white border border-rose-200 rounded-xl text-[10px] text-[#241B20] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {liveMessage}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer & WhatsApp Action */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-rose-100 shadow-lg space-y-3">
            {/* Totals */}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#5A4550]">
                Estimated Selection Total:
              </span>
              <span className="font-serif font-bold text-2xl text-[#9E315A]">
                {settings.currencySymbol || '£'}{totalAmount.toFixed(2)}
              </span>
            </div>

            <p className="text-[11px] text-[#8C5D6C] text-center">
              Free UK Royal Mail Delivery applies on orders over {settings.currencySymbol || '£'}100
            </p>

            {/* Primary Action: Send to WhatsApp Concierge */}
            <button
              onClick={handleSendToWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Send Selection to WhatsApp Concierge</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C5D6C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Opens official {settings.brandName} WhatsApp ({settings.formattedPhone || settings.phone})</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
