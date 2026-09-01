import React from 'react';
import { AlertTriangle } from 'lucide-react';

import { EnquiryOrder } from '../../../types';

interface CancellationReasonModalProps {
  isOpen: boolean;
  enquiry: EnquiryOrder | null;
  reason: string;

  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const CANCELLATION_REASONS = [
  'Customer Unresponsive / No WhatsApp Reply',
  'Customer Changed Mind / Budget Constraint',
  'Item Out of Stock / Weaving Delay',
  'Requested Custom Size / Color Not Available',
  'Event Date Conflict / Shipping Timeline',
  'Duplicate / Test Inquiry',
];

export const CancellationReasonModal: React.FC<
  CancellationReasonModalProps
> = ({
  isOpen,
  enquiry,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen || !enquiry) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[125] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">

      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-rose-200 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 text-red-600">

          <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h4 className="font-serif font-bold text-base text-[#241B20]">
              Clarify Cancellation Reason
            </h4>

            <p className="text-xs text-[#8C5D6C]">
              Order #{enquiry.orderNumber} •{' '}
              {enquiry.customerName}
            </p>
          </div>

        </div>

        <p className="text-xs text-[#5A4550]">
          To maintain accurate sales history and analytics,
          please select or specify why this WhatsApp lead was
          cancelled:
        </p>

        {/* Presets */}
        <div className="space-y-2">

          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E315A] block">
            Common Cancellation Reasons:
          </label>

          <div className="flex flex-wrap gap-1.5">

            {CANCELLATION_REASONS.map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    onReasonChange(preset)
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                    reason === preset
                      ? 'bg-[#9E315A] text-white border-[#9E315A] font-bold'
                      : 'bg-rose-50 hover:bg-rose-100 text-[#5A4550] border-rose-200'
                  }`}
                >
                  {preset}
                </button>
              )
            )}

          </div>
        </div>

        {/* Reason */}
        <div>

          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E315A] block mb-1">
            Detailed Reason / Notes:
          </label>

          <textarea
            rows={3}
            required
            placeholder="Type additional context or specifics for this cancellation..."
            value={reason}
            onChange={(event) =>
              onReasonChange(
                event.target.value
              )
            }
            className="w-full bg-[#FFF8FA] border border-rose-200 rounded-2xl p-3 text-xs text-[#241B20] outline-none focus:border-[#9E315A]"
          />

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-100 flex items-center justify-between gap-2">

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Keep Active
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!reason.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer transition-all"
          >
            Confirm Cancellation & Save Reason
          </button>

        </div>

      </div>
    </div>
  );
};