import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  ShieldCheck,
  Bell,
  Globe,
  Download,
  Sparkles,
  ChevronDown,
  X,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  Smartphone
} from 'lucide-react';
import { StoreSettings, Product } from '../types';
import { usePWAInstall } from '../lib/pwa';

interface NavbarProps {
  settings: StoreSettings;
  currentLang: 'ar' | 'en';
  onToggleLang: () => void;
  currentCurrency: string;
  onChangeCurrency: (curr: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenOrderTracker: () => void;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentLang,
  onToggleLang,
  currentCurrency,
  onChangeCurrency,
  cartCount,
  onOpenCart,
  onOpenAccount,
  onOpenAdmin,
  onOpenOrderTracker,
  allProducts,
  onSelectProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const { isInstallable, install } = usePWAInstall();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const isRtl = currentLang === 'ar';

  const popularSearches = isRtl
    ? ['انستقرام', 'نتفلكس', 'ويندوز 11', 'يوتيوب', 'كانفا']
    : ['Instagram', 'Netflix', 'Windows 11', 'YouTube', 'Canva'];

  const filteredSearchResults = searchQuery.trim()
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchRef.current && !searchRef.current.contains(target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs dark:border-slate-800 dark:bg-slate-900/95">
      {/* Top Banner with Service Guarantee */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-slate-200 dark:bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isRtl ? 'تسليم فوري وآلي على مدار 24 ساعة لجميع الخدمات الرقمية' : '24/7 Automated Instant Digital Delivery'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <a
              href="/api/app/download-apk"
              download="3mdh-Store.apk"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition cursor-pointer font-semibold"
              title={isRtl ? 'تحميل تطبيق الأندرويد APK' : 'Download Android APK'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تطبيق الأندرويد (APK)' : 'Android App (APK)'}</span>
            </a>

            <button
              onClick={onOpenOrderTracker}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isRtl ? 'متابعة حالة الطلب' : 'Track Order'}</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isRtl ? 'لوحة تحكم المدير (cPanel Ready)' : 'Admin Panel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                  {isRtl ? (settings.store_name || 'عمده ستور') : (settings.store_name_en || '3mdh store')}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50">
                  3MDH
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {isRtl ? 'متجر عمده ستور للخدمات الرقمية والباقات' : '3mdh Digital Store & Subscriptions'}
              </p>
            </div>
          </a>
        </div>

        {/* Global Search Bar (Desktop & Tablet) */}
        <div ref={searchRef} className="relative hidden md:block w-full max-w-md mx-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={isRtl ? 'ابحث عن خدمة، اشتراك، متابعين، أو كود...' : 'Search services, subscriptions, followers, or keys...'}
              className="w-full rounded-full border border-slate-300 bg-slate-100/80 py-2 pl-4 pr-10 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Search className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-slate-400`} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} text-slate-400 hover:text-slate-600`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Autocomplete & Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              {searchQuery.trim() === '' ? (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'الأكثر بحثاً اليوم' : 'Popular Searches'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                        }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition dark:bg-slate-800 dark:text-slate-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchResults.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  <div className="text-xs font-semibold text-slate-400 mb-1">
                    {isRtl ? `النتائج (${filteredSearchResults.length})` : `Results (${filteredSearchResults.length})`}
                  </div>
                  {filteredSearchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {isRtl ? prod.name : prod.name_en}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {prod.discount_price || prod.base_price} {currentCurrency}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950/60 dark:text-indigo-400">
                        {prod.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-500 py-3">
                  {isRtl ? 'لم نجد نتائج مطابقة لبحثك' : 'No matching services found'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>{currentCurrency}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-1.5 w-28 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
                {settings.allowed_currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      onChangeCurrency(curr);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`block w-full text-right px-3 py-1.5 text-xs font-medium ${
                      currentCurrency === curr
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            title={isRtl ? 'Switch to English' : 'التحويل للعربية'}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>{isRtl ? 'EN' : 'عربي'}</span>
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isRtl ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 dark:border-slate-800">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {isRtl ? 'الإشعارات والتنبيهات' : 'Notifications'}
                  </span>
                  <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950 dark:text-indigo-400">
                    {isRtl ? '3 جديدة' : '3 New'}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {isRtl ? '🎉 كود خصم 15% فعال الآن!' : '🎉 15% Discount Code is Live!'}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {isRtl ? 'استخدم كود RAMADAN عند الدفع للحصول على خصم فوري.' : 'Use code RAMADAN at checkout for instant discount.'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {isRtl ? '⚡ تسليم آلي فوري مفعّل' : '⚡ Instant Delivery Ready'}
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {isRtl ? 'مفاتيح التفعيل واشتراكات نتفلكس تُسلم فورياً بعد الدفع.' : 'License keys & Netflix delivered instantly upon payment.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Search"
            title={isRtl ? 'البحث' : 'Search'}
          >
            <Search className="h-5 w-5" />
          </button>

          {/* User Account / Dashboard Button */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isRtl ? 'حسابي والطلبات' : 'My Account'}
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline text-xs font-semibold">
              {isRtl ? 'حسابي' : 'Account'}
            </span>
          </button>

          {/* Cart Trigger with Counter */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 sm:gap-2 rounded-xl bg-indigo-600 px-3 sm:px-3.5 py-2 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline text-xs font-bold">
              {isRtl ? 'السلة' : 'Cart'}
            </span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-extrabold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div ref={mobileSearchRef} className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={isRtl ? 'ابحث عن خدمة، اشتراك، متابعين...' : 'Search services, subscriptions...'}
              className="w-full rounded-full border border-slate-300 bg-slate-100/90 py-2.5 pl-4 pr-10 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Search className={`absolute top-3 ${isRtl ? 'left-3.5' : 'right-3.5'} h-4 w-4 text-slate-400`} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-3 ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-400 hover:text-slate-600`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Search Results */}
          {isSearchOpen && (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-72 overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'الأكثر بحثاً اليوم' : 'Popular Searches'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition dark:bg-slate-800 dark:text-slate-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : filteredSearchResults.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400 mb-1">
                    {isRtl ? `النتائج (${filteredSearchResults.length})` : `Results (${filteredSearchResults.length})`}
                  </div>
                  {filteredSearchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        setIsMobileSearchOpen(false);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isRtl ? prod.name : prod.name_en}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prod.discount_price || prod.base_price} {currentCurrency}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950/60 dark:text-indigo-400">
                        {prod.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-500 py-3">
                  {isRtl ? 'لم نجد نتائج مطابقة لبحثك' : 'No matching services found'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
