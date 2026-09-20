import React, { useState } from 'react';
import {
  Package,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Zap,
  Tag
} from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';
import { formatCurrency } from '../lib/currency';

interface ServicesPageProps {
  products: Product[];
  categories: Category[];
  currency: string;
  currentLang: 'ar' | 'en';
  settings: StoreSettings;
  onSelectProduct: (p: Product) => void;
  onBackToHome: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  products,
  categories,
  currency,
  currentLang,
  settings,
  onSelectProduct,
  onBackToHome
}) => {
  const isRtl = currentLang === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all, service, subscription, digital, package
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');

  // Filter products
  const filtered = products.filter((p) => {
    // Category filter
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
      return false;
    }
    // Type filter
    if (selectedType === 'package') {
      // Products with multiple packages/variants or bundle
      if (!p.variants || p.variants.length < 2) return false;
    } else if (selectedType !== 'all' && p.type !== selectedType) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSku) return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filtered].sort((a, b) => {
    if (sortBy === 'price_low') {
      const priceA = a.discount_price || a.base_price;
      const priceB = b.discount_price || b.base_price;
      return priceA - priceB;
    }
    if (sortBy === 'price_high') {
      const priceA = a.discount_price || a.base_price;
      const priceB = b.discount_price || b.base_price;
      return priceB - priceA;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    // featured
    return (b.is_featured || 0) - (a.is_featured || 0);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>{isRtl ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="cursor-pointer hover:text-indigo-600" onClick={onBackToHome}>
              {isRtl ? 'الرئيسية' : 'Home'}
            </span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {isRtl ? 'دليل الخدمات والباقات' : 'Services & Packages'}
            </span>
          </div>
        </div>

        {/* Page Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isRtl ? 'كتالوج الخدمات والباقات الرقمية' : 'Digital Services & Packages Catalog'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
              {isRtl ? 'جميع الخدمات والباقات المتاحة للتنفيذ' : 'All Digital Services & Subscription Packages'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {isRtl
                ? 'استعرض كافة باقات السوشيال ميديا، الاشتراكات الرسمية، ومفاتيح التفعيل بأسعار تنافسية. يدعم المتجر طرق دفع يدوية متعددة ومحلية (Zain Cash, CliQ, Orange Money, Binance Pay, RedotPay) بالإضافة إلى PayPal.'
                : 'Explore all social media packages, official streaming subscriptions, and software keys with fast delivery and flexible manual & PayPal payments.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isRtl ? 'تسليم آلي وموثق' : 'Instant Verified Delivery'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>{isRtl ? 'ضمان كامل المدة' : 'Full Term Guarantee'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{isRtl ? 'محافظ أردنية وعالمية' : 'Local & Global Wallets'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="space-y-4">
          {/* Main Filter Row */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث في الخدمات، الباقات، أو المفاتيح...' : 'Search services, packages or keys...'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-slate-400`} />
            </div>

            {/* Type selector pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: isRtl ? 'الكل' : 'All' },
                { id: 'package', label: isRtl ? '🎁 باقات مجمعة' : '🎁 Bundles' },
                { id: 'service', label: isRtl ? '📱 خدمات السوشيال' : '📱 Social' },
                { id: 'subscription', label: isRtl ? '🎬 الاشتراكات' : '🎬 Subscriptions' },
                { id: 'digital', label: isRtl ? '🔑 مفاتيح البرامج' : '🔑 Licenses' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">{isRtl ? 'ترتيب:' : 'Sort:'}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="featured">{isRtl ? 'الأكثر تميزاً' : 'Featured'}</option>
                <option value="price_low">{isRtl ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
                <option value="price_high">{isRtl ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
                <option value="rating">{isRtl ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
              </select>
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {isRtl ? `جميع الأقسام (${products.length})` : `All Categories (${products.length})`}
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{isRtl ? cat.name : cat.name_en}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            {isRtl
              ? `عرض ${sortedProducts.length} من إجمالي ${products.length} خدمة وباقة متاحة`
              : `Showing ${sortedProducts.length} of ${products.length} services & packages`}
          </span>
        </div>

        {/* Products & Packages Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRtl ? 'لم نتمكن من العثور على خدمات مطابقة' : 'No matching services found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isRtl
                ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر'
                : 'Try modifying your search query or clear selected category filters.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const hasDiscount = product.discount_price && product.discount_price < product.base_price;
              const displayPrice = product.discount_price || product.base_price;
              const discountPercent = hasDiscount
                ? Math.round(((product.base_price - product.discount_price!) / product.base_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Image Thumbnail with Badges */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        {hasDiscount && (
                          <span className="rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                            -{discountPercent}%
                          </span>
                        )}
                        {product.is_featured === 1 && (
                          <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span>{isRtl ? 'مميز' : 'Featured'}</span>
                          </span>
                        )}
                      </div>

                      {/* Type Badge */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="rounded-lg bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                          {product.type === 'service'
                            ? isRtl ? 'خدمة فورية' : 'Service'
                            : product.type === 'subscription'
                            ? isRtl ? 'اشتراك رسمي' : 'Subscription'
                            : isRtl ? 'مفتاح رقمي' : 'Digital Key'}
                        </span>
                      </div>
                    </div>

                    {/* Content info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">{product.sku}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <span>★</span>
                          <span>{product.rating}</span>
                          <span className="text-slate-400">({product.total_reviews})</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition dark:text-white line-clamp-2">
                        {isRtl ? product.name : product.name_en}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {isRtl ? product.description : product.description_en || product.description}
                      </p>
                    </div>

                    {/* Variants list summary if packages exist */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>{isRtl ? `الباقات المتوفرة (${product.variants.length})` : `Packages (${product.variants.length})`}</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{isRtl ? 'اختر باقتك' : 'Select pack'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.slice(0, 3).map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {isRtl ? v.title : v.title_en}
                            </span>
                          ))}
                          {product.variants.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{product.variants.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isRtl ? 'يبدأ من' : 'Starts from'}</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(displayPrice, currency, isRtl).fullText}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {formatCurrency(product.base_price, currency, isRtl).fullText}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3.5 py-2 text-xs font-bold hover:bg-indigo-600 hover:text-white transition group-hover:bg-indigo-600 group-hover:text-white cursor-pointer"
                    >
                      {isRtl ? 'طلب الباقة' : 'Choose'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
