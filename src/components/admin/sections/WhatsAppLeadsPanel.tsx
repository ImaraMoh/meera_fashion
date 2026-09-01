import React from 'react';
import { MessageCircle, Eye, FileDown, Trash2, AlertTriangle } from 'lucide-react';
import type { EnquiryOrder, BrandSettings } from '../../../types';
import { openWhatsAppChat } from '../../../services/whatsapp';

interface WhatsAppLeadsPanelProps {
  enquiries: EnquiryOrder[];
  settings: BrandSettings;
  setActiveTab: (tab: 'dashboard' | 'products' | 'enquiries' | 'sales_history' | 'invoices' | 'media' | 'reports' | 'settings') => void;
  setSelectedOrderDetails: (order: EnquiryOrder | null) => void;
  handleDownloadOrderInvoicePdf: (enquiry: EnquiryOrder) => void;
  handleDeleteEnquiry: (enquiry: EnquiryOrder) => void;
  handleRequestEnquiryStatusChange: (enquiry: EnquiryOrder, nextStatus: any) => void;
}

export const WhatsAppLeadsPanel: React.FC<WhatsAppLeadsPanelProps> = ({
  enquiries,
  settings,
  setActiveTab,
  setSelectedOrderDetails,
  handleDownloadOrderInvoicePdf,
  handleDeleteEnquiry,
  handleRequestEnquiryStatusChange,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#9E315A]" />
          <div>
            <h3 className="font-serif font-bold text-base text-[#241B20]">Active WhatsApp Orders &amp; Inquiries ({enquiries.length})</h3>
            <p className="text-xs text-[#8C5D6C]">Real-time customer selections sent from website &amp; concierge bookings</p>
          </div>
        </div>

        <button onClick={() => setActiveTab('sales_history')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#9E315A] text-xs font-bold border border-rose-200 transition-all cursor-pointer">
          <MessageCircle className="w-4 h-4" />
          <span>Open Sales History Table</span>
        </button>
      </div>

      <div className="space-y-4">
        {enquiries.map((enq) => (
          <div key={enq.id} className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs bg-rose-50 text-[#9E315A] px-3 py-1 rounded-full border border-rose-200/60">{enq.orderNumber}</span>
                <span className="text-xs text-rose-300">•</span>
                <span className="text-xs text-[#8C5D6C]">{new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  enq.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                  enq.status === 'New' ? 'bg-rose-100 text-[#9E315A]' :
                  enq.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  enq.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>Status: {enq.status}</span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-base text-[#241B20]">{enq.customerName}</h4>
                <p className="text-xs text-[#5A4550]">WhatsApp Phone: <strong>{enq.customerPhone}</strong></p>
              </div>

              <div className="bg-[#FFF8FA] p-3 rounded-2xl text-xs space-y-1.5 border border-rose-100/70">
                {enq.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[#3E2F37]">
                    <span>• {it.quantity}x {it.productName} {it.size ? `(Size: ${it.size})` : ''}</span>
                    <span className="font-bold text-[#9E315A]">£{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {enq.status === 'Cancelled' && (
                <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200 text-xs text-red-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Lead Cancelled Clarification:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{enq.cancelReason || 'Customer did not proceed with the WhatsApp booking.'}</p>
                  {enq.cancelledAt && <p className="text-[10px] text-red-500 font-mono">Cancelled at: {new Date(enq.cancelledAt).toLocaleString('en-GB')}</p>}
                </div>
              )}

              {enq.notes && (
                <p className="text-[11px] text-[#8C5D6C] italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">Note: "{enq.notes}"</p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-rose-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8C5D6C]">Update Status:</span>
                <select
                  value={enq.status}
                  onChange={(e) => handleRequestEnquiryStatusChange(enq, e.target.value as any)}
                  className="bg-rose-50 border border-rose-200 text-xs font-bold text-[#9E315A] px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Paid">Paid (Generates Invoice)</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-[#8C5D6C] uppercase font-bold">Total Order Value</span>
                <p className="font-serif font-bold text-2xl text-[#9E315A]">£{enq.total}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <button onClick={() => setSelectedOrderDetails(enq)} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 border border-rose-200 text-[#241B20] text-xs font-bold rounded-full transition-all cursor-pointer" title="View Full Order Details & Invoice">
                  <Eye className="w-3.5 h-3.5 text-[#9E315A]" />
                  <span>View Details</span>
                </button>

                <button onClick={() => handleDownloadOrderInvoicePdf(enq)} className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#9E315A] text-xs font-bold rounded-full transition-all cursor-pointer" title="Download Official PDF Invoice">
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF Invoice</span>
                </button>

                <button onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding your order #${enq.orderNumber}.`)} className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </button>

                <button onClick={() => handleDeleteEnquiry(enq)} className="p-2 text-rose-400 hover:text-red-700 hover:bg-rose-100 rounded-full transition-colors cursor-pointer" title="Delete Lead">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
