import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Gem,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { BrandSettings } from '../../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, categoryFilter?: string) => void;
  selectionCount: number;
  selectionTotal: number;
  wishlistCount: number;
  onOpenSelection: () => void;
  onOpenWishlist: () => void;
  onOpenWhatsApp: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  settings: BrandSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  selectionCount,
  selectionTotal,
  wishlistCount,
  onOpenSelection,
  onOpenWishlist,
  onOpenWhatsApp,
  searchQuery,
  onSearchChange,
  settings,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionsDropdownOpen, setIsCollectionsDropdownOpen] = useState(false);
  const [mobileCollectionsExpanded, setMobileCollectionsExpanded] = useState(true);

  const collectionsMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close collections dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collectionsMenuRef.current && !collectionsMenuRef.current.contains(e.target as Node)) {
        setIsCollectionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const collectionCategories = [
    { id: 'all', label: 'All Collections', desc: 'Complete London Boutique Catalog' },
    { id: 'sarees', label: 'Kanjivaram & Silk Sarees', desc: 'Pure Zari Weaves & Bridal Drapes' },
    { id: 'jewellery', label: 'Heirloom & Temple Jewellery', desc: 'Kundan Bangles, Harams & Chokers' },
    { id: 'shalwar', label: 'Shalwar Suits & Shararas', desc: 'Designer Anarkalis & Chikankari' },
    { id: 'lehengas', label: 'Bridal & Party Lehengas', desc: 'Zardozi Wire Embroidery & Flared Silhouettes' },
    { id: 'performance', label: 'Classical Dance Edit', desc: 'Bharatanatyam Sets & Brass Ghungroos', isSpecial: true },
  ];

  return (
    <>
      {/* Top Main Navigation Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/98 shadow-sm border-b border-rose-200/80 py-1.5 sm:py-2'
            : 'bg-white/95 backdrop-blur-md border-b border-rose-200/60 py-2 sm:py-2.5'
        }`}
      >
        <div className="w-full max-w-[1536px] mx-auto px-2 sm:px-4 md:px-5 lg:px-6 xl:px-8">
          
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 h-11 sm:h-12 min-w-0">
            
            {/* LEFT: Mobile Menu Toggle & Brand Logo (Zero excess dead space) */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              
              {/* Hamburger Button (Mobile Only) */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(true);
                  if (isSearchOpen) setIsSearchOpen(false);
                }}
                className="lg:hidden p-1.5 text-[#241B20] hover:text-[#9E315A] transition-colors rounded-lg hover:bg-rose-50 cursor-pointer flex items-center justify-center"
                aria-label="Open Navigation Menu"
                id="mobile-menu-toggle-btn"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Boutique Logo */}
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left focus:outline-none rounded-lg group cursor-pointer flex items-center"
              >
                {/* Large Desktop Logo */}
                <div className="hidden xl:block">
                  <Logo variant="full" size="md" customLogoUrl={settings.customLogoUrl} brandName={settings.brandName} tagline={settings.tagline} />
                </div>
                {/* Compact Desktop Logo for Medium Screens */}
                <div className="hidden sm:block xl:hidden">
                  <Logo variant="full" size="sm" customLogoUrl={settings.customLogoUrl} brandName={settings.brandName} tagline={settings.tagline} />
                </div>
                {/* Mobile Compact Logo */}
                <div className="sm:hidden">
                  <Logo variant="compact" size="sm" customLogoUrl={settings.customLogoUrl} brandName={settings.brandName} tagline={settings.tagline} />
                </div>
              </button>
            </div>

            {/* CENTER: Desktop Clean Navigation Bar */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
              
              {/* 1. Home */}
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-200 cursor-pointer ${
                  currentTab === 'home'
                    ? 'text-[#9E315A] bg-[#FFF0F4] font-bold shadow-2xs'
                    : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50/70'
                }`}
              >
                Home
              </button>

              {/* 2. About */}
              <button
                onClick={() => onNavigate('story')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-200 cursor-pointer ${
                  currentTab === 'story'
                    ? 'text-[#9E315A] bg-[#FFF0F4] font-bold shadow-2xs'
                    : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50/70'
                }`}
              >
                About
              </button>

              {/* 3. Collections (With Dropdown Menu) */}
              <div
                ref={collectionsMenuRef}
                className="relative"
                onMouseEnter={() => setIsCollectionsDropdownOpen(true)}
                onMouseLeave={() => setIsCollectionsDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    onNavigate('shop', 'all');
                    setIsCollectionsDropdownOpen(false);
                  }}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                    currentTab === 'shop' || currentTab === 'sarees' || currentTab === 'jewellery' || currentTab === 'shalwar' || currentTab === 'lehengas' || currentTab === 'performance'
                      ? 'text-[#9E315A] bg-[#FFF0F4] font-bold shadow-2xs'
                      : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50/70'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollectionsDropdownOpen ? 'rotate-180 text-[#9E315A]' : 'text-rose-400'}`} />
                </button>

                {/* Collections Luxury Dropdown Panel */}
                {isCollectionsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-xl border border-rose-200/80 p-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#9E315A] px-3 py-1 mb-1 border-b border-rose-100 flex items-center justify-between">
                      <span>Boutique Departments</span>
                      <Sparkles className="w-3 h-3 text-[#C94F7C]" />
                    </div>
                    <div className="space-y-1">
                      {collectionCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onNavigate('shop', cat.id);
                            setIsCollectionsDropdownOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#FFF4F7] transition-all group flex items-start justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-semibold text-[#241B20] group-hover:text-[#9E315A] flex items-center gap-1.5">
                              <span>{cat.label}</span>
                              {cat.isSpecial && (
                                <span className="text-[9px] bg-[#9E315A] text-white px-1.5 py-0.2 rounded-full font-bold">
                                  Stage
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#7A6470] font-light">
                              {cat.desc}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-rose-300 group-hover:text-[#9E315A] group-hover:translate-x-0.5 transition-all mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Offers */}
              <button
                onClick={() => onNavigate('offers', 'offers')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  currentTab === 'offers'
                    ? 'text-[#9E315A] bg-[#FFF0F4] font-bold shadow-2xs'
                    : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50/70'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#C94F7C] animate-pulse" />
                <span>Offers</span>
                <span className="text-[9px] bg-[#C94F7C] text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                  Sale
                </span>
              </button>

              {/* 5. Contact */}
              <button
                onClick={() => onNavigate('contact')}
                className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-[0.14em] font-semibold transition-all duration-200 cursor-pointer ${
                  currentTab === 'contact'
                    ? 'text-[#9E315A] bg-[#FFF0F4] font-bold shadow-2xs'
                    : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50/70'
                }`}
              >
                Contact
              </button>

            </nav>

            {/* RIGHT: Header Actions (Fixed, Roomy & 100% Fully Visible) */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 min-w-fit">
              
              {/* Desktop Search Toggle / Input */}
              <div className="hidden md:block relative shrink-0">
                {isSearchOpen ? (
                  <div className="flex items-center bg-white border border-rose-200/90 rounded-full px-2.5 py-1 text-xs shadow-md transition-all w-40 xl:w-52">
                    <Search className="w-3.5 h-3.5 text-[#9E315A] mr-1.5 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Search collection..."
                      className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300"
                    />
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        onSearchChange('');
                      }}
                      className="p-0.5 text-rose-400 hover:text-rose-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-1.5 sm:p-2 text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Search boutique catalog"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Search Button (Toggles Search Input) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`md:hidden p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                  isSearchOpen || searchQuery
                    ? 'text-[#9E315A] bg-rose-50'
                    : 'text-[#241B20]/80 hover:text-[#9E315A] hover:bg-rose-50'
                }`}
                title="Search boutique catalog"
                aria-label="Search"
                id="mobile-search-btn"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Saved Lists (Wishlist) Icon Button */}
              <button
                onClick={onOpenWishlist}
                id="saved-lists-nav-btn"
                className="relative flex items-center gap-1 p-1.5 sm:p-2 lg:px-2.5 lg:py-1.5 xl:px-3 xl:py-2 rounded-full border border-rose-200/80 hover:border-[#9E315A] hover:bg-[#FFF5F8] text-[#241B20] hover:text-[#9E315A] transition-all duration-200 cursor-pointer group shrink-0"
                title="View Saved Lists"
                aria-label="View Saved Wishlist"
              >
                <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${wishlistCount > 0 ? 'text-[#9E315A] fill-[#9E315A]' : 'text-rose-400'}`} />
                {wishlistCount > 0 && (
                  <span className="bg-[#9E315A] text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full px-1 shadow-2xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* View My Selection Button (Cart) */}
              <button
                onClick={onOpenSelection}
                id="view-selection-nav-btn"
                className="relative flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-2 rounded-full bg-gradient-to-r from-[#9E315A] to-[#C94F7C] hover:from-[#88284C] hover:to-[#B63E69] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group shrink-0"
                title="View My Selection"
                aria-label="View My Selection Cart"
              >
                <ShoppingBag className="w-4 h-4 text-rose-100 group-hover:scale-110 transition-transform shrink-0" />
                
                {/* Desktop Text */}
                <span className="hidden sm:inline whitespace-nowrap">Selection</span>

                {/* Counter Badge */}
                <div className="flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold">
                  <span>{selectionCount}</span>
                  {selectionTotal > 0 && (
                    <span className="hidden 2xl:inline whitespace-nowrap">
                      • {settings.currencySymbol}{selectionTotal}
                    </span>
                  )}
                </div>
              </button>

            </div>
          </div>

          {/* Mobile Search Bar Dropdown Row */}
          {isSearchOpen && (
            <div className="lg:hidden mt-2 pt-2 border-t border-rose-100 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center bg-white border border-rose-200/90 rounded-full px-3 py-1.5 shadow-sm">
                <Search className="w-4 h-4 text-[#9E315A] mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search sarees, jewellery, lehengas..."
                  className="bg-transparent border-none outline-none text-xs text-[#241B20] w-full placeholder:text-rose-300 py-0.5"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1 text-rose-400 hover:text-rose-700 cursor-pointer mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-[11px] font-bold text-[#9E315A] hover:text-[#7A1F40] px-2 py-0.5 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* FULL-SCREEN MOBILE OVERLAY MENU (Rendered Outside Header to guarantee visibility in front) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col bg-[#241B20]/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Menu Card Content (Sliding from Top) */}
          <div className="bg-white w-full max-h-[90vh] shadow-2xl rounded-b-3xl flex flex-col overflow-hidden animate-in slide-in-from-top duration-300">
            
            {/* Top Bar of Mobile Menu with Close Button */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-rose-100 bg-[#FFF9FA]">
              <div className="flex items-center gap-2">
                <Logo variant="compact" size="sm" customLogoUrl={settings.customLogoUrl} brandName={settings.brandName} tagline={settings.tagline} />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-rose-100 text-[#9E315A] hover:bg-rose-200 transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation List */}
            <div className="overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
              
              {/* Main Navigation Links */}
              <div className="space-y-1.5">
                
                {/* 1. Home */}
                <button
                  onClick={() => {
                    onNavigate('home');
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    currentTab === 'home'
                      ? 'bg-[#FFF0F4] text-[#9E315A] font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-[#241B20] hover:bg-rose-50/80'
                  }`}
                >
                  <span className="text-sm">Home</span>
                  <ArrowRight className="w-4 h-4 text-rose-300" />
                </button>

                {/* 2. About Us */}
                <button
                  onClick={() => {
                    onNavigate('story');
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    currentTab === 'story'
                      ? 'bg-[#FFF0F4] text-[#9E315A] font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-[#241B20] hover:bg-rose-50/80'
                  }`}
                >
                  <span className="text-sm">About Us &amp; Heritage</span>
                  <ArrowRight className="w-4 h-4 text-rose-300" />
                </button>

                {/* 3. Collections Accordion */}
                <div className="bg-[#FFF8FA] rounded-2xl p-2.5 border border-rose-200/70">
                  <button
                    onClick={() => setMobileCollectionsExpanded(!mobileCollectionsExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-[#9E315A] cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Gem className="w-4 h-4 text-[#9E315A]" />
                      Collections
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCollectionsExpanded ? 'rotate-180 text-[#9E315A]' : 'text-rose-400'}`} />
                  </button>

                  {mobileCollectionsExpanded && (
                    <div className="pt-2 pb-1 space-y-1.5 border-t border-rose-100/80 mt-1">
                      {collectionCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onNavigate('shop', cat.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-[#3E2F37] hover:bg-white hover:text-[#9E315A] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span className="font-semibold">{cat.label}</span>
                          </div>
                          {cat.isSpecial ? (
                            <span className="text-[9px] bg-[#9E315A] text-white px-2 py-0.2 rounded-full font-bold">
                              Stage
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-rose-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Offers */}
                <button
                  onClick={() => {
                    onNavigate('offers', 'offers');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    currentTab === 'offers'
                      ? 'bg-[#FFF0F4] text-[#9E315A] font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-[#241B20] hover:bg-rose-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C94F7C] animate-pulse" />
                    <span className="text-sm">Exclusive Offers &amp; Bundles</span>
                  </div>
                  <span className="text-[10px] bg-[#9E315A] text-white px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Sale
                  </span>
                </button>

                {/* 5. Contact */}
                <button
                  onClick={() => {
                    onNavigate('contact');
                    setIsMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    currentTab === 'contact'
                      ? 'bg-[#FFF0F4] text-[#9E315A] font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-[#241B20] hover:bg-rose-50/80'
                  }`}
                >
                  <span className="text-sm">Contact &amp; Studio Visits</span>
                  <ArrowRight className="w-4 h-4 text-rose-300" />
                </button>
              </div>

              {/* Direct WhatsApp Concierge CTA */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onOpenWhatsApp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-2xl text-xs uppercase font-bold tracking-wider shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-white" />
                  <span>Instant WhatsApp Concierge</span>
                </button>
              </div>

              {/* Boutique Location */}
              <div className="pt-3 border-t border-rose-100 flex items-center justify-center text-[11px] text-[#7A6470]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#9E315A]" />
                  <span>London, United Kingdom • Handcrafted Boutique</span>
                </div>
              </div>

            </div>
          </div>

          {/* Backdrop Click Dismiss */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};
