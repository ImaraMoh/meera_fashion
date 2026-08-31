import React from 'react';
import { Phone, Mail, Instagram, Music2, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { BrandSettings, ProductCategory } from '../../types';

interface FooterProps {
  onNavigate: (tab: string, category?: string) => void;
  onOpenWhatsApp: () => void;
  settings: BrandSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenWhatsApp,
  settings,
}) => {
  return (
    <footer className="bg-[#1C1418] text-[#F8DDE7] pt-16 pb-12 border-t border-[#3E2F37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="light" size="lg" customLogoUrl={settings.customLogoUrl} brandName={settings.brandName} tagline={settings.tagline} />
            
            <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed font-light pr-4">
              {settings.brandName || 'Meera Fashion'} is a premium South Asian luxury boutique in {settings.address || 'London'}. Specializing in pure Kanjivaram silk sarees, heirloom Kundan and temple jewellery sets, bridal lehengas, and dance performance ensembles.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C94F7C] text-white flex items-center justify-center transition-colors border border-white/15"
                title={`Instagram ${settings.instagramHandle}`}
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C94F7C] text-white flex items-center justify-center transition-colors border border-white/15"
                title={`TikTok ${settings.tiktokHandle}`}
              >
                <Music2 className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenWhatsApp}
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md"
                title="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
              </button>
            </div>
          </div>

          {/* Column 2: Explore Collections */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
              Explore Boutiques
            </h4>
            <ul className="space-y-2 text-xs text-rose-200/80">
              <li>
                <button
                  onClick={() => onNavigate('sarees', 'sarees')}
                  className="hover:text-white transition-colors"
                >
                  Kanjivaram &amp; Silk Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jewellery', 'jewellery')}
                  className="hover:text-white transition-colors"
                >
                  Temple Jewellery &amp; Bangle Sets
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('performance', 'performance')}
                  className="hover:text-white text-[#F8DDE7] font-semibold transition-colors flex items-center gap-1"
                >
                  <span>The Dance Performance Edit</span>
                  <span className="text-[9px] bg-[#9E315A] text-white px-1.5 py-0.2 rounded">Hot</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('lehengas', 'lehengas')}
                  className="hover:text-white transition-colors"
                >
                  Bridal &amp; Festive Lehengas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shalwar', 'shalwar')}
                  className="hover:text-white transition-colors"
                >
                  Designer Shalwar &amp; Anarkalis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers', 'offers')}
                  className="hover:text-white transition-colors"
                >
                  Special Offers &amp; Discounts
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Information */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
              Information
            </h4>
            <ul className="space-y-2 text-xs text-rose-200/80">
              <li>
                <button onClick={() => onNavigate('story')} className="hover:text-white transition-colors">
                  About {settings.brandName || 'Meera Fashion'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Concierge &amp; Enquiries
                </button>
              </li>
              <li>
                <span className="text-rose-300/60">Free UK Delivery over {settings.currencySymbol || '£'}100</span>
              </li>
              <li>
                <span className="text-rose-300/60">Worldwide DHL / Royal Mail</span>
              </li>
              <li>
                <span className="text-rose-300/60">Custom Sizing Guide (2.2 - 3.0)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contacts */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
              Boutique Contact
            </h4>
            <div className="space-y-2.5 text-xs text-rose-200/90">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#E8CFAF] shrink-0" />
                <span>{settings.phone} ({settings.formattedPhone})</span>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-[#E8CFAF] shrink-0" />
                <span className="break-all">{settings.email}</span>
              </a>

              <div className="pt-2">
                <button
                  onClick={onOpenWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rose-200/50">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {settings.brandName || 'Meera Fashion'} — {settings.address || 'London • Mumbai'}</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="text-rose-200/70 font-medium">
              Developed by <span className="text-[#F8DDE7] font-semibold tracking-wide hover:text-white transition-colors">NeirahTech</span>
            </p>
          </div>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-widest text-white/40">
            <span>Secure Payments</span>
            <span>Premium Delivery</span>
            <span>Ethics First</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
