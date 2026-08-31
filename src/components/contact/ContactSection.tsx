import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Music2,
  MapPin,
  Clock,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BrandSettings } from '../../types';
import { openWhatsAppChat } from '../../services/whatsapp';

interface ContactSectionProps {
  settings: BrandSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryInterest, setCategoryInterest] = useState('Silk Sarees');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMsg = `🌸 *New Boutique Enquiry - ${settings.brandName || "Meera's Fashion"}*\n\nName: ${name || 'Customer'}\nPhone: ${phone || 'Not specified'}\nInterested in: ${categoryInterest}\n\nMessage: ${message || 'I would like to know more about sizing and saree availability.'}`;
    openWhatsAppChat(settings.whatsappNumber, fullMsg);
    setIsSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FFF5F8] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-[0.25em] text-[#9E315A] uppercase font-display">
            Personal Concierge
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#241B20] mt-2 mb-3">
            Let's Create Your Dream Look
          </h2>
          <p className="text-sm sm:text-base text-[#5A4550]">
            Have a question regarding silk saree matching, bangle measurements, dance performance sets, or bridal pre-orders? Our styling team is here on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Direct Contact Details & Business Card Info */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* WhatsApp Featured Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#25D366]/15 via-white to-emerald-50/40 border border-[#25D366]/30 shadow-luxury">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#241B20]">
                    WhatsApp Business Concierge
                  </h4>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Fastest Response • Instant Video Consultation
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#5A4550] mb-4">
                Chat directly with our {settings.address?.split(',')[0] || 'London'} styling specialists for video previews of draping and jewellery matching.
              </p>

              <button
                onClick={() => openWhatsAppChat(settings.whatsappNumber, `Hello ${settings.brandName || "Meera Fashion"} 🌸 I would like to consult regarding a saree and jewellery sizing.`)}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp: {settings.formattedPhone || settings.phone}</span>
              </button>
            </div>

            {/* General Contact Grid */}
            <div className="p-6 rounded-3xl bg-white border border-rose-100 shadow-luxury space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E315A]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C5D6C] font-semibold uppercase">Telephone</p>
                  <a href={`tel:${settings.phone}`} className="text-sm font-bold text-[#241B20] hover:text-[#9E315A]">
                    {settings.phone} ({settings.formattedPhone})
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E315A]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C5D6C] font-semibold uppercase">Email Enquiries</p>
                  <a href={`mailto:${settings.email}`} className="text-sm font-bold text-[#241B20] hover:text-[#9E315A]">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E315A]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C5D6C] font-semibold uppercase">Boutique Hours</p>
                  <p className="text-xs font-semibold text-[#241B20]">
                    Monday – Sunday: 9:00 AM – 9:00 PM GMT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#9E315A]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#8C5D6C] font-semibold uppercase">Location &amp; Delivery</p>
                  <p className="text-xs font-semibold text-[#241B20]">
                    {settings.address || 'London, United Kingdom'} • Worldwide Shipping
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Styling Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-white border border-rose-100 shadow-luxury">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-rose-100">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#241B20]">
                    Send a Styling Query
                  </h3>
                  <p className="text-xs text-[#5A4550] mt-0.5">
                    We will formulate your request and connect you instantly with our WhatsApp concierge.
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#C94F7C]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#241B20] outline-none focus:border-[#9E315A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +44 7912 345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#241B20] outline-none focus:border-[#9E315A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                    Category of Interest
                  </label>
                  <select
                    value={categoryInterest}
                    onChange={(e) => setCategoryInterest(e.target.value)}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#241B20] outline-none focus:border-[#9E315A]"
                  >
                    <option value="Silk Sarees">Kanjivaram &amp; Silk Sarees</option>
                    <option value="Jewellery & Bangles">Temple &amp; Kundan Jewellery / Bangle Sizing</option>
                    <option value="Dance Performance Set">Dance Performance Saree + Jewellery Set</option>
                    <option value="Bridal Lehengas">Bridal &amp; Festive Lehengas</option>
                    <option value="Designer Shalwar">Designer Shalwar Suits</option>
                    <option value="Pre-Order Inquiry">Custom Pre-Order</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#9E315A] uppercase tracking-wider block mb-1.5">
                    Your Message / Sizing Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your event, preferred colors, bangle sizes (e.g. 2.4, 2.6), or delivery dates..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#FFF8FA] border border-rose-200 rounded-xl p-4 text-xs sm:text-sm text-[#241B20] outline-none focus:border-[#9E315A] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Send Enquiry Directly via WhatsApp</span>
                </button>

                {isSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp chat initiated! We look forward to draping your elegance.</span>
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
