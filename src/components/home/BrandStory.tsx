import React from 'react';
import {
  Sparkles,
  Phone,
  Mail,
  Instagram,
  Music2,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { BrandSettings } from '../../types';
import LogoImage from '../../assets/logo.png';

interface BrandStoryProps {
  settings: BrandSettings;
  onOpenWhatsApp: () => void;
}

export const BrandStory: React.FC<BrandStoryProps> = ({
  settings,
  onOpenWhatsApp,
}) => {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#FFF8FA] to-[#FFF0F5] relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* =====================================================
              LEFT COLUMN — BRAND STORY
          ===================================================== */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-[#9E315A] uppercase font-display flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C94F7C]" />
                <span>
                  The {settings.brandName || "Meera's Fashion"} Legacy
                </span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#241B20] leading-tight">
                Where Tradition Meets Modern Elegance
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#5A4550] leading-relaxed font-light">
              Founded with a passion for South Asian heritage,{' '}
              <strong>
                {settings.brandName || "Meera's Fashion"}
              </strong>{' '}
              curates exceptional bridal sarees, handcrafted temple jewellery,
              and stage dance performance collections.
            </p>

            <p className="text-sm sm:text-base text-[#5A4550] leading-relaxed font-light">
              We bridge centuries-old artisanal craftsmanship with a modern,
              personalized WhatsApp concierge experience. Whether you are
              dressing for your wedding vows, a{' '}
              {settings.address?.split(',')[0] || 'London'} stage recital, or a
              festive celebration, every piece is handpicked to radiate
              elegance.
            </p>

            {/* Quality Pillars */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <Award className="w-5 h-5 text-[#9E315A] mb-2" />

                <h4 className="font-serif font-bold text-sm text-[#241B20]">
                  Artisanal Weaves
                </h4>

                <p className="text-xs text-[#8C5D6C] mt-0.5">
                  Authentic Kanjivaram and Banarasi silk zari work.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#9E315A] mb-2" />

                <h4 className="font-serif font-bold text-sm text-[#241B20]">
                  Bespoke Sizing
                </h4>

                <p className="text-xs text-[#8C5D6C] mt-0.5">
                  Custom bangle diameters from 2.2 to 3.0.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT COLUMN — BUSINESS CARD
          ===================================================== */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Decorative Card Glow & Floating Shadows */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#9E315A] via-[#C94F7C] to-[#E8CFAF] rounded-3xl opacity-30 blur-lg" />

              {/* Business Card Container */}
              <div className="relative bg-gradient-to-br from-[#FF94BA] via-[#D15585] to-[#9E315A] rounded-2xl p-5 sm:p-7 text-white shadow-luxury-lg border border-white/40 overflow-hidden">
                
                {/* =================================================
                    SUBTLE CARD WATERMARK LOGO
                    Mobile-safe positioning
                ================================================= */}
                <div
                  className="
                    absolute
                    right-2.5
                    top-3
                    sm:right-3
                    sm:top-4
                    w-16
                    h-16
                    sm:w-20
                    sm:h-20
                    flex
                    items-center
                    justify-center
                    pointer-events-none
                    z-0
                  "
                >
                  {/* White glow */}
                  <div
                    className="
                      absolute
                      inset-1
                      rounded-full
                      bg-white/70
                      blur-md
                      shadow-[0_0_20px_rgba(255,255,255,0.85)]
                    "
                  />

                  {/* White glowing background */}
                  <div
                    className="
                      absolute
                      inset-2
                      rounded-full
                      bg-white/65
                      border
                      border-white/80
                      shadow-[0_0_16px_rgba(255,255,255,0.75)]
                    "
                  />

                  {/* Logo */}
                  <img
                    src={settings.customLogoUrl || LogoImage}
                    alt="Watermark Logo"
                    className="
                      relative
                      z-10
                      w-11
                      h-11
                      sm:w-14
                      sm:h-14
                      object-contain
                      opacity-75
                      drop-shadow-[0_0_7px_rgba(255,255,255,0.95)]
                    "
                  />
                </div>

                {/* =================================================
                    CARD TOP BRAND INFO
                    Added right padding so text never overlaps logo
                ================================================= */}
                <div className="relative z-10 flex items-start justify-between mb-8">
                  
                  <div className="min-w-0 w-full pr-20 sm:pr-24">
                    <h3 className="font-serif font-bold text-xl sm:text-2xl tracking-wide text-white drop-shadow-xs truncate">
                      {settings.brandName || "Meera's Fashion"}
                    </h3>

                    <p
                      className="
                        text-[10px]
                        sm:text-xs
                        text-rose-100
                        font-medium
                        tracking-wider
                        uppercase
                        mt-1
                        leading-relaxed
                        break-words
                      "
                    >
                      {settings.tagline ||
                        'Traditional Clothing And Jewelleries'}
                    </p>
                  </div>

                </div>

                {/* =================================================
                    CARD CONTACT GRID
                ================================================= */}
                <div className="relative z-10 space-y-2.5 text-xs text-rose-50 font-medium pt-4 border-t border-white/20">
                  
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-2.5 hover:text-white transition-colors min-w-0"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-white" />
                    </div>

                    <span className="truncate">
                      Phone: {settings.phone} ({settings.formattedPhone})
                    </span>
                  </a>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-black/20 px-2.5 py-1.5 rounded-lg hover:bg-black/30 transition-colors min-w-0"
                    >
                      <Music2 className="w-3.5 h-3.5 text-white shrink-0" />

                      <span className="truncate">
                        {settings.tiktokHandle}
                      </span>
                    </a>

                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white/15 px-2.5 py-1.5 rounded-lg hover:bg-white/25 transition-colors min-w-0"
                    >
                      <Instagram className="w-3.5 h-3.5 text-white shrink-0" />

                      <span className="truncate">
                        {settings.instagramHandle}
                      </span>
                    </a>
                  </div>

                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2.5 hover:text-white transition-colors pt-1 min-w-0"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-white" />
                    </div>

                    <span className="truncate">
                      {settings.email}
                    </span>
                  </a>
                </div>

                {/* =================================================
                    WHATSAPP ACTION
                ================================================= */}
                <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-3">
                  
                  <span className="text-[10px] sm:text-[11px] font-semibold text-rose-100 truncate">
                    London Boutique Concierge
                  </span>

                  <button
                    onClick={onOpenWhatsApp}
                    className="
                      bg-white
                      text-[#9E315A]
                      hover:bg-rose-50
                      px-3
                      sm:px-3.5
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      shadow-sm
                      transition-all
                      flex
                      items-center
                      gap-1.5
                      cursor-pointer
                      shrink-0
                    "
                  >
                    <span>Connect Live</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BrandStory;