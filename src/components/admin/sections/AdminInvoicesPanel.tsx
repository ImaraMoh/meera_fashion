import React, { useMemo, useState } from 'react';
import { Download, Printer, Search, Trash2 } from 'lucide-react';
import type { Invoice } from '../../../types';

interface AdminInvoicesPanelProps {
  invoices: Invoice[];
  onDownloadInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
}

export const AdminInvoicesPanel: React.FC<AdminInvoicesPanelProps> = ({
  invoices,
  onDownloadInvoice,
  onDeleteInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = useMemo(() => invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerPhone.toLowerCase().includes(searchTerm.toLowerCase())
  ), [invoices, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white p-3 sm:p-4 rounded-3xl border border-rose-100 shadow-sm">
        <Search className="w-4 h-4 text-[#9E315A] shrink-0" />
        <input
          type="text"
          placeholder="Search invoices by invoice number, customer name, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInvoices.map((invoice) => (
          <article key={invoice.id} className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2"><span className="font-mono font-bold text-xs text-[#9E315A]">{invoice.invoiceNumber}</span><span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">{invoice.status}</span></div>
              <h4 className="font-serif font-bold text-base text-[#241B20]">{invoice.customerName}</h4>
              <p className="text-xs text-[#8C5D6C] mb-4">Date: {invoice.issueDate} • Phone: {invoice.customerPhone}</p>
              <div className="bg-[#FFF8FA] p-3 rounded-2xl text-xs space-y-1.5 mb-4 border border-rose-100">{invoice.items.map((item, index) => <div key={index} className="flex justify-between"><span>{item.quantity}x {item.description}</span><span className="font-bold text-[#9E315A]">£{item.total}</span></div>)}</div>
              <div className="flex justify-between items-baseline pt-2 border-t border-rose-100"><span className="text-xs font-semibold text-[#5A4550]">Total Billed:</span><span className="font-serif font-bold text-xl text-[#9E315A]">£{Number(invoice.total).toFixed(2)}</span></div>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between gap-2"><button onClick={() => onDownloadInvoice(invoice)} className="flex items-center gap-1.5 bg-[#9E315A] hover:bg-[#C94F7C] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"><Download className="w-3.5 h-3.5" />Download PDF</button><div className="flex items-center gap-2"><button onClick={() => onDownloadInvoice(invoice)} className="flex items-center gap-1 text-xs text-[#8C5D6C] hover:text-[#241B20] cursor-pointer"><Printer className="w-3.5 h-3.5" />Print</button><button onClick={() => onDeleteInvoice(invoice)} className="p-1.5 text-rose-300 hover:text-red-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Delete Invoice"><Trash2 className="w-3.5 h-3.5" /></button></div></div>
          </article>
        ))}
        </div>
    </div>
  );
};
