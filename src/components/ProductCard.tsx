import React from 'react';
import {
  Star,
  Zap,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/currency';

interface ProductCardProps {
  product: Product;
  currency: string;
  currentLang: 'ar' | 'en';
  onSelect: (p: Product) => void;
  onQuickBuy: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  currentLang,
  onSelect,
  onQuickBuy
}) => {
  const isRtl = currentLang === 'ar';

  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const currentPrice = product.discount_price || product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.base_price - (product.discount_price || 0)) / product.base_price) * 100)
    : 0;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service':
        return isRtl ? 'خدمة تنفيذية' : 'Service';
      case 'subscription':
        return isRtl ? 'اشتراك رسمي' : 'Subscription';
      case 'digital':
        return isRtl ? 'مفتاح رقمي' : 'Digital Key';
      default:
        return isRtl ? 'منتج رقمي' : 'Digital';
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col justify-between w-full max-w-full rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs hover:border-indigo-400 hover:shadow-xl transition duration-200 dark:border-slate-800 dark:bg-slate-900 cursor-pointer relative overflow-hidden box-border"
    >
      {/* Top Media & Badges */}
      <div className="w-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition duration-300 block"
            loading="lazy"
          />

          {/* Type Badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{getTypeLabel(product.type)}</span>
          </div>

          {/* Discount Pill */}
          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 rounded-md bg-rose-600 px-2 py-1 text-[11px] font-black text-white shadow-sm animate-pulse">
              {isRtl ? `وفر ${discountPercent}%` : `${discountPercent}% OFF`}
            </div>
          )}

          {/* Delivery Speed Badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            <Clock className="h-3 w-3 text-emerald-500" />
            <span>{product.delivery_time_text}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {isRtl ? product.name : product.name_en}
        </h3>

        {/* Description snippet */}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {isRtl ? product.description : product.description_en || product.description}
        </p>
      </div>

      {/* Footer Info: Rating, Variants, Price, Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2 text-xs">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[11px]">({product.total_reviews})</span>
          </div>

          {/* Variants Count if exists */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              <Layers className="h-3 w-3" />
              <span>{product.variants.length} {isRtl ? 'خيارات' : 'Options'}</span>
            </div>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {formatCurrency(currentPrice, currency, isRtl).value}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {formatCurrency(currentPrice, currency, isRtl).symbol}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through font-mono">
                {formatCurrency(product.base_price, currency, isRtl).fullText}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickBuy(product);
            }}
            className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 transition shadow-xs cursor-pointer"
          >
            <span>{isRtl ? 'طلب الآن' : 'Order Now'}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
