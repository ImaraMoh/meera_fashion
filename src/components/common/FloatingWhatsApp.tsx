import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { BrandSettings } from '../../types';

interface FloatingWhatsAppProps {
  settings: BrandSettings;
  onOpenWhatsApp: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  settings,
  onOpenWhatsApp,
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#241B20] px-3.5 py-2 rounded-2xl shadow-luxury border border-rose-200 text-xs font-semibold animate-bounce">
          <span>Need saree advice or bangle sizing?</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-rose-400 hover:text-rose-700 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        onClick={onOpenWhatsApp}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-luxury-lg hover:scale-110 transition-all duration-300 relative group cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7 fill-white" />
      </button>
    </div>
  );
};
