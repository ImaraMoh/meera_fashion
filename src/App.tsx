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

// Brand Logo Asset
import LogoImage from './assets/logo.png';

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
    const now = new Date().toISOString();

    const sanitizedProducts: Product[] = updated.map(
      (product) => {
        const createdAt =
          typeof product.createdAt === 'string' &&
          product.createdAt.trim() !== ''
            ? product.createdAt
            : now;

        const updatedAt = now;

        return {
          ...product,
          id:
            typeof product.id === 'string' &&
            product.id.trim() !== ''
              ? product.id
              : `prod-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,

          name:
            typeof product.name === 'string'
              ? product.name.trim()
              : '',

          slug:
            typeof product.slug === 'string' &&
            product.slug.trim() !== ''
              ? product.slug
              : product.name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, ''),

          category:
            product.category || 'sarees',

          subcategory:
            typeof product.subcategory === 'string'
              ? product.subcategory
              : '',

          description:
            typeof product.description === 'string'
              ? product.description
              : '',

          shortDescription:
            typeof product.shortDescription === 'string'
              ? product.shortDescription
              : '',

          material:
            typeof product.material === 'string'
              ? product.material
              : '',

          color:
            typeof product.color === 'string'
              ? product.color
              : '',

          stockStatus:
            product.stockStatus || 'In Stock',

          stockQuantity:
            typeof product.stockQuantity === 'number'
              ? product.stockQuantity
              : 0,

          price:
            typeof product.price === 'number'
              ? product.price
              : 0,

          images: {
            main:
              typeof product.images?.main === 'string'
                ? product.images.main
                : '',

            front:
              typeof product.images?.front === 'string'
                ? product.images.front
                : undefined,

            back:
              typeof product.images?.back === 'string'
                ? product.images.back
                : undefined,

            detail:
              typeof product.images?.detail === 'string'
                ? product.images.detail
                : undefined,

            wearing:
              typeof product.images?.wearing === 'string'
                ? product.images.wearing
                : undefined,
          },

          isPreOrder: Boolean(product.isPreOrder),
          isFeatured: Boolean(product.isFeatured),
          isNewArrival: Boolean(product.isNewArrival),
          isOffer: Boolean(product.isOffer),
          isDancePerformance:
            Boolean(product.isDancePerformance),

          saleEnabled:
            product.saleEnabled !== false,

          rentalEnabled:
            Boolean(product.rentalEnabled),

          createdAt,
          updatedAt,
        };
      }
    );

    setProducts(sanitizedProducts);

    try {
      await saveRemoteProducts(
        sanitizedProducts
      );
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
  // ENQUIRY UPDATES (Sanitized to prevent timestamp {} errors)
  // =============================================================

  const handleUpdateEnquiries = async (
    updated: EnquiryOrder[]
  ) => {
    const sanitizedEnquiries = updated.map((item) => ({
      ...item,

      cancelledAt:
        typeof item.cancelledAt === 'string' &&
        item.cancelledAt.trim() !== ''
          ? item.cancelledAt
          : undefined,

      createdAt:
        typeof item.createdAt === 'string' &&
        item.createdAt.trim() !== ''
          ? item.createdAt
          : undefined,

      statusUpdatedAt:
        typeof item.statusUpdatedAt === 'string' &&
        item.statusUpdatedAt.trim() !== ''
          ? item.statusUpdatedAt
          : new Date().toISOString(),
    })) as EnquiryOrder[];

    setEnquiries(sanitizedEnquiries);

    try {
      await saveRemoteEnquiries(sanitizedEnquiries);
    } catch (error) {
      console.error(
        '❌ Failed to save enquiries to backend:',
        error
      );

      throw error;
    }
  };

  // =============================================================
  // INVOICE UPDATES
  // =============================================================

  const handleUpdateInvoices = async (
    updated: Invoice[]
  ) => {
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
    console.log('==========================================');
    console.log('🔐 MEERA FASHION ADMIN LOGOUT');
    console.log('==========================================');

    sessionStorage.removeItem('meera_admin_authenticated');
    localStorage.removeItem('meera_admin_authenticated');

    setIsAdminAuthenticated(false);

    // Clear admin-only data from memory
    setEnquiries([]);
    setInvoices([]);

    // Stay on /admin.
    // Since authentication is now false,
    // App.tsx automatically renders AdminLoginPage.
    navigateTo('/admin');

    console.log('✅ Admin authentication cleared');
    console.log('➡️ Returning to AdminLoginPage');
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
  // PREMIUM INITIAL LOADING SCREEN
  // =============================================================

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#1C1418] flex items-center justify-center overflow-hidden">
        {/* Luxury Background Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-[#9E315A]/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-48 -right-48 w-[550px] h-[550px] rounded-full bg-[#E8CFAF]/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center text-center px-6 max-w-md">
          {/* Large Premium Logo */}
          <div className="relative mb-8 group">
            <div className="absolute inset-0 rounded-full bg-[#9E315A]/30 blur-3xl animate-ping" />
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center p-3">
              <img
                src={settings.customLogoUrl || LogoImage}
                alt={settings.brandName || "Meera Fashion"}
                className="w-full h-full object-contain drop-shadow-2xl animate-pulse"
              />
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-widest uppercase">
            {settings.brandName || "Meera Fashion"}
          </h1>

          <div className="flex items-center gap-3 mt-3">
            <span className="h-[1px] w-10 bg-[#E8CFAF]/40" />
            <span className="text-[10px] sm:text-xs text-[#E8CFAF] tracking-[0.35em] uppercase font-semibold">
              {settings.tagline || "Traditional Elegance"}
            </span>
            <span className="h-[1px] w-10 bg-[#E8CFAF]/40" />
          </div>

          {/* Premium Loading Progress Bar */}
          <div className="mt-12 w-64 flex flex-col items-center">
            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden shadow-inner">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#9E315A] via-[#C94F7C] to-[#E8CFAF] rounded-full animate-loadingBar" />
            </div>
            
            <p className="mt-5 text-xs font-mono text-rose-200/70 tracking-widest uppercase">
              Entering London Boutique...
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
            className="mt-6 px-6 py-3 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-sm font-bold transition-colors shadow-md cursor-pointer"
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

    if (isAdminDataLoading) {
      return (
        <div className="min-h-screen bg-[#1C1418] flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#9E315A]/30 blur-2xl animate-pulse" />
              <div className="relative w-28 h-28 flex items-center justify-center">
                <img
                  src={settings.customLogoUrl || LogoImage}
                  alt={settings.brandName || "Meera Fashion"}
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
              Opening Admin Portal
            </h2>

            <p className="mt-2 text-xs text-rose-200/70">
              Synchronizing enquiries, invoices &amp; sales data...
            </p>

            <div className="mt-6 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-[#9E315A] to-[#C94F7C] rounded-full animate-loadingBar" />
            </div>
          </div>
        </div>
      );
    }

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
              className="mt-5 px-5 py-2.5 rounded-full bg-[#9E315A] hover:bg-[#832247] text-white text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

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
      <AnnouncementBar
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

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
                    behavior: 'smooth',
                  });
                }
              }}
              onOpenWhatsApp={
                handleOpenGeneralWhatsApp
              }
              settings={settings}
              products={products}
            />

            <CategoryBoutique
              products={products}
              onSelectCategory={(cat: ProductCategory) => {
                setCurrentCategory(cat);

                const gridElem = document.getElementById(
                  'boutique-catalog'
                );

                if (gridElem) {
                  gridElem.scrollIntoView({
                    behavior: 'smooth',
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
              products={products}
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
              products={products}
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

      <FloatingWhatsApp
        settings={settings}
        onOpenWhatsApp={
          handleOpenGeneralWhatsApp
        }
      />

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

      <SelectionDrawer
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        items={selection}
        onUpdateQuantity={handleUpdateSelectionQuantity}
        onRemoveItem={handleRemoveSelectionItem}
        onClearSelection={handleClearSelection}
        onRecordEnquiry={async (newEnquiry) => {
          await handleUpdateEnquiries([
            newEnquiry,
            ...enquiries,
          ]);
        }}
        settings={settings}
        onContinueShopping={() => {
          const gridElem =
            document.getElementById('boutique-catalog');

          if (gridElem) {
            gridElem.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }}
      />

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