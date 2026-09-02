import React from 'react';
import {
  X,
  AlertTriangle,
  FileDown,
  MessageCircle,
} from 'lucide-react';

import {
  EnquiryOrder,
  BrandSettings,
} from '../../../types';

interface OrderDetailsModalProps {
  enquiry: EnquiryOrder | null;
  settings: BrandSettings;

  onClose: () => void;
  onDownloadInvoice: (
    enquiry: EnquiryOrder
  ) => void;

  onWhatsApp: (
    phone: string,
    message: string
  ) => void;
}

export const OrderDetailsModal: React.FC<
  OrderDetailsModalProps
> = ({
  enquiry,
  settings,
  onClose,
  onDownloadInvoice,
  onWhatsApp,
}) => {
  if (!enquiry) {
    return null;
  }

  /*
   * Status styling
   *
   * The actual enquiry.status is displayed.
   * Nothing is changed to "Pending Confirmation".
   */
  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'New':
        return 'bg-sky-100 text-sky-800';

      case 'Contacted':
        return 'bg-violet-100 text-violet-800';

      case 'Paid':
        return 'bg-emerald-100 text-emerald-800';

      case 'Delivered':
        return 'bg-blue-100 text-blue-800';

      case 'Cancelled':
        return 'bg-red-100 text-red-800';

      case 'Pending Confirmation':
        return 'bg-amber-100 text-amber-800';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusClass = getStatusClass(
    enquiry.status
  );

  const createdDate = new Date(
    enquiry.createdAt
  );

  return (
    <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">

      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto border border-rose-200 shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-rose-100">

          <div>

            <div className="flex items-center gap-2">

              <span className="font-mono font-bold text-sm bg-rose-50 text-[#9E315A] px-3 py-1 rounded-full border border-rose-200">
                {enquiry.orderNumber}
              </span>

              {/* ACTUAL ENQUIRY STATUS */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}`}
              >
                {enquiry.status || 'New'}
              </span>

            </div>

            <h3 className="font-serif font-bold text-lg text-[#241B20] mt-1.5">
              Order & Customer Profile Details
            </h3>

            <p className="text-xs text-[#8C5D6C]">
              Received on{' '}
              {createdDate.toLocaleDateString(
                'en-GB',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-rose-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        {/* Customer Information */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">

          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E315A]">
            Customer Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

            {/* Full Name */}
            <div>
              <span className="text-[#8C5D6C] block">
                Full Name:
              </span>

              <strong className="text-[#241B20]">
                {enquiry.customerName}
              </strong>
            </div>

            {/* Phone */}
            <div>
              <span className="text-[#8C5D6C] block">
                WhatsApp / Phone:
              </span>

              <strong className="text-[#241B20]">
                {enquiry.customerPhone}
              </strong>
            </div>

            {/* Email removed */}

            {/* Delivery City */}
            {enquiry.deliveryCity && (
              <div>
                <span className="text-[#8C5D6C] block">
                  Delivery Destination:
                </span>

                <span className="text-[#241B20]">
                  {enquiry.deliveryCity}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Cancellation */}
        {enquiry.status === 'Cancelled' && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">

            <div className="flex items-center gap-2 font-bold text-red-700">

              <AlertTriangle className="w-4 h-4" />

              <span>
                Cancellation Clarification & Data:
              </span>

            </div>

            <p className="leading-relaxed">
              {enquiry.cancelReason ||
                'No specific cancellation notes recorded.'}
            </p>

            {enquiry.cancelledAt && (
              <p className="text-[10px] text-red-600 font-mono pt-1">
                Recorded Date:{' '}
                {new Date(
                  enquiry.cancelledAt
                ).toLocaleString('en-GB')}
              </p>
            )}

          </div>
        )}

        {/* Items */}
        <div className="space-y-2">

          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E315A]">
            Curated Items Ordered (
            {enquiry.items.length}
            )
          </h4>

          <div className="border border-rose-100 rounded-2xl overflow-hidden bg-white">

            <div className="overflow-x-auto">

              <table className="w-full text-left text-xs min-w-[580px]">

                <thead className="bg-[#FFF8FA] text-[#8C5D6C] uppercase text-[10px] font-bold border-b border-rose-100">

                  <tr>
                    <th className="p-3">
                      Item Description
                    </th>

                    <th className="p-3">
                      Size / Spec
                    </th>

                    <th className="p-3 text-center">
                      Qty
                    </th>

                    <th className="p-3 text-right">
                      Price
                    </th>

                    <th className="p-3 text-right">
                      Subtotal
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-rose-50">

                  {enquiry.items.map(
                    (item, index) => (
                      <tr key={index}>

                        <td className="p-3 font-semibold text-[#241B20]">
                          {item.productName}
                        </td>

                        <td className="p-3 text-[#8C5D6C]">
                          {item.size ||
                            'Standard'}
                        </td>

                        <td className="p-3 text-center font-bold text-[#241B20]">
                          {item.quantity}
                        </td>

                        <td className="p-3 text-right text-[#5A4550]">
                          £
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </td>

                        <td className="p-3 text-right font-bold text-[#9E315A]">
                          £
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toFixed(2)}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

        {/* Totals */}
        <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-rose-100 space-y-1.5 text-xs">

          <div className="flex justify-between text-[#5A4550]">
            <span>
              Items Subtotal:
            </span>

            <span>
              £
              {Number(
                enquiry.subtotal ??
                  enquiry.total
              ).toFixed(2)}
            </span>
          </div>

          {Number(enquiry.discount || 0) >
            0 && (
            <div className="flex justify-between text-[#5A4550]">
              <span>
                Discount:
              </span>

              <span className="text-[#9E315A]">
                -£
                {Number(
                  enquiry.discount
                ).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-[#5A4550]">
            <span>
              Royal Mail 1st Class UK Delivery:
            </span>

            <span className="text-emerald-700 font-semibold">
              Complimentary
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-rose-200 text-sm font-bold">

            <span className="text-[#241B20]">
              Grand Total:
            </span>

            <span className="font-serif text-xl text-[#9E315A]">
              £
              {Number(
                enquiry.total
              ).toFixed(2)}
            </span>

          </div>

        </div>

        {/* Notes */}
        {enquiry.notes && (
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">

            <strong className="text-amber-900 block mb-0.5">
              Special Instructions / Customer Notes:
            </strong>

            <p className="text-[#5A4550] italic">
              "{enquiry.notes}"
            </p>

          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              onDownloadInvoice(enquiry)
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#9E315A] hover:bg-[#832247] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />

            <span>
              Download Official PDF Invoice
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">

            <button
              type="button"
              onClick={() =>
                onWhatsApp(
                  enquiry.customerPhone ||
                    settings.whatsappNumber,
                  `Hello ${enquiry.customerName} 🌸 This is Meera from Meera's Fashion regarding order #${enquiry.orderNumber}.`
                )
              }
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              WhatsApp
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold cursor-pointer"
            >
              Close
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};