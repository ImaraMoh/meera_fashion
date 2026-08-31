import React from 'react';
import { Phone, Mail, Sparkles, MessageCircle } from 'lucide-react';
import { BrandSettings } from '../../types';

interface AnnouncementBarProps {
  settings: BrandSettings;
  onOpenWhatsApp: () => void;
  onOpenAdmin?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  settings,
  onOpenWhatsApp,
  onOpenAdmin
}) => {
  if (!settings.showAnnouncement) return null;

  return (
    <div className="bg-[#9E315A] text-white text-[10px] sm:text-[11px] py-1.5 sm:py-2 px-3 sm:px-4 border-b border-[#C94F7C20]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Quick Contacts (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-rose-100 font-medium text-[10px] uppercase tracking-[0.15em]">
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#E8CFAF]" />
            <span>{settings.phone}</span>
          </a>
          <span className="text-rose-300/40">•</span>
          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3 text-[#E8CFAF]" />
            <span className="lowercase">{settings.email}</span>
          </a>
        </div>

        {/* Center: Dynamic Announcement */}
        <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-center font-medium tracking-[0.16em] uppercase truncate">
          <Sparkles className="w-3 h-3 text-[#E8CFAF] animate-pulse shrink-0" />
          <span className="truncate">{settings.announcementText}</span>
          <Sparkles className="w-3 h-3 text-[#E8CFAF] animate-pulse shrink-0 hidden sm:inline" />
        </div>

        {/* Right: WhatsApp Concierge Quick CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenWhatsApp}
            className="hidden sm:inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all duration-200 backdrop-blur-xs border border-white/20 cursor-pointer"
          >
            <MessageCircle className="w-3 h-3 text-[#E8CFAF]" />
            <span>Concierge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
