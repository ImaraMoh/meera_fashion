import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  X,
} from 'lucide-react';

export interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
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

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">

      <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">

          {config.isDestructive ? (

            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle className="w-5 h-5" />
            </div>

          ) : (

            <div className="p-2.5 rounded-2xl bg-rose-50 text-[#9E315A] border border-rose-200">
              <ShieldCheck className="w-5 h-5" />
            </div>

          )}

          <div className="flex-1">

            <h4 className="font-serif font-bold text-base text-[#241B20]">
              {config.title}
            </h4>

            <p className="text-xs text-[#8C5D6C]">
              Please confirm your administrative action
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* Message */}
        <p className="text-xs text-[#5A4550] leading-relaxed">
          {config.message}
        </p>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-100 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {config.cancelLabel || 'Cancel'}
          </button>

          <button
            type="button"
            onClick={config.onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
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