import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Package,
  Calendar
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  currentLang: 'ar' | 'en';
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber,
  currentLang
}) => {
  const isRtl = currentLang === 'ar';
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber || 'DG-2026-9041');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/orders/${orderNum.trim()}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMessage(data.error || (isRtl ? 'لم نجد طلباً بهذا الرقم، يرجى التأكد من الرقم والمحاولة مجدداً.' : 'Order not found'));
      }
    } catch {
      setErrorMessage(isRtl ? 'تعذر الاتصال بالخادم' : 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderQuery(initialOrderNumber);
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('DG-2026-9041');
    }
  }, [initialOrderNumber]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">✓ {isRtl ? 'مكتمل وتم التسليم' : 'Completed'}</span>;
      case 'processing':
        return <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">⚡ {isRtl ? 'قيد التنفيذ والمتابعة' : 'Processing'}</span>;
      case 'pending_payment':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">⏳ {isRtl ? 'في انتظار إتمام الدفع' : 'Pending Payment'}</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isRtl ? 'نظام تتبع حالة الطلبات والخدمات' : 'Order Status Tracker'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrder(orderQuery);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder={isRtl ? 'أدخل رقم الطلب (مثال: DG-2026-9041)' : 'Enter Order Number (e.g. DG-2026-9041)'}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Search className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-slate-400`} />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (isRtl ? 'بحث...' : 'Searching...') : (isRtl ? 'تتبع الطلب' : 'Track')}
          </button>
        </form>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <p className="text-xs text-slate-400">{isRtl ? 'رقم الفاتورة والطلب:' : 'Order Number:'}</p>
                <p className="font-mono font-black text-slate-900 dark:text-white text-base">{order.order_number}</p>
              </div>
              <div>{getStatusBadge(order.order_status)}</div>
            </div>

            {/* Quick Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">{isRtl ? 'تاريخ الطلب:' : 'Date:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{order.created_at}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isRtl ? 'طريقة الدفع:' : 'Payment:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{order.payment_method}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isRtl ? 'المبلغ الإجمالي:' : 'Total:'}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {order.total_amount.toFixed(2)} {order.currency}
                </span>
              </div>
            </div>

            {/* Delivery / Fulfillment Note */}
            {order.delivery_notes && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isRtl ? 'بيانات التسليم والأكواد المسلّمة:' : 'Delivered Codes & Content:'}</span>
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all">
                    {order.delivery_notes}
                  </p>
                  <button
                    onClick={() => handleCopy(order.delivery_notes || '')}
                    className="flex items-center gap-1 shrink-0 mr-2 ml-2 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    {copiedKey === order.delivery_notes ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>{isRtl ? 'تم' : 'Done'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>{isRtl ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {isRtl ? 'الخدمات المتضمنة في هذا الطلب:' : 'Ordered Services:'}
              </span>
              {order.items.map((it) => (
                <div key={it.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>{it.product_name}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {it.subtotal.toFixed(2)} {order.currency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{isRtl ? 'الباقة:' : 'Package:'} {it.variant_title} × {it.quantity}</p>

                  {it.requirements && it.requirements.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                      {it.requirements.map((r, i) => (
                        <div key={i} className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>{r.field_label}:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{r.field_value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Print button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isRtl ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
