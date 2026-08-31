import React, { useState, useEffect } from 'react';
import {
  Product,
  SelectionItem,
  EnquiryOrder,
  Invoice,
  BrandSettings,
  ProductCategory
} from './types';
import {
  loadProducts,
  saveProducts,
  loadSelection,
  saveSelection,
  loadWishlist,
  saveWishlist,
  loadEnquiries,
  saveEnquiries,
  loadInvoices,
  saveInvoices,
  loadSettings,
  saveSettings
} from './services/storage';
import {
  openWhatsAppChat,
  generateWhatsAppSingleProductMessage
} from './services/whatsapp';

// Layout & Home Components
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { CinematicHero } from './components/home/CinematicHero';
import { CategoryBoutique } from './components/home/CategoryBoutique';
import { PerformanceShowcase } from './components/home/PerformanceShowcase';
import { ProductGrid } from './components/products/ProductGrid';
import { BrandStory } from './components/home/BrandStory';
import { SocialShowcase } from './components/home/SocialShowcase';
import { ContactSection } from './components/contact/ContactSection';
import { Footer } from './components/layout/Footer';

// Modals & Drawers
import { ProductModal } from './components/products/ProductModal';
import { SelectionDrawer } from './components/selection/SelectionDrawer';
import { WishlistDrawer } from './components/selection/WishlistDrawer';
import { AdminPortal } from './components/admin/AdminPortal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';

