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
  loadRemoteProducts,
  saveRemoteProducts,
  loadRemoteSelection,
  saveRemoteSelection,
  loadRemoteWishlist,
  saveRemoteWishlist,
  loadRemoteEnquiries,
  saveRemoteEnquiries,
  loadRemoteInvoices,
  saveRemoteInvoices,
  loadRemoteSettings,
  saveRemoteSettings,
} from './services/api';

import {
  openWhatsAppChat,
  generateWhatsAppSingleProductMessage
} from './services/whatsapp';

import { initialBrandSettings } from './data/initialData';

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
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';

export default function App() {

  // -------------------------------------------------------------
  // Route State
  // -------------------------------------------------------------

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  // -------------------------------------------------------------
  // Persistence state
  // -------------------------------------------------------------

  const [products, setProducts] = useState<Product[]>([]);
  const [selection, setSelection] = useState<SelectionItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<BrandSettings>(
    initialBrandSettings
  );

  // -------------------------------------------------------------
  // Navigation & UI state
  // -------------------------------------------------------------

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentCategory, setCurrentCategory] =
    useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // -------------------------------------------------------------
  // Modal state
  // -------------------------------------------------------------

  const [activeModalProduct, setActiveModalProduct] =
    useState<Product | null>(null);

  const [isSelectionOpen, setIsSelectionOpen] =
    useState<boolean>(false);

  const [isWishlistOpen, setIsWishlistOpen] =
    useState<boolean>(false);

  // -------------------------------------------------------------
  // Admin authentication
  // -------------------------------------------------------------

  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(
      sessionStorage.getItem('meera_admin_authenticated') === 'true'
    );

  // -------------------------------------------------------------
  // Browser navigation handling
  // -------------------------------------------------------------

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // -------------------------------------------------------------
  // Simple frontend navigation helper
  // -------------------------------------------------------------

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // -------------------------------------------------------------
  // Initialize data
  // -------------------------------------------------------------

  useEffect(() => {
    const initialize = async () => {
      try {
        const [
          loadedProducts,
          loadedSelection,
          loadedWishlist,
          loadedEnquiries,
          loadedInvoices,
          loadedSettings
        ] = await Promise.all([
          loadRemoteProducts(),
          loadRemoteSelection(),
          loadRemoteWishlist(),
          loadRemoteEnquiries(),
          loadRemoteInvoices(),
          loadRemoteSettings(),
        ]);

        setProducts(loadedProducts);
        setSelection(loadedSelection);
        setWishlistIds(loadedWishlist);
        setEnquiries(loadedEnquiries);
        setInvoices(loadedInvoices);
        setSettings(loadedSettings);

      } catch (error) {
        console.error(
          'Failed to load app data from backend',
          error
        );
      }
    };

    initialize();
  }, []);

  // -------------------------------------------------------------
  // Document title
  // -------------------------------------------------------------

  useEffect(() => {
    if (settings?.brandName) {
      document.title =
        currentPath.startsWith('/admin')
          ? `${settings.brandName} | Admin Portal`
          : `${settings.brandName} | ${
              settings.tagline ||
              'Traditional Clothing & Jewelleries'
            }`;
    }
  }, [
    settings?.brandName,
    settings?.tagline,
    currentPath
  ]);

  // -------------------------------------------------------------
  // Product updates
  // -------------------------------------------------------------

  const handleUpdateProducts = async (
    updated: Product[]
  ) => {
    setProducts(updated);

    try {
      await saveRemoteProducts(updated);
    } catch (error) {
      console.error(
        'Failed to save products to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Selection updates
  // -------------------------------------------------------------

  const handleUpdateSelection = async (
    updated: SelectionItem[]
  ) => {
    setSelection(updated);

    try {
      await saveRemoteSelection(updated);
    } catch (error) {
      console.error(
        'Failed to save selection to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Wishlist updates
  // -------------------------------------------------------------

  const handleUpdateWishlist = async (
    updated: string[]
  ) => {
    setWishlistIds(updated);

    try {
      await saveRemoteWishlist(updated);
    } catch (error) {
      console.error(
        'Failed to save wishlist to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Enquiry updates
  // -------------------------------------------------------------

  const handleUpdateEnquiries = async (
    updated: EnquiryOrder[]
  ) => {
    setEnquiries(updated);

    try {
      await saveRemoteEnquiries(updated);
    } catch (error) {
      console.error(
        'Failed to save enquiries to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Invoice updates
  // -------------------------------------------------------------

  const handleUpdateInvoices = async (
    updated: Invoice[]
  ) => {
    setInvoices(updated);

    try {
      await saveRemoteInvoices(updated);
    } catch (error) {
      console.error(
        'Failed to save invoices to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Settings updates
  // -------------------------------------------------------------

  const handleUpdateSettings = async (
    updated: BrandSettings
  ) => {
    setSettings(updated);

    try {
      await saveRemoteSettings(updated);
    } catch (error) {
      console.error(
        'Failed to save settings to backend',
        error
      );
    }
  };

  // -------------------------------------------------------------
  // Admin Login
  // -------------------------------------------------------------

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    navigateTo('/admin');
  };

  // -------------------------------------------------------------
  // Admin Logout
  // -------------------------------------------------------------

  const handleAdminLogout = () => {
    sessionStorage.removeItem(
      'meera_admin_authenticated'
    );

    setIsAdminAuthenticated(false);

    navigateTo('/admin');
  };

  // -------------------------------------------------------------
  // Selection Actions
  // -------------------------------------------------------------

  const handleAddToSelection = (
    product: Product,
    selectedSize?: string
  ) => {

    const existingIndex = selection.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedSize === selectedSize
    );

    let updated: SelectionItem[];

    if (existingIndex > -1) {

      updated = [...selection];

      updated[existingIndex].quantity += 1;

    } else {

      const newItem: SelectionItem = {
        id: `sel-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,

        productId: product.id,

        product,

        quantity: 1,

        selectedSize:
          selectedSize ||
          (
            product.bangleSizes
              ? product.bangleSizes[1] ||
                product.bangleSizes[0]
              : undefined
          ),

        unitPrice: product.price,

        addedAt: new Date().toISOString(),
      };

      updated = [
        newItem,
        ...selection
      ];
    }

    handleUpdateSelection(updated);

    setIsSelectionOpen(true);
  };

  const handleUpdateSelectionQuantity = (
    id: string,
    newQty: number
  ) => {

    if (newQty <= 0) {
      handleRemoveSelectionItem(id);
      return;
    }

    const updated = selection.map((it) =>
      it.id === id
        ? {
            ...it,
            quantity: newQty
          }
        : it
    );

    handleUpdateSelection(updated);
  };

  const handleRemoveSelectionItem = (
    id: string
  ) => {

    const updated = selection.filter(
      (item) => item.id !== id
    );

    handleUpdateSelection(updated);
  };

  const handleClearSelection = () => {
    handleUpdateSelection([]);
  };

  // -------------------------------------------------------------
  // Wishlist
  // -------------------------------------------------------------

  const handleToggleWishlist = (
    productId: string
  ) => {

    let updated: string[];

    if (wishlistIds.includes(productId)) {

      updated = wishlistIds.filter(
        (id) => id !== productId
      );

    } else {

      updated = [
        ...wishlistIds,
        productId
      ];
    }

    handleUpdateWishlist(updated);
  };

  // -------------------------------------------------------------
  // WhatsApp
  // -------------------------------------------------------------

  const handleOpenGeneralWhatsApp = () => {

    openWhatsAppChat(
      settings.whatsappNumber,
      "Hello Meera Fashion 🌸 I am browsing your London digital boutique and would like styling advice on sarees and jewellery."
    );
  };

  const handleOpenProductWhatsApp = (
    product: Product,
    size?: string
  ) => {

    const msg =
      generateWhatsAppSingleProductMessage(
        product,
        {
          selectedSize: size,
          customNote: product.isPreOrder
            ? 'Inquiring regarding custom pre-order timing'
            : undefined,
        }
      );

    openWhatsAppChat(
      settings.whatsappNumber,
      msg
    );
  };

  // -------------------------------------------------------------
  // Performance Product
  // -------------------------------------------------------------

  const performanceProduct =
    products.find(
      (p) => p.isDancePerformance
    ) || products[0];

  // -------------------------------------------------------------
  // Wishlist Products
  // -------------------------------------------------------------

  const wishlistProducts =
    products.filter(
      (p) => wishlistIds.includes(p.id)
    );

  // =============================================================
  // ADMIN ROUTE
  // =============================================================

  if (currentPath === '/admin') {

    // Not authenticated → Login
    if (!isAdminAuthenticated) {

      return (
        <AdminLoginPage
          settings={settings}
          onLoginSuccess={
            handleAdminLoginSuccess
          }
        />
      );
    }

    // Authenticated → Admin Portal
    return (
      <div className="min-h-screen bg-[#FFF9FA]">

        <AdminPortal
          isOpen={true}
          onClose={handleAdminLogout}

          products={products}
          onSaveProducts={
            handleUpdateProducts
          }

          enquiries={enquiries}
          onSaveEnquiries={
            handleUpdateEnquiries
          }

          invoices={invoices}
          onSaveInvoices={
            handleUpdateInvoices
          }

          settings={settings}
          onSaveSettings={
            handleUpdateSettings
          }
        />

      </div>
    );
  }

  // =============================================================
  // PUBLIC WEBSITE
  // =============================================================

  return (
    <div className="min-h-screen bg-white text-[#241B20] flex flex-col font-sans selection:bg-[#F8DDE7] selection:text-[#9E315A]">

      {/* 1. Announcement Bar */}
      <AnnouncementBar
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

      {/* 2. Navigation */}
      <Navbar
        currentTab={currentTab}

        onNavigate={(tab, cat) => {

          if (tab === 'home') {

            setCurrentTab('home');

            if (cat) {
              setCurrentCategory(cat);
            }

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

            return;
          }

          if (
            tab === 'story' ||
            tab === 'about'
          ) {

            setCurrentTab('story');

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

            return;
          }

          if (tab === 'contact') {

            setCurrentTab('contact');

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

            return;
          }

          setCurrentTab('home');

          if (cat) {

            setCurrentCategory(cat);

          } else if (tab === 'offers') {

            setCurrentCategory('offers');
          }

          setTimeout(() => {

            const gridElem =
              document.getElementById(
                'boutique-catalog'
              );

            if (gridElem) {

              gridElem.scrollIntoView({
                behavior: 'smooth'
              });
            }

          }, 50);
        }}

        selectionCount={
          selection.reduce(
            (acc, item) =>
              acc + item.quantity,
            0
          )
        }

        selectionTotal={
          selection.reduce(
            (acc, item) =>
              acc +
              item.quantity *
              item.unitPrice,
            0
          )
        }

        wishlistCount={
          wishlistIds.length
        }

        onOpenSelection={() =>
          setIsSelectionOpen(true)
        }

        onOpenWishlist={() =>
          setIsWishlistOpen(true)
        }

        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }

        searchQuery={searchQuery}

        onSearchChange={
          setSearchQuery
        }

        settings={settings}
      />

      {/* 3. Main Views */}
      <main className="flex-1">

        {(
          currentTab === 'home' ||
          currentTab === 'sarees' ||
          currentTab === 'jewellery' ||
          currentTab === 'performance' ||
          currentTab === 'lehengas' ||
          currentTab === 'shalwar' ||
          currentTab === 'offers'
        ) ? (

          <>

            <CinematicHero
              onExplore={(cat) => {

                if (cat) {
                  setCurrentCategory(cat);
                }

                const gridElem =
                  document.getElementById(
                    'boutique-catalog'
                  );

                if (gridElem) {
                  gridElem.scrollIntoView({
                    behavior: 'smooth'
                  });
                }
              }}

              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }

              settings={settings}
            />

            <CategoryBoutique
              onSelectCategory={(
                cat: ProductCategory
              ) => {

                setCurrentCategory(cat);

                const gridElem =
                  document.getElementById(
                    'boutique-catalog'
                  );

                if (gridElem) {
                  gridElem.scrollIntoView({
                    behavior: 'smooth'
                  });
                }
              }}
            />

            <PerformanceShowcase
              performanceProduct={
                performanceProduct
              }

              onQuickView={
                setActiveModalProduct
              }

              onAddToSelection={(
                prod
              ) =>
                handleAddToSelection(prod)
              }

              onOpenWhatsAppForProduct={(
                prod
              ) =>
                handleOpenProductWhatsApp(
                  prod
                )
              }
            />

            <div id="boutique-catalog">

              <ProductGrid
                products={products}
                currentCategory={
                  currentCategory
                }

                onSelectCategory={
                  setCurrentCategory
                }

                onQuickView={
                  setActiveModalProduct
                }

                onAddToSelection={
                  handleAddToSelection
                }

                onToggleWishlist={
                  handleToggleWishlist
                }

                wishlistIds={
                  wishlistIds
                }

                onOpenWhatsApp={
                  handleOpenProductWhatsApp
                }

                searchQuery={
                  searchQuery
                }

                settings={settings}
              />

            </div>

            <BrandStory
              settings={settings}
              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }
            />

            <SocialShowcase
              settings={settings}
            />

            <ContactSection
              settings={settings}
            />

          </>

        ) : currentTab === 'story' ? (

          <div className="py-12">

            <BrandStory
              settings={settings}
              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }
            />

            <SocialShowcase
              settings={settings}
            />

          </div>

        ) : (

          <div className="py-12">

            <ContactSection
              settings={settings}
            />

          </div>
        )}

      </main>

      {/* 4. Footer */}
      <Footer
        onNavigate={(tab, cat) => {

          setCurrentTab(tab);

          if (cat) {
            setCurrentCategory(cat);
          }

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }}

        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }

        settings={settings}
      />

      {/* 5. Floating WhatsApp */}
      <FloatingWhatsApp
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

      {/* 6. Product Modal */}
      {activeModalProduct && (

        <ProductModal
          product={
            activeModalProduct
          }

          allProducts={
            products
          }

          onClose={() =>
            setActiveModalProduct(null)
          }

          onAddToSelection={
            handleAddToSelection
          }

          onToggleWishlist={
            handleToggleWishlist
          }

          isWishlisted={
            wishlistIds.includes(
              activeModalProduct.id
            )
          }

          onOpenWhatsApp={
            handleOpenProductWhatsApp
          }
        />

      )}

      {/* 7. Selection Drawer */}
      <SelectionDrawer
        isOpen={
          isSelectionOpen
        }

        onClose={() =>
          setIsSelectionOpen(false)
        }

        items={selection}

        onUpdateQuantity={
          handleUpdateSelectionQuantity
        }

        onRemoveItem={
          handleRemoveSelectionItem
        }

        onClearSelection={
          handleClearSelection
        }

        onRecordEnquiry={(
          newEnquiry
        ) => {

          handleUpdateEnquiries([
            newEnquiry,
            ...enquiries
          ]);
        }}

        settings={settings}

        onContinueShopping={() => {

          const gridElem =
            document.getElementById(
              'boutique-catalog'
            );

          if (gridElem) {

            gridElem.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }}
      />

      {/* 8. Wishlist Drawer */}
      <WishlistDrawer
        isOpen={
          isWishlistOpen
        }

        onClose={() =>
          setIsWishlistOpen(false)
        }

        wishlistProducts={
          wishlistProducts
        }

        onRemoveWishlist={
          handleToggleWishlist
        }

        onMoveToSelection={(
          prod
        ) => {

          handleAddToSelection(prod);

          handleToggleWishlist(
            prod.id
          );
        }}

        onQuickView={
          setActiveModalProduct
        }

        settings={settings}
      />

    </div>
  );
}