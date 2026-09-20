import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  Upload,
  Coins,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { CartItem, PaymentMethod, StoreSettings, Coupon, ManualPaymentMethod } from '../types';
import { formatCurrency, convertFromSAR } from '../lib/currency';
import { INITIAL_MANUAL_PAYMENT_METHODS } from '../data/manualPaymentMethods';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: string;
  currentLang: 'ar' | 'en';
  settings: StoreSettings;
  walletBalance: number;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (orderData: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  currentLang,
  settings,
  walletBalance,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}) => {
  const isRtl = currentLang === 'ar';

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Customer Contact Info
  const [customerName, setCustomerName] = useState('أحمد العمري');
  const [customerEmail, setCustomerEmail] = useState('customer@3mdh.store');
  const [customerPhone, setCustomerPhone] = useState('+962791234567');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Selection: 'paypal' | 'wallet' | 'manual'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('manual');
  // Sub-method for manual: e.g. 'zain_cash_jo', 'binance_pay', 'cliq_jo', etc.
  const [selectedManualMethodId, setSelectedManualMethodId] = useState<string>('zain_cash_jo');

  // Manual payment submission inputs
  const [paymentTransactionRef, setPaymentTransactionRef] = useState('');
  const [paymentSenderInfo, setPaymentSenderInfo] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Manual payment methods available from settings or fallback list
  const activeManualMethods: ManualPaymentMethod[] =
    settings.manual_payment_methods && settings.manual_payment_methods.length > 0
      ? settings.manual_payment_methods.filter((m) => m.is_active)
      : INITIAL_MANUAL_PAYMENT_METHODS.filter((m) => m.is_active);

  const activeManualMethod = activeManualMethods.find((m) => m.id === selectedManualMethodId) || activeManualMethods[0];

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Mock receipt upload simulation
  const handleSimulatedReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real life or cPanel uploads to /uploads/receipts/, here generate readable preview string
      setPaymentReceiptUrl(`https://3mdh.store/uploads/receipts/${Date.now()}_${file.name}`);
    }
  };

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal
        })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
      } else {
        setCouponError(data.error || (isRtl ? 'كوبون الخصم غير صالح' : 'Invalid coupon code'));
      }
    } catch {
      setCouponError(isRtl ? 'حدث خطأ أثناء التحقق' : 'Verification failed');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    setCheckoutError('');

    if (!customerName.trim() || !customerEmail.trim()) {
      setCheckoutError(isRtl ? 'يرجى إدخال الاسم الكامل والبريد الإلكتروني' : 'Name and email are required');
      return;
    }

    if (selectedPaymentMethod === 'wallet' && walletBalance < finalTotal) {
      setCheckoutError(
        isRtl
          ? `رصيد المحفظة (${formatCurrency(walletBalance, currency, isRtl).fullText}) غير كافٍ لتغطية المبلغ المطلوب (${formatCurrency(finalTotal, currency, isRtl).fullText})`
          : `Insufficient wallet balance (${formatCurrency(walletBalance, currency, isRtl).fullText}) for total (${formatCurrency(finalTotal, currency, isRtl).fullText})`
      );
      return;
    }

    if (selectedPaymentMethod === 'manual') {
      if (!paymentTransactionRef.trim() && !paymentSenderInfo.trim() && !paymentReceiptUrl) {
        setCheckoutError(
          isRtl
            ? 'يرجى إدخال الرقم المرجعي للتحويل أو اسم/رقم حساب المحول لتأكيد الدفع اليدوي'
            : 'Please provide transaction ID or sender account name/phone to verify manual payment'
        );
        return;
      }
    }

    setIsSubmittingOrder(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        customer_notes: customerNotes.trim(),
        payment_method: selectedPaymentMethod,
        manual_method_id: selectedPaymentMethod === 'manual' ? activeManualMethod?.id : undefined,
        manual_method_name: selectedPaymentMethod === 'manual' ? (isRtl ? activeManualMethod?.name : activeManualMethod?.name_en) : undefined,
        payment_transaction_ref: selectedPaymentMethod === 'manual' ? paymentTransactionRef.trim() : undefined,
        payment_sender_info: selectedPaymentMethod === 'manual' ? paymentSenderInfo.trim() : undefined,
        payment_receipt_url: selectedPaymentMethod === 'manual' ? paymentReceiptUrl : undefined,
        currency,
        subtotal,
        discount_amount: discountAmount,
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant?.id,
          product_name: item.product.name,
          variant_title: item.variant?.title || 'الافتراضي',
          price: item.unit_price,
          quantity: item.quantity,
          subtotal: item.total_price,
          duration_days: item.variant?.duration_days || item.product.duration_days,
          requirements: Object.entries(item.requirements).map(([k, v]) => ({
            field_label: k,
            field_value: v
          }))
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        onClearCart();
        onCheckoutSuccess(data.order);
      } else {
        setCheckoutError(data.error || (isRtl ? 'تعذر إتمام الطلب' : 'Failed to process order'));
      }
    } catch {
      setCheckoutError(isRtl ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
              {step === 'cart'
                ? isRtl ? 'سلة الطلبات والخدمات' : 'Shopping Cart'
                : isRtl ? 'إتمام الدفع واختيار البوابة' : 'Checkout & Payment'}
            </h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {items.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Tag className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isRtl ? 'سلة الطلبات فارغة' : 'Your cart is empty'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isRtl
                  ? 'تصفح خدماتنا وباقاتنا الرقمية وأضف ما يناسبك بضغطة زر.'
                  : 'Browse our digital services & subscriptions to get started.'}
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
              >
                <span>{isRtl ? 'تصفح الخدمات والباقات' : 'Browse Services'}</span>
              </button>
            </div>
          ) : step === 'cart' ? (
            /* Step 1: Cart Items Review */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400">
                  {isRtl ? 'الخدمات المضافة' : 'Selected Services'}
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{isRtl ? 'إفراغ السلة' : 'Clear all'}</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 relative group"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {isRtl ? item.product.name : item.product.name_en}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.cart_item_id)}
                          className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {isRtl ? item.variant.title : item.variant.title_en}
                        </p>
                      )}

                      {/* Display entered customer requirements summary */}
                      {Object.keys(item.requirements).length > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                          {Object.entries(item.requirements).map(([k, v]) => (
                            <div key={k} className="truncate">
                              <span className="font-semibold">{k}: </span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1.5">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.cart_item_id, -1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1 text-slate-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.cart_item_id, 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                          {formatCurrency(item.total_price, currency, isRtl).fullText}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <div className="pt-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={isRtl ? 'كود الخصم (مثال: RAMADAN أو APP15)' : 'Promo Code (e.g. RAMADAN)'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono uppercase text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                    <Tag className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} h-3.5 w-3.5 text-slate-400`} />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isRtl ? 'تطبيق' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ {isRtl ? `تم تطبيق الكوبون (${appliedCoupon.code})` : `Coupon Applied (${appliedCoupon.code})`}
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      -{formatCurrency(appliedCoupon.discount_amount, currency, isRtl).fullText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Checkout Information & Payment */
            <div className="space-y-5">
              {/* Back to cart button */}
              <button
                onClick={() => setStep('cart')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>{isRtl ? 'العودة لمراجعة السلة' : 'Back to Cart'}</span>
              </button>

              {/* Customer Contact Details */}
              <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'بيانات استلام الفاتورة والتنفيذ:' : 'Contact & Invoice Info:'}
                </h3>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      {isRtl ? 'البريد الإلكتروني (لاستلام الفاتورة وبيانات الخدمة) *' : 'Email (for invoice & digital keys) *'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      {isRtl ? 'رقم الواتساب للتواصل والتأكيد' : 'WhatsApp Phone'}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      {isRtl ? 'ملاحظات إضافية على الطلب (اختياري)' : 'Order notes (optional)'}
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder={isRtl ? 'أي تعليمات تود إرفاقها لفريق التنفيذ...' : 'Any special notes...'}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR - ONLY PAYPAL, WALLET, AND MANUAL (NO NOON/MYFATOORAH/APPLEPAY/MADA) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'اختر طريقة الدفع (إلكتروني أو يدوي معتمد):' : 'Select Payment Gateway:'}
                </label>

                {/* 1. MANUAL PAYMENT METHODS TAB (Main focus) */}
                <div
                  onClick={() => setSelectedPaymentMethod('manual')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'manual'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{isRtl ? 'طرق الدفع اليدوية (محافظ الأردن، بينانس، ريدوت باي)' : 'Manual Payment Methods'}</span>
                          <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 font-bold">
                            {isRtl ? 'معتمد' : 'Verified'}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isRtl ? 'زين كاش، كليك CliQ، أورنج موني، Binance Pay، RedotPay' : 'Zain Cash, CliQ, Binance Pay, RedotPay'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {isRtl ? 'اختيار' : 'Select'}
                    </span>
                  </div>

                  {/* Manual Methods Sub-selector */}
                  {selectedPaymentMethod === 'manual' && (
                    <div className="mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/60 space-y-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isRtl ? 'اختر بوابة التحويل اليدوية المناسبة لك:' : 'Choose specific manual wallet / account:'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeManualMethods.map((method) => {
                          const isSelected = selectedManualMethodId === method.id;
                          return (
                            <button
                              key={method.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedManualMethodId(method.id);
                              }}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:border-slate-300'
                              }`}
                            >
                              <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0">
                                {method.icon_type === 'zain'
                                  ? 'ZC'
                                  : method.icon_type === 'cliq'
                                  ? 'CL'
                                  : method.icon_type === 'binance'
                                  ? 'BN'
                                  : method.icon_type === 'redotpay'
                                  ? 'RP'
                                  : 'JD'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {isRtl ? method.name : method.name_en}
                                </p>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {method.currency}
                                </span>
                              </div>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Manual Method Details Card */}
                      {activeManualMethod && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {isRtl ? activeManualMethod.name : activeManualMethod.name_en}
                            </span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                              {isRtl ? `العملة: ${activeManualMethod.currency}` : `Currency: ${activeManualMethod.currency}`}
                            </span>
                          </div>

                          {/* Account info to transfer to */}
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">
                                {activeManualMethod.category === 'crypto'
                                  ? 'Binance Pay ID / USDT:'
                                  : activeManualMethod.category === 'global_wallet'
                                  ? 'RedotPay User ID:'
                                  : activeManualMethod.icon_type === 'cliq'
                                  ? 'CliQ Alias / كليك مستعار:'
                                  : isRtl ? 'رقم الحساب / المحفظة المعتمدة:' : 'Recipient Wallet / Account:'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(activeManualMethod.recipient_account, 'account');
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                              >
                                {copiedField === 'account' ? (
                                  <span className="text-emerald-600 flex items-center gap-0.5">
                                    <Check className="h-3 w-3" />
                                    {isRtl ? 'تم النسخ!' : 'Copied!'}
                                  </span>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="font-mono text-sm font-black text-slate-900 dark:text-white select-all">
                              {activeManualMethod.recipient_account}
                            </p>
                            {activeManualMethod.account_name && (
                              <p className="text-[11px] text-slate-500">
                                {isRtl ? 'اسم صاحب الحساب:' : 'Account Name:'}{' '}
                                <strong className="text-slate-700 dark:text-slate-300">
                                  {activeManualMethod.account_name}
                                </strong>
                              </p>
                            )}
                          </div>

                          {/* Instructions */}
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
                            💡 {isRtl ? activeManualMethod.instructions : activeManualMethod.instructions_en || activeManualMethod.instructions}
                          </p>

                          {/* Customer Confirmation Form Fields */}
                          <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="font-bold text-[11px] text-slate-900 dark:text-white">
                              {isRtl ? 'أدخل إثبات التحويل لاعتماده من لوحة التحكم:' : 'Submit Transfer Verification Info:'}
                            </p>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                {isRtl ? 'الرقم المرجعي للعملية / معرّف التحويل (TxID / Ref) *' : 'Transaction Reference / TxID *'}
                              </label>
                              <input
                                type="text"
                                value={paymentTransactionRef}
                                onChange={(e) => setPaymentTransactionRef(e.target.value)}
                                placeholder="مثال: 9840219482 أو TxID"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-mono text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                {isRtl ? 'اسم أو رقم هاتف صاحب الحساب المحوِّل' : 'Sender Account Name / Phone Number'}
                              </label>
                              <input
                                type="text"
                                value={paymentSenderInfo}
                                onChange={(e) => setPaymentSenderInfo(e.target.value)}
                                placeholder="مثال: أحمد المنصوري / 079xxxxxxx"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                {isRtl ? 'إرفاق صورة إشعار أو إيصال التحويل (اختياري وسريع)' : 'Upload Receipt Screenshot (optional)'}
                              </label>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold cursor-pointer hover:bg-indigo-100/50">
                                  <Upload className="h-3.5 w-3.5" />
                                  <span>{paymentReceiptUrl ? (isRtl ? 'تم اختيار الإيصال ✓' : 'Receipt Attached ✓') : (isRtl ? 'رفع صورة الإيصال' : 'Upload Receipt')}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleSimulatedReceiptUpload}
                                  />
                                </label>
                                {paymentReceiptUrl && (
                                  <span className="text-[10px] text-emerald-600 font-mono truncate max-w-xs">
                                    {paymentReceiptUrl.split('/').pop()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. PAYPAL OFFICIAL GATEWAY */}
                <div
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#003087] text-white flex items-center justify-center font-black text-sm italic shadow-xs">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        PayPal (باي بال الدولي المعتمد)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {isRtl ? 'دفع آلي فوري عبر حساب وبطاقات باي بال الدولية' : 'Official international PayPal checkout'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#0070ba]">PayPal</span>
                </div>

                {/* 3. STORE WALLET BALANCE */}
                <div
                  onClick={() => setSelectedPaymentMethod('wallet')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'wallet'
                      ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {isRtl ? 'رصيد المحفظة الإلكترونية في المتجر' : 'Store Wallet Balance'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {isRtl ? 'الرصيد المتاح حالياً:' : 'Available balance:'}{' '}
                        <strong className="text-teal-600 dark:text-teal-400 font-mono">
                          {formatCurrency(walletBalance, currency, isRtl).fullText}
                        </strong>
                      </p>
                    </div>
                  </div>
                  {walletBalance >= finalTotal ? (
                    <span className="text-xs font-bold text-emerald-600">{isRtl ? 'متاح' : 'Available'}</span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-500">{isRtl ? 'رصيد غير كافٍ' : 'Low balance'}</span>
                  )}
                </div>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{checkoutError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary & Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0 space-y-3 safe-area-pb">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{isRtl ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono">{formatCurrency(subtotal, currency, isRtl).fullText}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{isRtl ? 'خصم الكوبون:' : 'Discount:'}</span>
                  <span className="font-mono">-{formatCurrency(discountAmount, currency, isRtl).fullText}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>{isRtl ? 'المبلغ الإجمالي للدفع:' : 'Final Amount:'}</span>
                <span className="font-mono text-base text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(finalTotal, currency, isRtl).fullText}
                </span>
              </div>
            </div>

            {/* Action CTA */}
            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
              >
                <span>{isRtl ? 'المتابعة لاختيار بوابة الدفع وبيانات الطلب' : 'Proceed to Checkout & Payment'}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmittingOrder}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isSubmittingOrder
                    ? (isRtl ? 'جارٍ تسجيل وتأكيد الطلب...' : 'Processing Order...')
                    : selectedPaymentMethod === 'manual'
                    ? (isRtl ? `تأكيد الطلب اليدوي (${formatCurrency(finalTotal, currency, isRtl).fullText})` : `Submit Manual Order (${formatCurrency(finalTotal, currency, isRtl).fullText})`)
                    : (isRtl ? `تأكيد ودفع ${formatCurrency(finalTotal, currency, isRtl).fullText}` : `Pay ${formatCurrency(finalTotal, currency, isRtl).fullText}`)}
                </span>
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isRtl ? 'عمده ستور 3mdh.store - تسليم موثق وضمان كامل المدة' : '3mdh store - 100% Guaranteed Delivery'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