export default function App() {
  // Persistence state
  const [products, setProducts] = useState<Product[]>([]);
  const [selection, setSelection] = useState<SelectionItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<BrandSettings>(loadSettings());

  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isSelectionOpen, setIsSelectionOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    setProducts(loadProducts());
    setSelection(loadSelection());
    setWishlistIds(loadWishlist());
    setEnquiries(loadEnquiries());
    setInvoices(loadInvoices());
    setSettings(loadSettings());
  }, []);

  // Update browser document title dynamically with brand settings
  useEffect(() => {
    if (settings?.brandName) {
      document.title = `${settings.brandName} | ${settings.tagline || 'Traditional Clothing & Jewelleries'}`;
    }
  }, [settings?.brandName, settings?.tagline]);

  // Sync state to storage
  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    saveProducts(updated);
  };

  const handleUpdateSelection = (updated: SelectionItem[]) => {
    setSelection(updated);
    saveSelection(updated);
  };

  const handleUpdateWishlist = (updated: string[]) => {
    setWishlistIds(updated);
    saveWishlist(updated);
  };

  const handleUpdateEnquiries = (updated: EnquiryOrder[]) => {
    setEnquiries(updated);
    saveEnquiries(updated);
  };

  const handleUpdateInvoices = (updated: Invoice[]) => {
    setInvoices(updated);
    saveInvoices(updated);
  };

  const handleUpdateSettings = (updated: BrandSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  // -------------------------------------------------------------
  // Cart / Selection Actions
  // -------------------------------------------------------------
  const handleAddToSelection = (product: Product, selectedSize?: string) => {
    const existingIndex = selection.findIndex(
      (item) => item.productId === product.id && item.selectedSize === selectedSize
    );

    let updated: SelectionItem[];
    if (existingIndex > -1) {
      updated = [...selection];
      updated[existingIndex].quantity += 1;
    } else {
      const newItem: SelectionItem = {
        id: `sel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        product,
        quantity: 1,
        selectedSize: selectedSize || (product.bangleSizes ? product.bangleSizes[1] || product.bangleSizes[0] : undefined),
        unitPrice: product.price,
        addedAt: new Date().toISOString(),
      };
      updated = [newItem, ...selection];
    }

    handleUpdateSelection(updated);
    setIsSelectionOpen(true);
  };

  const handleUpdateSelectionQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveSelectionItem(id);
      return;
    }
    const updated = selection.map((it) => (it.id === id ? { ...it, quantity: newQty } : it));
    handleUpdateSelection(updated);
  };

  const handleRemoveSelectionItem = (id: string) => {
    const updated = selection.filter((it) => it.id !== id);
    handleUpdateSelection(updated);
  };

  const handleClearSelection = () => {
    handleUpdateSelection([]);
  };

  // -------------------------------------------------------------
  // Wishlist Actions
  // -------------------------------------------------------------
  const handleToggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlistIds.includes(productId)) {
      updated = wishlistIds.filter((id) => id !== productId);
    } else {
      updated = [...wishlistIds, productId];
    }
    handleUpdateWishlist(updated);
  };

  // -------------------------------------------------------------
  // WhatsApp Direct Triggers
  // -------------------------------------------------------------
  const handleOpenGeneralWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber,
      "Hello Meera Fashion 🌸 I am browsing your London digital boutique and would like styling advice on sarees and jewellery."
    );
  };

  const handleOpenProductWhatsApp = (product: Product, size?: string) => {
    const msg = generateWhatsAppSingleProductMessage(product, {
      selectedSize: size,
      customNote: product.isPreOrder ? 'Inquiring regarding custom pre-order timing' : undefined,
    });
    openWhatsAppChat(settings.whatsappNumber, msg);
  };

  // Performance product (Dance Edit)
  const performanceProduct = products.find((p) => p.isDancePerformance) || products[0];

  // Wishlisted full products
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-white text-[#241B20] flex flex-col font-sans selection:bg-[#F8DDE7] selection:text-[#9E315A]">
      
      {/* 1. Premium Top Announcement Bar */}
      <AnnouncementBar
        settings={settings}
        onOpenWhatsApp={handleOpenGeneralWhatsApp}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Sticky Boutique Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab, cat) => {
          if (tab === 'home') {
            setCurrentTab('home');
            if (cat) setCurrentCategory(cat);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (tab === 'story' || tab === 'about') {
            setCurrentTab('story');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (tab === 'contact') {
            setCurrentTab('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (tab === 'admin') {
            setIsAdminOpen(true);
            return;
          }
          setCurrentTab('home');
          if (cat) {
            setCurrentCategory(cat);
          } else if (tab === 'offers') {
            setCurrentCategory('offers');
          }
          setTimeout(() => {
            const gridElem = document.getElementById('boutique-catalog');
            if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        selectionCount={selection.reduce((acc, it) => acc + it.quantity, 0)}
        selectionTotal={selection.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)}
        wishlistCount={wishlistIds.length}
        onOpenSelection={() => setIsSelectionOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenWhatsApp={handleOpenGeneralWhatsApp}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        settings={settings}
      />

      {/* 3. Main Views */}
      <main className="flex-1">
        {currentTab === 'home' || currentTab === 'sarees' || currentTab === 'jewellery' || currentTab === 'performance' || currentTab === 'lehengas' || currentTab === 'shalwar' || currentTab === 'offers' ? (
          <>
            {/* Cinematic Editorial Hero Section */}
            <CinematicHero
              onExplore={(cat) => {
                if (cat) setCurrentCategory(cat);
                const gridElem = document.getElementById('boutique-catalog');
                if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenWhatsApp={handleOpenGeneralWhatsApp}
              settings={settings}
            />

            {/* Category Boutiques (Bento Grid) */}
            <CategoryBoutique
              onSelectCategory={(cat: ProductCategory) => {
                setCurrentCategory(cat);
                const gridElem = document.getElementById('boutique-catalog');
                if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* The Meera Performance Edit (Dance Showcase Saree + Jewellery set) */}
            <PerformanceShowcase
              performanceProduct={performanceProduct}
              onQuickView={setActiveModalProduct}
              onAddToSelection={(prod) => handleAddToSelection(prod)}
              onOpenWhatsAppForProduct={(prod) => handleOpenProductWhatsApp(prod)}
            />

            {/* Main Interactive Product Grid & Department Filter */}
            <div id="boutique-catalog">
              <ProductGrid
                products={products}
                currentCategory={currentCategory}
                onSelectCategory={setCurrentCategory}
                onQuickView={setActiveModalProduct}
                onAddToSelection={handleAddToSelection}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onOpenWhatsApp={handleOpenProductWhatsApp}
                searchQuery={searchQuery}
                settings={settings}
              />
            </div>

            {/* Brand Heritage Story & Physical Business Card Replica */}
            <BrandStory
              settings={settings}
              onOpenWhatsApp={handleOpenGeneralWhatsApp}
            />

            {/* Social Community & Video Draping Showcases */}
            <SocialShowcase settings={settings} />

            {/* Contact & Concierge Form */}
            <ContactSection settings={settings} />
          </>
        ) : currentTab === 'story' ? (
          <div className="py-12">
            <BrandStory
              settings={settings}
              onOpenWhatsApp={handleOpenGeneralWhatsApp}
            />
            <SocialShowcase settings={settings} />
          </div>
        ) : (
          <div className="py-12">
            <ContactSection settings={settings} />
          </div>
        )}
      </main>

      {/* 4. Luxury Footer */}
      <Footer
        onNavigate={(tab, cat) => {
          setCurrentTab(tab);
          if (cat) setCurrentCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenWhatsApp={handleOpenGeneralWhatsApp}
        settings={settings}
      />

      {/* 5. Floating Concierge Button */}
      <FloatingWhatsApp
        settings={settings}
        onOpenWhatsApp={handleOpenGeneralWhatsApp}
      />

      {/* 6. Product Details Quick View / Modal */}
      {activeModalProduct && (
        <ProductModal
          product={activeModalProduct}
          allProducts={products}
          onClose={() => setActiveModalProduct(null)}
          onAddToSelection={handleAddToSelection}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistIds.includes(activeModalProduct.id)}
          onOpenWhatsApp={handleOpenProductWhatsApp}
        />
      )}

      {/* 7. Selection Drawer ("My Selection" Cart + WhatsApp Generator) */}
      <SelectionDrawer
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        items={selection}
        onUpdateQuantity={handleUpdateSelectionQuantity}
        onRemoveItem={handleRemoveSelectionItem}
        onClearSelection={handleClearSelection}
        onRecordEnquiry={(newEnquiry) => {
          handleUpdateEnquiries([newEnquiry, ...enquiries]);
        }}
        settings={settings}
        onContinueShopping={() => {
          const gridElem = document.getElementById('boutique-catalog');
          if (gridElem) gridElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 8. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveWishlist={handleToggleWishlist}
        onMoveToSelection={(prod) => {
          handleAddToSelection(prod);
          handleToggleWishlist(prod.id);
        }}
        onQuickView={setActiveModalProduct}
        settings={settings}
      />

      {/* 9. Full Admin CMS / Boutique Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onSaveProducts={handleUpdateProducts}
        enquiries={enquiries}
        onSaveEnquiries={handleUpdateEnquiries}
        invoices={invoices}
        onSaveInvoices={handleUpdateInvoices}
        settings={settings}
        onSaveSettings={handleUpdateSettings}
      />

    </div>
  );
}
