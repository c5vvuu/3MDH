import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  MessageSquareQuote,
  Send,
  Lock
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { formatCurrency } from '../lib/currency';

interface ProductDetailModalProps {
  product: Product;
  currency: string;
  currentLang: 'ar' | 'en';
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant | undefined, quantity: number, requirements: Record<string, string>) => void;
  onDirectBuy: (product: Product, variant: ProductVariant | undefined, quantity: number, requirements: Record<string, string>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  currentLang,
  onClose,
  onAddToCart,
  onDirectBuy
}) => {
  const isRtl = currentLang === 'ar';

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [requirementValues, setRequirementValues] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Customer Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
      setQuantity(1);
      setRequirementValues({});
      setValidationErrors({});
      setActiveTab('details');
      setReviewSubmitted(false);

      // Fetch reviews
      fetch(`/api/products/${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.product.reviews) {
            setReviewsList(data.product.reviews);
          }
        })
        .catch(() => {});
    }
  }, [product]);

  // Current Unit Price
  const currentPrice = selectedVariant
    ? (selectedVariant.discount_price || selectedVariant.price)
    : (product.discount_price || product.base_price);

  const totalPrice = currentPrice * quantity;

  const handleInputChange = (fieldLabel: string, value: string) => {
    setRequirementValues((prev) => ({ ...prev, [fieldLabel]: value }));
    if (validationErrors[fieldLabel]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldLabel];
        return copy;
      });
    }
  };

  const validateRequirements = (): boolean => {
    if (!product.requirements || product.requirements.length === 0) return true;
    const errors: Record<string, string> = {};

    for (const req of product.requirements) {
      if (req.is_required) {
        const val = requirementValues[req.field_label]?.trim();
        if (!val) {
          errors[req.field_label] = isRtl
            ? `يرجى إدخال ${req.field_label}`
            : `Please enter ${req.field_label_en || req.field_label}`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCart = () => {
    if (!validateRequirements()) return;
    onAddToCart(product, selectedVariant, quantity, requirementValues);
  };

  const handleBuyNow = () => {
    if (!validateRequirements()) return;
    onDirectBuy(product, selectedVariant, quantity, requirementValues);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        user_name: newReviewAuthor.trim() || (isRtl ? 'عميل موثق' : 'Verified Buyer'),
        rating: newReviewRating,
        comment: newReviewComment.trim()
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviewsList((prev) => [data.review, ...prev]);
          setNewReviewComment('');
          setNewReviewAuthor('');
          setReviewSubmitted(true);
        }
      })
      .catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.delivery_type === 'code' ? (isRtl ? 'مفتاح رقمي فوري' : 'Instant Key') : (isRtl ? 'خدمة مضمونة' : 'Guaranteed Service')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            <div className="sm:col-span-4 rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>

            <div className="sm:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500">
                  {product.total_reviews} {isRtl ? 'تقييم موثق' : 'Verified Reviews'}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isRtl ? 'ضمان كامل المدة' : 'Full Warranty'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                {isRtl ? product.name : product.name_en}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isRtl ? product.description : product.description_en || product.description}
              </p>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>
                  {isRtl ? 'وقت البدء والتسليم:' : 'Delivery Time:'}{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{product.delivery_time_text}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (تفاصيل الخدمة / تقييمات العملاء) */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRtl ? 'تخصيص الخيارات والطلب' : 'Options & Customization'}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>{isRtl ? 'آراء وتقييمات العملاء' : 'Customer Reviews'}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                {reviewsList.length}
              </span>
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Variant Selector if available */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isRtl ? 'اختر الباقة / الكمية المناسبة:' : 'Select Package / Quantity:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      const vPrice = v.discount_price || v.price;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {isRtl ? v.title : v.title_en}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {v.delivery_time} {v.duration_days ? `• ${v.duration_days} ${isRtl ? 'يوم' : 'Days'}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                              {formatCurrency(vPrice, currency, isRtl).value}
                            </span>
                            <span className="text-[10px] text-slate-500 mr-1 ml-1">
                              {formatCurrency(vPrice, currency, isRtl).symbol}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Customer Requirements Form */}
              {product.requirements && product.requirements.length > 0 && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/20 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span>{isRtl ? 'بيانات مطلوبة لتنفيذ الخدمة بدقة:' : 'Required Information for Fulfillment:'}</span>
                  </div>

                  {product.requirements.map((req) => (
                    <div key={req.id} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        {isRtl ? req.field_label : req.field_label_en}
                        {req.is_required === 1 && (
                          <span className="text-rose-500 font-bold ml-1 mr-1">* ({isRtl ? 'مطلوب' : 'Required'})</span>
                        )}
                      </label>

                      {req.field_type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={requirementValues[req.field_label] || ''}
                          onChange={(e) => handleInputChange(req.field_label, e.target.value)}
                          placeholder={req.placeholder}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      ) : (
                        <input
                          type={req.field_type === 'number' ? 'number' : req.field_type === 'email' ? 'email' : 'text'}
                          value={requirementValues[req.field_label] || ''}
                          onChange={(e) => handleInputChange(req.field_label, e.target.value)}
                          placeholder={req.placeholder}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      )}

                      {validationErrors[req.field_label] && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {validationErrors[req.field_label]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    <span>
                      {isRtl
                        ? 'نحن لا نطلب كلمة مرور حسابك نهائياً. بياناتك مشفرة ومحمية بالكامل.'
                        : 'We never ask for your account password. All info is strictly private and secure.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRtl ? 'الكمية المراد طلبها:' : 'Order Quantity:'}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Reviews Tab */
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد تقييمات سابقة، كن أول من يقيّم هذه الخدمة!' : 'No reviews yet, be the first to review!'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.user_name}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full dark:bg-emerald-950/60 dark:text-emerald-400">
                            {isRtl ? 'مشتري موثق ✓' : 'Verified Buyer'}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isRtl ? 'أضف تقييمك وتجربتك للخدمة:' : 'Write a Review:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={isRtl ? 'اسمك أو اسم مستعار' : 'Your name'}
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5) ممتاز جداً</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5) جيد جداً</option>
                    <option value={3}>⭐⭐⭐ (3/5) جيد</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder={isRtl ? 'اكتب رأيك وتجربتك هنا...' : 'Write your feedback here...'}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>{isRtl ? 'إرسال التقييم' : 'Submit Review'}</span>
                </button>
                {reviewSubmitted && (
                  <p className="text-xs text-emerald-600 font-bold">
                    {isRtl ? 'شكراً لك! تم نشر تقييمك بنجاح.' : 'Thank you! Your review has been added.'}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-500 block">
              {isRtl ? 'الإجمالي للطلب:' : 'Total Amount:'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {formatCurrency(totalPrice, currency, isRtl).value}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {formatCurrency(totalPrice, currency, isRtl).symbol}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleAddCart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-indigo-600 bg-indigo-50 px-5 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isRtl ? 'إضافة للسلة' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>{isRtl ? 'الدفع والشراء الفوري' : 'Direct Checkout'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
