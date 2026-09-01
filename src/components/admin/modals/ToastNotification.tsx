import React from 'react';
import {
  CheckCircle,
  X,
} from 'lucide-react';

export interface ToastNotificationConfig {
  show: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastNotificationProps {
  notification: ToastNotificationConfig | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<
  ToastNotificationProps
> = ({
  notification,
  onClose,
}) => {
  if (!notification?.show) {
    return null;
  }

  const handleAction = () => {
    notification.onAction?.();
    onClose();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[130] bg-[#241B20] text-white rounded-2xl p-4 shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-bottom duration-300 max-w-md">

      {/* Icon */}
      <div className="p-2 rounded-xl bg-[#9E315A] text-white shrink-0">
        <CheckCircle className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">

        <h5 className="font-serif font-bold text-xs text-white">
          {notification.title}
        </h5>

        <p className="text-[11px] text-rose-200/80 line-clamp-2">
          {notification.message}
        </p>

      </div>

      {/* Action */}
      {notification.actionLabel &&
        notification.onAction && (
          <button
            type="button"
            onClick={handleAction}
            className="px-3 py-1 bg-[#9E315A] hover:bg-[#C94F7C] text-white text-[11px] font-bold rounded-lg shrink-0 cursor-pointer"
          >
            {notification.actionLabel}
          </button>
        )}

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-rose-300 hover:text-white shrink-0 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

    </div>
  );
};