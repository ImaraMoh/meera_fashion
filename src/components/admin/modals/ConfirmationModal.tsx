import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
  ArrowRight,
} from 'lucide-react';

export interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;

  confirmLabel?: string;
  cancelLabel?: string;

  isDestructive?: boolean;

  // Optional status information
  currentStatus?: string;
  newStatus?: string;

  onConfirm: () => void;
}

interface ConfirmationModalProps {
  config: ConfirmationModalConfig | null;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<
  ConfirmationModalProps
> = ({
  config,
  onClose,
}) => {
  if (!config?.isOpen) {
    return null;
  }

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';

      case 'Delivered':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';

      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';

      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const hasStatusChange =
    Boolean(
      config.currentStatus &&
      config.newStatus
    );

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="p-6 pb-4">

          <div className="flex items-start gap-3">

            {/* Icon */}

            {config.isDestructive ? (
              <div className="shrink-0 p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="shrink-0 p-2.5 rounded-2xl bg-rose-50 text-[#9E315A] border border-rose-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}

            {/* Title */}

            <div className="flex-1 min-w-0">

              <h4
                id="confirmation-modal-title"
                className="font-serif font-bold text-base text-[#241B20]"
              >
                {config.title}
              </h4>

              <p className="text-xs text-[#8C5D6C] mt-0.5">
                Please confirm your administrative action
              </p>

            </div>

            {/* Close */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation modal"
              className="shrink-0 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Status Change */}
        {/* -------------------------------- */}

        {hasStatusChange && (
          <div className="px-6 pb-4">

            <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-rose-100">

              <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C5D6C] mb-3">
                Order Status Change
              </p>

              <div className="flex items-center justify-center gap-2">

                <span
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${getStatusClass(
                    config.currentStatus
                  )}`}
                >
                  {config.currentStatus}
                </span>

                <ArrowRight className="w-4 h-4 text-[#9E315A] shrink-0" />

                <span
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${getStatusClass(
                    config.newStatus
                  )}`}
                >
                  {config.newStatus}
                </span>

              </div>

            </div>

          </div>
        )}

        {/* -------------------------------- */}
        {/* Message */}
        {/* -------------------------------- */}

        <div className="px-6 pb-5">

          <div className="flex gap-2.5">

            <CheckCircle2 className="w-4 h-4 text-[#9E315A] shrink-0 mt-0.5" />

            <p className="text-xs text-[#5A4550] leading-relaxed">
              {config.message}
            </p>

          </div>

        </div>

        {/* -------------------------------- */}
        {/* Footer */}
        {/* -------------------------------- */}

        <div className="px-6 py-4 bg-[#FFFBFC] border-t border-rose-100 flex justify-end gap-2">

          {/* Cancel */}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {config.cancelLabel || 'Cancel'}
          </button>

          {/* Confirm */}

          <button
            type="button"
            onClick={config.onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
              config.isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#9E315A] hover:bg-[#832247]'
            }`}
          >
            {config.confirmLabel ||
              'Confirm Action'}
          </button>

        </div>

      </div>
    </div>
  );
};