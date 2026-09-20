/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  CartItem,
  StoreSettings,
  Order,
  ProductVariant
} from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminPanel } from './components/AdminPanel';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { Footer } from './components/Footer';
import { Search, RefreshCw } from 'lucide-react';

import { initialCategories, initialProducts } from './data';

export default function App() {
  // App-wide state
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');
  const [selectedCurrency, setSelectedCurrency] = useState('SAR');
  const [walletBalance, setWalletBalance] = useState(150.00);

  // Data state
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'عمده ستور',
    store_name_en: '3mdh store',
    store_url: 'https://3mdh.store/',
    store_tagline: 'وجهتك الأولى للخدمات الرقمية، الباقات، ومفاتيح البرامج بأعلى أمان وسرعة تنفيذ',
    store_logo: '/icon.svg',
    default_currency: 'JOD',
    allowed_currencies: ['JOD', 'SAR', 'AED', 'USD', 'USDT', 'KWD', 'EGP'],
    primary_color: '#4f46e5',
    secondary_color: '#06b6d4',
    support_whatsapp: '+962791234567',
    support_email: 'support@3mdh.store',
    support_telegram: '@amdh_support',
    payment_paypal_enabled: '1',
    payment_paypal_client_id: 'sb-paypal-client-id-live-demo',
    payment_paypal_mode: 'live',
    payment_wallet_enabled: '1',
    manual_payment_methods: [],
    smtp_host: 'mail.3mdh.store',
    smtp_port: '465',
    smtp_secure: 'ssl',
    smtp_username: 'noreply@3mdh.store',
    homepage_sections: ['hero', 'categories', 'featured', 'reviews']
  });

  // Modals & Drawers state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const local = localStorage.getItem('digitex_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [latestCompletedOrder, setLatestCompletedOrder] = useState<Order | null>(null);
  const [trackerOrderNumber, setTrackerOrderNumber] = useState<string | undefined>(undefined);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'tracker' | 'cart' | 'account'>('home');

  // Set RTL or LTR document direction
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('digitex_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Fetch initial products and categories
  const fetchData = async () => {
    try {
      const [catRes, prodRes, setRes] = await Promise.all([
        fetch('/api/categories').catch(() => null),
        fetch('/api/products').catch(() => null),
        fetch('/api/settings').catch(() => null)
      ]);

      if (catRes && catRes.ok) {
        const catData = await catRes.json().catch(() => null);
        if (catData?.success && catData.categories) {
          setCategories(catData.categories);
        }
      }

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json().catch(() => null);
        if (prodData?.success && prodData.products) {
          setProducts(prodData.products);
        }
      }

      if (setRes && setRes.ok) {
        const setData = await setRes.json().catch(() => null);
        if (setData?.success && setData.settings) {
          setSettings(prev => ({ ...prev, ...setData.settings }));
        }
      }
    } catch (err) {
      console.warn('API routes not reachable; using static offline catalog data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategoryId && p.category_id !== activeCategoryId) {
        return false;
      }
      // Type filter
      if (selectedProductType !== 'all' && p.type !== selectedProductType) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q) || (p.name_en && p.name_en.toLowerCase().includes(q));
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSku) return false;
      }
      return true;
    });
  }, [products, activeCategoryId, selectedProductType, searchQuery]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    variant: ProductVariant | undefined,
    quantity: number,
    requirements: Record<string, string>
  ) => {
    const unitPrice = variant ? (variant.discount_price || variant.price) : (product.discount_price || product.base_price);
    const cartItemId = `${product.id}-${variant ? variant.id : 'default'}-${Date.now()}`;

    const newItem: CartItem = {
      cart_item_id: cartItemId,
      product_id: product.id,
      product,
      variant: variant || undefined,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
      requirements
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.cart_item_id === cartItemId) {
            const nextQty = it.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...it,
              quantity: nextQty,
              total_price: it.unit_price * nextQty
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((it) => it.cart_item_id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleDepositWallet = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
  };

  const handleCheckoutSuccess = (order: Order) => {
    setIsCartOpen(false);
    setLatestCompletedOrder(order);
  };

  const handleMobileNavSelect = (tab: 'home' | 'categories' | 'tracker' | 'cart' | 'account') => {
    setMobileTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'tracker') {
      setTrackerOrderNumber(undefined);
      setIsOrderTrackerOpen(true);
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'account') {
      setIsCustomerDashboardOpen(true);
    }
  };

  const isRtl = currentLang === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Offline Alert Banner */}
      <OfflineBanner currentLang={currentLang} />

      {/* Main Top Navigation */}
      <Navbar
        settings={settings}
        currentLang={currentLang}
        onToggleLang={() => setCurrentLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        currentCurrency={selectedCurrency}
        onChangeCurrency={setSelectedCurrency}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsCustomerDashboardOpen(true)}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onOpenOrderTracker={() => {
          setTrackerOrderNumber(undefined);
          setIsOrderTrackerOpen(true);
        }}
        allProducts={products}
        onSelectProduct={(p: Product) => setSelectedProductForModal(p)}
      />

      {/* Hero Section */}
      <Hero
        settings={settings}
        currentLang={currentLang}
        onScrollToCatalog={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenOrderTracker={() => {
          setTrackerOrderNumber(undefined);
          setIsOrderTrackerOpen(true);
        }}
      />

      {/* Catalog & Services Section */}
      <main id="catalog-section" className="flex-1 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          currentLang={currentLang}
          totalProductsCount={products.length}
        />

        {/* Filters and Type Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Type tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold ml-1 mr-1 text-[11px] hidden md:inline">
              {isRtl ? 'تصنيف العرض:' : 'Filter Type:'}
            </span>
            {[
              { id: 'all', label: isRtl ? 'جميع الخدمات' : 'All Items' },
              { id: 'service', label: isRtl ? 'خدمات السوشيال' : 'Social Services' },
              { id: 'subscription', label: isRtl ? 'اشتراكات رسمية' : 'Subscriptions' },
              { id: 'digital', label: isRtl ? 'مفاتيح برامج' : 'License Keys' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedProductType(t.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedProductType === t.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search box within catalog & Currency */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث في الخدمات...' : 'Filter products...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Search className={`absolute top-2.5 sm:top-2 ${isRtl ? 'left-2.5' : 'right-2.5'} h-3.5 w-3.5 text-slate-400`} />
            </div>

            {/* Currency Switcher */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 sm:py-1.5 font-bold font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white shrink-0"
            >
              {settings.allowed_currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingData ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-xs font-bold">{isRtl ? 'جارٍ تحميل الخدمات والمخزون...' : 'Loading services...'}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {isRtl ? 'لم نجد أي خدمة تطابق معايير البحث' : 'No products found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isRtl ? 'جرّب إعادة تعيين الفلاتر أو البحث بكلمات أخرى.' : 'Try changing your search keywords or resetting filters.'}
            </p>
            <button
              onClick={() => {
                setActiveCategoryId(null);
                setSelectedProductType('all');
                setSearchQuery('');
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
            >
              {isRtl ? 'إظهار كافة الخدمات' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full max-w-full">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                currency={selectedCurrency}
                currentLang={currentLang}
                onSelect={(p: Product) => setSelectedProductForModal(p)}
                onQuickBuy={(p: Product) => {
                  if (p.requirements && p.requirements.length > 0) {
                    setSelectedProductForModal(p);
                  } else {
                    const defaultVariant = p.variants?.[0] || undefined;
                    handleAddToCart(p, defaultVariant, 1, {});
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Slide-overs */}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          currency={selectedCurrency}
          currentLang={currentLang}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={(product, variant, qty, reqs) => {
            handleAddToCart(product, variant, qty, reqs);
          }}
          onDirectBuy={(product, variant, qty, reqs) => {
            handleAddToCart(product, variant, qty, reqs);
            setSelectedProductForModal(null);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          currency={selectedCurrency}
          currentLang={currentLang}
          settings={settings}
          walletBalance={walletBalance}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Order Success & Instant License Key Celebration Modal */}
      {latestCompletedOrder && (
        <OrderSuccessModal
          order={latestCompletedOrder}
          currentLang={currentLang}
          onClose={() => setLatestCompletedOrder(null)}
          onOpenTracker={(orderNum) => {
            setLatestCompletedOrder(null);
            setTrackerOrderNumber(orderNum);
            setIsOrderTrackerOpen(true);
          }}
        />
      )}

      {/* Order Status Tracker Modal */}
      {isOrderTrackerOpen && (
        <OrderTrackerModal
          isOpen={isOrderTrackerOpen}
          onClose={() => setIsOrderTrackerOpen(false)}
          initialOrderNumber={trackerOrderNumber}
          currentLang={currentLang}
        />
      )}

      {/* Customer Dashboard Modal */}
      {isCustomerDashboardOpen && (
        <CustomerDashboard
          isOpen={isCustomerDashboardOpen}
          onClose={() => setIsCustomerDashboardOpen(false)}
          currentLang={currentLang}
          currency={selectedCurrency}
          walletBalance={walletBalance}
          onDepositWallet={handleDepositWallet}
          onOpenOrderTracker={(orderNum) => {
            setIsCustomerDashboardOpen(false);
            setTrackerOrderNumber(orderNum);
            setIsOrderTrackerOpen(true);
          }}
        />
      )}

      {/* Comprehensive Admin Panel Modal */}
      {isAdminPanelOpen && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          categories={categories}
          allProducts={products}
          currentLang={currentLang}
          currency={selectedCurrency}
          onRefreshProducts={fetchData}
          settings={settings}
          onSaveSettings={setSettings}
        />
      )}

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleMobileNavSelect}
        cartCount={cart.length}
        currentLang={currentLang}
      />

      {/* PWA 1-Tap Install Prompt */}
      <PWAInstallPrompt currentLang={currentLang} />

      {/* Store Footer */}
      <Footer
        currentLang={currentLang}
        onOpenTracker={() => {
          setTrackerOrderNumber(undefined);
          setIsOrderTrackerOpen(true);
        }}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
      />
    </div>
  );
}
