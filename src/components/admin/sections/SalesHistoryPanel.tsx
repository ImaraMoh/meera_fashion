import React from 'react';
import { Search, FileCheck, TrendingUp, CheckCircle, AlertTriangle, MessageCircle, Eye, FileDown } from 'lucide-react';
import type { BrandSettings, EnquiryOrder } from '../../../types';
import { openWhatsAppChat } from '../../../services/whatsapp';

interface SalesHistoryPanelProps {
  enquiries: EnquiryOrder[];
  settings: BrandSettings;
  salesHistorySearch: string;
  setSalesHistorySearch: (value: string) => void;
  salesHistoryStatusFilter: 'all' | 'Paid' | 'Delivered' | 'in_progress' | 'Cancelled';
  setSalesHistoryStatusFilter: (value: 'all' | 'Paid' | 'Delivered' | 'in_progress' | 'Cancelled') => void;
  salesHistoryPage: number;
  setSalesHistoryPage: (value: number) => void;
  setSelectedOrderDetails: (order: EnquiryOrder | null) => void;
  handleDownloadOrderInvoicePdf: (enquiry: EnquiryOrder) => void;
}

export const SalesHistoryPanel: React.FC<SalesHistoryPanelProps> = ({
  enquiries,
  settings,
  salesHistorySearch,
  setSalesHistorySearch,
  salesHistoryStatusFilter,
  setSalesHistoryStatusFilter,
  salesHistoryPage,
  setSalesHistoryPage,
  setSelectedOrderDetails,
  handleDownloadOrderInvoicePdf,
}) => {
  const salesHistoryPerPage = 10;

  const filtered = enquiries.filter((enq) => {
    if (salesHistoryStatusFilter === 'all') return true;
    if (salesHistoryStatusFilter === 'in_progress') return ['New', 'Contacted', 'Confirmed', 'Preparing'].includes(enq.status);
    return enq.status === salesHistoryStatusFilter;
  }).filter((enq) => {
    if (!salesHistorySearch) return true;
    const q = salesHistorySearch.toLowerCase();
    return (
      enq.orderNumber.toLowerCase().includes(q) ||
      enq.customerName.toLowerCase().includes(q) ||
      enq.customerPhone.toLowerCase().includes(q) ||
      enq.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / salesHistoryPerPage) || 1;
  const startItem = filtered.length === 0 ? 0 : (salesHistoryPage - 1) * salesHistoryPerPage + 1;
  const endItem = Math.min(salesHistoryPage * salesHistoryPerPage, filtered.length);
  const paged = filtered.slice((salesHistoryPage - 1) * salesHistoryPerPage, salesHistoryPage * salesHistoryPerPage);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8C5D6C] text-xs"><span>Total Sales &amp; Leads</span><FileCheck className="w-4 h-4 text-[#9E315A]" /></div>
          <p className="font-serif font-bold text-2xl text-[#241B20]">{enquiries.length}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">100+ Scale Archive Enabled</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8C5D6C] text-xs"><span>Total Sales Value</span><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          <p className="font-serif font-bold text-2xl text-[#9E315A]">£{enquiries.reduce((acc, curr) => acc + (curr.status !== 'Cancelled' ? curr.total : 0), 0)}</p>
          <p className="text-[10px] text-[#8C5D6C]">Excluding cancelled leads</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8C5D6C] text-xs"><span>Paid &amp; Invoiced</span><CheckCircle className="w-4 h-4 text-blue-600" /></div>
          <p className="font-serif font-bold text-2xl text-blue-900">{enquiries.filter((e) => e.status === 'Paid' || e.status === 'Delivered').length}</p>
          <p className="text-[10px] text-blue-700 font-semibold">Completed orders</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#8C5D6C] text-xs"><span>Cancelled Leads</span><AlertTriangle className="w-4 h-4 text-red-500" /></div>
          <p className="font-serif font-bold text-2xl text-red-700">{enquiries.filter((e) => e.status === 'Cancelled').length}</p>
          <p className="text-[10px] text-red-600">With clarified reasons</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2 bg-[#FFF5F8] px-3.5 py-2 rounded-2xl border border-rose-200/80 flex-1">
          <Search className="w-4 h-4 text-[#9E315A] shrink-0" />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, item name..."
            value={salesHistorySearch}
            onChange={(e) => setSalesHistorySearch(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {(['all', 'Paid', 'Delivered', 'in_progress', 'Cancelled'] as const).map((filterType) => {
            const label = filterType === 'all' ? 'All Records' : filterType === 'in_progress' ? 'In Progress' : filterType;
            const isActive = salesHistoryStatusFilter === filterType;
            return (
              <button
                key={filterType}
                onClick={() => {
                  setSalesHistoryStatusFilter(filterType);
                  setSalesHistoryPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#9E315A] text-white shadow-xs'
                    : 'bg-rose-50 text-[#8C5D6C] hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-rose-100/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="bg-[#FFF5F8] border-b border-rose-100 text-[#8C5D6C] uppercase font-bold text-[10px]">
                <th className="p-4">Order # &amp; Date</th>
                <th className="p-4">Customer &amp; Phone</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Progress Status</th>
                <th className="p-4">Clarification / Note</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#8C5D6C]">
                    <FileCheck className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                    <p className="font-serif font-bold text-sm text-[#241B20]">No sales history found</p>
                    <p className="text-xs">Try adjusting your filters or search keywords</p>
                  </td>
                </tr>
              ) : (
                paged.map((enq) => (
                  <tr key={enq.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-[#9E315A] block">{enq.orderNumber}</span>
                      <span className="text-[10px] text-[#8C5D6C]">{new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-serif font-bold text-[#241B20]">{enq.customerName}</p>
                      <button onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${enq.orderNumber}.`)} className="text-[10px] text-[#25D366] font-bold hover:underline flex items-center gap-1 mt-0.5 cursor-pointer">
                        <MessageCircle className="w-3 h-3 fill-[#25D366] text-[#25D366]" />
                        <span>{enq.customerPhone}</span>
                      </button>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-[#241B20] block">{enq.items.length} {enq.items.length === 1 ? 'piece' : 'pieces'}</span>
                      <p className="text-[10px] text-[#8C5D6C] max-w-[200px] truncate" title={enq.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}>
                        {enq.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </td>

                    <td className="p-4 font-serif font-bold text-sm text-[#9E315A]">£{enq.total}</td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        enq.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        enq.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                        enq.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        enq.status === 'New' ? 'bg-rose-100 text-[#9E315A]' :
                        'bg-amber-100 text-amber-800'
                      }`}>{enq.status}</span>
                    </td>

                    <td className="p-4 max-w-[220px]">
                      {enq.status === 'Cancelled' ? (
                        <div className="text-[11px] text-red-700 bg-red-50 p-1.5 rounded-lg border border-red-200">
                          <strong className="block text-[9px] uppercase tracking-wider text-red-800 font-bold">Cancellation Reason:</strong>
                          <span className="line-clamp-2" title={enq.cancelReason || 'Cancelled without note'}>{enq.cancelReason || 'Customer did not complete WhatsApp order.'}</span>
                        </div>
                      ) : enq.notes ? (
                        <p className="text-[11px] text-[#8C5D6C] italic line-clamp-2" title={enq.notes}>"{enq.notes}"</p>
                      ) : (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSelectedOrderDetails(enq)} className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-[#9E315A] rounded-xl text-xs font-bold transition-all cursor-pointer" title="View Full Order Details">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button onClick={() => handleDownloadOrderInvoicePdf(enq)} className="p-1.5 text-[#9E315A] hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/60" title="Download Official PDF Invoice">
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openWhatsAppChat(enq.customerPhone || settings.whatsappNumber, `Hello ${enq.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${enq.orderNumber}.`)} className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-emerald-200" title="Reply on WhatsApp">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 bg-[#FFF8FA] border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#8C5D6C]">Showing <strong className="text-[#241B20]">{startItem}–{endItem}</strong> of <strong className="text-[#241B20]">{filtered.length}</strong> records (10 per set)</div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setSalesHistoryPage(Math.max(1, salesHistoryPage - 1))} disabled={salesHistoryPage <= 1} className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all">Previous Set</button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} onClick={() => setSalesHistoryPage(pageNum)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${salesHistoryPage === pageNum ? 'bg-[#9E315A] text-white shadow-xs' : 'bg-white text-[#5A4550] hover:bg-rose-50 border border-rose-200'}`}>
                    {pageNum}
                  </button>
                ))}
              </div>
              <button onClick={() => setSalesHistoryPage(Math.min(totalPages, salesHistoryPage + 1))} disabled={salesHistoryPage >= totalPages} className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-[#241B20] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 cursor-pointer transition-all">Next Set</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
