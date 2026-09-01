import React, { useState, useEffect } from 'react';

import {
  Product,
  SelectionItem,
  EnquiryOrder,
  Invoice,
  BrandSettings,
  ProductCategory,
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
  generateWhatsAppSingleProductMessage,
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

// Brand
import { Logo } from './components/brand/Logo';

export default function App() {
  // =============================================================
  // Route State
  // =============================================================

  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname
  );

  // =============================================================
  // Persistence State
  // =============================================================

  const [products, setProducts] = useState<Product[]>([]);

  const [selection, setSelection] = useState<SelectionItem[]>([]);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [enquiries, setEnquiries] = useState<EnquiryOrder[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [settings, setSettings] =
    useState<BrandSettings>(initialBrandSettings);

  // =============================================================
  // Application Loading State
  // =============================================================

  const [isInitializing, setIsInitializing] =
    useState<boolean>(true);

  const [initializationError, setInitializationError] =
    useState<string | null>(null);

  const [isAdminDataLoading, setIsAdminDataLoading] =
    useState<boolean>(false);

  const [adminDataError, setAdminDataError] =
    useState<string | null>(null);

  // =============================================================
  // Navigation & UI State
  // =============================================================

  const [currentTab, setCurrentTab] =
    useState<string>('home');

  const [currentCategory, setCurrentCategory] =
    useState<string>('all');

  const [searchQuery, setSearchQuery] =
    useState<string>('');

  // =============================================================
  // Modal State
  // =============================================================

  const [activeModalProduct, setActiveModalProduct] =
    useState<Product | null>(null);

  const [isSelectionOpen, setIsSelectionOpen] =
    useState<boolean>(false);

  const [isWishlistOpen, setIsWishlistOpen] =
    useState<boolean>(false);

  // =============================================================
  // Admin Authentication
  // =============================================================

  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(
      sessionStorage.getItem(
        'meera_admin_authenticated'
      ) === 'true'
    );

  // =============================================================
  // Browser Navigation Handling
  // =============================================================

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  // =============================================================
  // Navigation Helper
  // =============================================================

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // =============================================================
  // INITIAL PUBLIC DATA
  // =============================================================

  useEffect(() => {
    let isMounted = true;

    const initializePublicData = async () => {
      setIsInitializing(true);
      setInitializationError(null);

      try {
        /*
         * Only load data required for the public website.
         *
         * IMPORTANT:
         * Enquiries and invoices are NOT loaded here.
         * They are admin-only data.
         */

        const [
          loadedProducts,
          loadedSelection,
          loadedWishlist,
          loadedSettings,
        ] = await Promise.all([
          loadRemoteProducts(),
          loadRemoteSelection(),
          loadRemoteWishlist(),
          loadRemoteSettings(),
        ]);

        if (!isMounted) return;

        setProducts(
          Array.isArray(loadedProducts)
            ? loadedProducts
            : []
        );

        setSelection(
          Array.isArray(loadedSelection)
            ? loadedSelection
            : []
        );

        setWishlistIds(
          Array.isArray(loadedWishlist)
            ? loadedWishlist
            : []
        );

        setSettings(
          loadedSettings || initialBrandSettings
        );

      } catch (error) {
        console.error(
          'Failed to load public app data:',
          error
        );

        if (!isMounted) return;

        setInitializationError(
          'We could not load the boutique data. Please check your internet connection and try again.'
        );
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializePublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =============================================================
  // LOAD ADMIN DATA ONLY WHEN ADMIN IS OPEN
  // =============================================================

  useEffect(() => {
    if (
      currentPath !== '/admin' ||
      !isAdminAuthenticated
    ) {
      return;
    }

    let isMounted = true;

    const initializeAdminData = async () => {
      setIsAdminDataLoading(true);
      setAdminDataError(null);

      try {
        const [
          loadedEnquiries,
          loadedInvoices,
        ] = await Promise.all([
          loadRemoteEnquiries(),
          loadRemoteInvoices(),
        ]);

        if (!isMounted) return;

        setEnquiries(
          Array.isArray(loadedEnquiries)
            ? loadedEnquiries
            : []
        );

        setInvoices(
          Array.isArray(loadedInvoices)
            ? loadedInvoices
            : []
        );

      } catch (error) {
        console.error(
          'Failed to load admin data:',
          error
        );

        if (!isMounted) return;

        setAdminDataError(
          'Some admin data could not be loaded.'
        );

      } finally {
        if (isMounted) {
          setIsAdminDataLoading(false);
        }
      }
    };

    initializeAdminData();

    return () => {
      isMounted = false;
    };
  }, [
    currentPath,
    isAdminAuthenticated,
  ]);

  // =============================================================
  // DOCUMENT TITLE
  // =============================================================

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
    currentPath,
  ]);

  // =============================================================
  // PRODUCT UPDATES
  // =============================================================

  const handleUpdateProducts = async (
    updated: Product[]
  ) => {
    // Optimistic UI update
    setProducts(updated);

    try {
      await saveRemoteProducts(updated);
    } catch (error) {
      console.error(
        'Failed to save products to backend:',
        error
      );
    }
  };

  // =============================================================
  // SELECTION UPDATES
  // =============================================================

  const handleUpdateSelection = async (
    updated: SelectionItem[]
  ) => {
    // Optimistic UI update
    setSelection(updated);

    try {
      await saveRemoteSelection(updated);
    } catch (error) {
      console.error(
        'Failed to save selection to backend:',
        error
      );
    }
  };

  // =============================================================
  // WISHLIST UPDATES
  // =============================================================

  const handleUpdateWishlist = async (
    updated: string[]
  ) => {
    // Optimistic UI update
    setWishlistIds(updated);

    try {
      await saveRemoteWishlist(updated);
    } catch (error) {
      console.error(
        'Failed to save wishlist to backend:',
        error
      );
    }
  };

  // =============================================================
  // ENQUIRY UPDATES
  // =============================================================

  const handleUpdateEnquiries = async (
    updated: EnquiryOrder[]
  ) => {
    // Sanitize timestamps and cast as any to bypass strict type mismatch if needed
    const sanitizedEnquiries = updated.map((item) => ({
      ...item,
      cancelledAt:
        typeof item.cancelledAt === 'string' && item.cancelledAt.trim() !== ''
          ? item.cancelledAt
          : undefined, // Using undefined instead of null often satisfies TS better
      createdAt:
        typeof item.createdAt === 'string' && item.createdAt.trim() !== ''
          ? item.createdAt
          : undefined,
    })) as EnquiryOrder[];

    // Optimistic UI update
    setEnquiries(sanitizedEnquiries);

    try {
      await saveRemoteEnquiries(sanitizedEnquiries);
    } catch (error) {
      console.error(
        'Failed to save enquiries to backend:',
        error
      );
    }
  };

  // =============================================================
  // INVOICE UPDATES
  // =============================================================

  const handleUpdateInvoices = async (
    updated: Invoice[]
  ) => {
    // Optimistic UI update
    setInvoices(updated);

    try {
      await saveRemoteInvoices(updated);
    } catch (error) {
      console.error(
        'Failed to save invoices to backend:',
        error
      );
    }
  };

  // =============================================================
  // SETTINGS UPDATES
  // =============================================================

  const handleUpdateSettings = async (
    updated: BrandSettings
  ) => {
    // Optimistic UI update
    setSettings(updated);

    try {
      await saveRemoteSettings(updated);
    } catch (error) {
      console.error(
        'Failed to save settings to backend:',
        error
      );
    }
  };

  // =============================================================
  // ADMIN LOGIN
  // =============================================================

  const handleAdminLoginSuccess = () => {
    sessionStorage.setItem(
      'meera_admin_authenticated',
      'true'
    );

    setIsAdminAuthenticated(true);

    navigateTo('/admin');
  };

  // =============================================================
  // ADMIN LOGOUT
  // =============================================================

  const handleAdminLogout = () => {
    sessionStorage.removeItem(
      'meera_admin_authenticated'
    );

    setIsAdminAuthenticated(false);

    // Clear admin-only data from memory
    setEnquiries([]);
    setInvoices([]);

    navigateTo('/admin');
  };

  // =============================================================
  // SELECTION ACTIONS
  // =============================================================

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

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity:
          updated[existingIndex].quantity + 1,
      };
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
        ...selection,
      ];
    }

    handleUpdateSelection(updated);

    setIsSelectionOpen(true);
  };

  // =============================================================
  // UPDATE SELECTION QUANTITY
  // =============================================================

  const handleUpdateSelectionQuantity = (
    id: string,
    newQty: number
  ) => {
    if (newQty <= 0) {
      handleRemoveSelectionItem(id);
      return;
    }

    const updated = selection.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQty,
            }
          : item
    );

    handleUpdateSelection(updated);
  };

  // =============================================================
  // REMOVE SELECTION ITEM
  // =============================================================

  const handleRemoveSelectionItem = (
    id: string
  ) => {
    const updated = selection.filter(
      (item) => item.id !== id
    );

    handleUpdateSelection(updated);
  };

  // =============================================================
  // CLEAR SELECTION
  // =============================================================

  const handleClearSelection = () => {
    handleUpdateSelection([]);
  };

  // =============================================================
  // WISHLIST
  // =============================================================

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
        productId,
      ];
    }

    handleUpdateWishlist(updated);
  };

  // =============================================================
  // GENERAL WHATSAPP
  // =============================================================

  const handleOpenGeneralWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber,
      'Hello Meera Fashion 🌸 I am browsing your London digital boutique and would like styling advice on sarees and jewellery.'
    );
  };

  // =============================================================
  // PRODUCT WHATSAPP
  // =============================================================

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

  // =============================================================
  // PERFORMANCE PRODUCT
  // =============================================================

  const performanceProduct =
    products.find(
      (product) =>
        product.isDancePerformance
    ) || products[0];

  // =============================================================
  // WISHLIST PRODUCTS
  // =============================================================

  const wishlistProducts =
    products.filter(
      (product) =>
        wishlistIds.includes(product.id)
    );

  // =============================================================
  // INITIAL LOADING SCREEN
  // =============================================================

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FFF9FA] flex items-center justify-center overflow-hidden">

        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full bg-rose-100/50 blur-3xl" />

          <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-pink-100/50 blur-3xl" />

          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-[#E8CFAF]/10 blur-3xl" />

          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-[#9E315A]/5 blur-3xl" />

        </div>

        {/* Loading Content */}
        <div className="relative flex flex-col items-center text-center px-6">

          {/* Logo */}
          <div className="relative mb-7">

            <div className="absolute inset-0 rounded-full bg-rose-200/50 blur-2xl animate-pulse" />

            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white border border-rose-100 shadow-xl flex items-center justify-center">

              <Logo
                variant="icon-only"
                size="md"
              />

            </div>

          </div>

          {/* Brand */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241B20] tracking-wide">
            Meera Fashion
          </h1>

          <p className="mt-2 text-[10px] sm:text-xs text-[#8C5D6C] tracking-[0.3em] uppercase">
            Traditional Elegance • Modern Luxury
          </p>

          {/* Loading */}
          <div className="mt-9 flex flex-col items-center">

            <div className="relative w-52 h-1 bg-rose-100 rounded-full overflow-hidden">

              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] rounded-full animate-loadingBar" />

            </div>

            <p className="mt-4 text-xs text-[#8C5D6C]">
              Preparing your boutique...
            </p>

            <p className="mt-1 text-[10px] text-[#B58A97]">
              Loading collections &amp; latest styles
            </p>

          </div>

        </div>
      </div>
    );
  }

  // =============================================================
  // INITIALIZATION ERROR
  // =============================================================

  if (initializationError) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FFF9FA] flex items-center justify-center px-6">

        <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-xl p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-5">

            <span className="text-2xl font-bold text-[#9E315A]">
              !
            </span>

          </div>

          <h2 className="font-serif text-2xl font-bold text-[#241B20]">
            Unable to Load Boutique
          </h2>

          <p className="text-sm text-[#8C5D6C] mt-3 leading-relaxed">
            {initializationError}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 px-6 py-3 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-sm font-bold transition-colors shadow-md"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =============================================================
  // ADMIN ROUTE
  // =============================================================

  if (currentPath === '/admin') {
    // -----------------------------------------------------------
    // Not Authenticated → Login
    // -----------------------------------------------------------

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

    // -----------------------------------------------------------
    // Admin Data Loading
    // -----------------------------------------------------------

    if (isAdminDataLoading) {
      return (
        <div className="min-h-screen bg-[#FFF9FA] flex items-center justify-center">

          <div className="flex flex-col items-center text-center px-6">

            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-rose-200/40 blur-xl animate-pulse" />

              <div className="relative w-20 h-20 rounded-full bg-white border border-rose-100 shadow-lg flex items-center justify-center">

                <Logo
                  variant="icon-only"
                  size="sm"
                />

              </div>

            </div>

            <h2 className="mt-6 font-serif text-2xl font-bold text-[#241B20]">
              Opening Admin Portal
            </h2>

            <p className="mt-2 text-xs text-[#8C5D6C]">
              Loading enquiries, invoices &amp; sales data...
            </p>

            <div className="mt-6 w-44 h-1 bg-rose-100 rounded-full overflow-hidden">

              <div className="h-full w-1/2 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] rounded-full animate-loadingBar" />

            </div>

          </div>

        </div>
      );
    }

    // -----------------------------------------------------------
    // Admin Data Error
    // -----------------------------------------------------------

    if (adminDataError) {
      return (
        <div className="min-h-screen bg-[#FFF9FA] flex items-center justify-center px-6">

          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-xl p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">

              <span className="text-xl font-bold text-[#9E315A]">
                !
              </span>

            </div>

            <h2 className="font-serif text-xl font-bold text-[#241B20]">
              Admin Data Unavailable
            </h2>

            <p className="text-xs text-[#8C5D6C] mt-3">
              {adminDataError}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 px-5 py-2.5 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-xs font-bold"
            >
              Retry
            </button>

          </div>

        </div>
      );
    }

    // -----------------------------------------------------------
    // Authenticated → Admin Portal
    // -----------------------------------------------------------

    return (
      <div className="min-h-screen bg-[#FFF9FA]">

        <AdminPortal
          isOpen={true}

          onClose={
            handleAdminLogout
          }

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

      {/* =======================================================
          1. ANNOUNCEMENT BAR
      ======================================================= */}

      <AnnouncementBar
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

      {/* =======================================================
          2. NAVIGATION
      ======================================================= */}

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
              behavior: 'smooth',
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
              behavior: 'smooth',
            });

            return;
          }

          if (tab === 'contact') {
            setCurrentTab('contact');

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
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
                behavior: 'smooth',
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

      {/* =======================================================
          3. MAIN VIEWS
      ======================================================= */}

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
            {/* Hero */}

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
                    behavior: 'smooth',
                  });
                }
              }}

              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }

              settings={settings}
            />

            {/* Categories */}

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
                    behavior: 'smooth',
                  });
                }
              }}
            />

            {/* Performance */}

            <PerformanceShowcase
              performanceProduct={
                performanceProduct
              }

              onQuickView={
                setActiveModalProduct
              }

              onAddToSelection={(
                product
              ) =>
                handleAddToSelection(
                  product
                )
              }

              onOpenWhatsAppForProduct={(
                product
              ) =>
                handleOpenProductWhatsApp(
                  product
                )
              }
            />

            {/* Product Catalog */}

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

            {/* Brand Story */}

            <BrandStory
              settings={settings}
              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }
            />

            {/* Social */}

            <SocialShowcase
              settings={settings}
            />

            {/* Contact */}

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

      {/* =======================================================
          4. FOOTER
      ======================================================= */}

      <Footer
        onNavigate={(tab, cat) => {
          setCurrentTab(tab);

          if (cat) {
            setCurrentCategory(cat);
          }

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}

        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }

        settings={settings}
      />

      {/* =======================================================
          5. FLOATING WHATSAPP
      ======================================================= */}

      <FloatingWhatsApp
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

      {/* =======================================================
          6. PRODUCT MODAL
      ======================================================= */}

      {activeModalProduct && (
        <ProductModal
          product={
            activeModalProduct
          }

          allProducts={
            products
          }

          onClose={() =>
            setActiveModalProduct(
              null
            )
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

      {/* =======================================================
          7. SELECTION DRAWER
      ======================================================= */}

      <SelectionDrawer
        isOpen={
          isSelectionOpen
        }

        onClose={() =>
          setIsSelectionOpen(false)
        }

        items={
          selection
        }

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
            ...enquiries,
          ]);
        }}

        settings={
          settings
        }

        onContinueShopping={() => {
          const gridElem =
            document.getElementById(
              'boutique-catalog'
            );

          if (gridElem) {
            gridElem.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }}
      />

      {/* =======================================================
          8. WISHLIST DRAWER
      ======================================================= */}

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
          product
        ) => {
          handleAddToSelection(
            product
          );

          handleToggleWishlist(
            product.id
          );
        }}

        onQuickView={
          setActiveModalProduct
        }

        settings={
          settings
        }
      />

    </div>
  );
}