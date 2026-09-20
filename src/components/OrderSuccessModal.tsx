import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Sparkles,
  Key,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order;
  currentLang: 'ar' | 'en';
  onClose: () => void;
  onOpenTracker: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  currentLang,
  onClose,
  onOpenTracker
}) => {
  const isRtl = currentLang === 'ar';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getTimelineSteps = (status: string) => {
    const allSteps = [
      { id: 'placed', label: isRtl ? 'تم استلام الطلب' : 'Order Placed', desc: isRtl ? 'تم تسجيل الفاتورة بنجاح' : 'Invoice recorded' },
      { id: 'paid', label: isRtl ? 'تم تأكيد الدفع' : 'Payment Confirmed', desc: isRtl ? 'العملية مكتملة وآمنة' : 'Transaction secure' },
      { id: 'processing', label: isRtl ? 'بدء المعالجة' : 'Processing', desc: isRtl ? 'فحص المتطلبات والجدولة' : 'Checking requirements' },
      { id: 'in_progress', label: isRtl ? 'جارٍ التنفيذ' : 'Fulfillment', desc: isRtl ? 'إرسال التفاعل / تجهيز الحساب' : 'Executing delivery' },
      { id: 'completed', label: isRtl ? 'اكتمل بنجاح' : 'Completed', desc: isRtl ? 'تم التسليم بالكامل' : 'Order completed' }
    ];

    let currentIdx = 2;
    if (status === 'completed') currentIdx = 4;
    else if (status === 'processing') currentIdx = 2;
    else if (status === 'pending_payment') currentIdx = 0;

    return { allSteps, currentIdx };
  };

  const { allSteps, currentIdx } = getTimelineSteps(order.order_status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isRtl ? 'شكراً لك! تم استلام طلبك بنجاح' : 'Order Placed Successfully!'}
          </h2>

          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-500">{isRtl ? 'رقم الطلب:' : 'Order ID:'}</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
              {order.order_number}
            </span>
          </div>
        </div>

        {/* Order Delivery Status Note */}
        {order.delivery_notes && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Key className="h-4 w-4" />
              <span>{isRtl ? 'بيانات التسليم الفوري:' : 'Instant Delivery Content:'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
              <code className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 break-all">
                {order.delivery_notes}
              </code>
              <button
                onClick={() => handleCopy(order.delivery_notes || '')}
                className="flex items-center gap-1 shrink-0 mr-2 ml-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
              >
                {copiedKey === order.delivery_notes ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'تم النسخ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 5-Step Visual Timeline */}
        <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40">
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            {isRtl ? 'مراحل متابعة وتنفيذ الطلب:' : 'Order Execution Stages:'}
          </p>

          <div className="relative flex justify-between">
            {allSteps.map((step, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step.id} className="flex flex-col items-center text-center flex-1 z-10">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      isPassed
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/20 animate-pulse' : ''}`}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[10px] sm:text-xs font-semibold leading-tight ${
                      isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
            <span>{isRtl ? 'الخدمات المطلوبة' : 'Items'}</span>
            <span>{order.total_amount.toFixed(2)} {order.currency}</span>
          </div>
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-slate-500 text-[11px]">
              <span>{it.product_name} ({it.variant_title}) × {it.quantity}</span>
              <span className="font-mono">{it.subtotal.toFixed(2)} {order.currency}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenTracker(order.order_number);
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 transition cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            <span>{isRtl ? 'تتبع حالة الطلب والتنفيذ المباشر' : 'Track Live Order Status'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isRtl ? 'العودة للمتجر' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
};
