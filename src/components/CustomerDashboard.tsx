import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Tv,
  Key,
  Wallet,
  Bell,
  Lock,
  LogOut,
  Copy,
  Check,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Order, Subscription, DigitalInventoryItem, WalletTransaction } from '../types';
import { formatCurrency, convertToSAR } from '../lib/currency';

interface CustomerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: 'ar' | 'en';
  currency: string;
  walletBalance: number;
  onDepositWallet: (amount: number) => void;
  onOpenOrderTracker: (orderNum: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  isOpen,
  onClose,
  currentLang,
  currency,
  walletBalance,
  onDepositWallet,
  onOpenOrderTracker
}) => {
  const isRtl = currentLang === 'ar';
  const [activeTab, setActiveTab] = useState<'orders' | 'subscriptions' | 'keys' | 'wallet' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [digitalKeys, setDigitalKeys] = useState<DigitalInventoryItem[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Top-up modal state
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('50');

  useEffect(() => {
    // Fetch orders
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) setOrders(data.orders);
      })
      .catch(() => {});

    // Fetch subscriptions
    fetch('/api/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subscriptions) setSubscriptions(data.subscriptions);
      })
      .catch(() => {});

    // Fetch digital keys
    fetch('/api/digital-inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) setDigitalKeys(data.items);
      })
      .catch(() => {});

    // Fetch wallet
    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wallet?.transactions) setTransactions(data.wallet.transactions);
      })
      .catch(() => {});
  }, [isOpen]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredAmount = Number(topupAmount);
    if (enteredAmount > 0) {
      const amountInSAR = convertToSAR(enteredAmount, currency);
      onDepositWallet(amountInSAR);
      setShowTopupModal(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-6 max-h-[92vh] overflow-hidden">
        {/* Header Profile Section */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-xl font-bold text-white shadow-lg">
                AM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold">أحمد المنصوري</h2>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                    {isRtl ? 'عميل موثق ✓' : 'Verified VIP'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">customer@example.com • +966501234567</p>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3 px-4">
              <div>
                <span className="text-[11px] text-slate-300 block">{isRtl ? 'رصيد المحفظة المتاح:' : 'Available Balance:'}</span>
                <span className="font-mono text-xl font-black text-emerald-400">
                  {formatCurrency(walletBalance, currency, isRtl).fullText}
                </span>
              </div>
              <button
                onClick={() => setShowTopupModal(true)}
                className="flex items-center gap-1 rounded-xl bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-400 cursor-pointer transition shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isRtl ? 'شحن رصيد' : 'Top-up'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 sm:gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                activeTab === 'orders' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{isRtl ? 'طلباتي' : 'Orders'}</span>
              <span className="text-[10px] rounded-full bg-indigo-100 text-indigo-700 px-1.5 py-0.2 ml-1">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                activeTab === 'subscriptions' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Tv className="h-4 w-4" />
              <span>{isRtl ? 'اشتراكاتي' : 'Subscriptions'}</span>
              <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.2 ml-1">
                {subscriptions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('keys')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                activeTab === 'keys' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Key className="h-4 w-4" />
              <span>{isRtl ? 'مفاتيح البرامج' : 'License Keys'}</span>
              <span className="text-[10px] rounded-full bg-cyan-100 text-cyan-700 px-1.5 py-0.2 ml-1">
                {digitalKeys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>{isRtl ? 'حركات المحفظة' : 'Wallet'}</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد طلبات سابقة مسجلة' : 'No previous orders found'}
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {o.order_number}
                        </span>
                        <span className="text-xs text-slate-400">• {o.created_at}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(o.total_amount, currency, isRtl).fullText}
                        </span>
                        <button
                          onClick={() => onOpenOrderTracker(o.order_number)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500 cursor-pointer"
                        >
                          <span>{isRtl ? 'تتبع' : 'Track'}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {o.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{it.product_name} ({it.variant_title})</span>
                          <span className="text-slate-400">×{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {o.delivery_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                        <strong>{isRtl ? 'التسليم:' : 'Fulfillment:'}</strong> {o.delivery_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد اشتراكات نشطة حالياً' : 'No active subscriptions'}
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={sub.image} alt={sub.product_name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.product_name}</h4>
                          <p className="text-xs text-slate-500">
                            {isRtl ? 'ينتهي في:' : 'Expires:'} {sub.expires_at}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
                        {isRtl ? `متبقي ${sub.days_left} يوم` : `${sub.days_left} Days Left`}
                      </span>
                    </div>

                    {/* Expiration progress bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, (sub.days_left / sub.duration_days) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Account credentials card */}
                    {sub.credentials && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {sub.credentials}
                        </code>
                        <button
                          onClick={() => handleCopy(sub.credentials || '')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer flex items-center gap-1 shrink-0 mr-2 ml-2"
                        >
                          {copiedText === sub.credentials ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>{isRtl ? 'تم النسخ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>{isRtl ? 'نسخ البيانات' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: DIGITAL KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-3">
              {digitalKeys.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {isRtl ? 'لم تطلب مفاتيح رقمية بعد' : 'No license keys found'}
                </div>
              ) : (
                digitalKeys.map((k) => (
                  <div
                    key={k.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {k.product_name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{isRtl ? 'رقم الطلب:' : 'Order:'} {k.order_number}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="rounded-xl bg-slate-100 dark:bg-slate-900 px-3 py-1.5 font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                        {k.content}
                      </code>
                      <button
                        onClick={() => handleCopy(k.content)}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer flex items-center gap-1"
                      >
                        {copiedText === k.content ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedText === k.content ? (isRtl ? 'تم' : 'Done') : (isRtl ? 'نسخ' : 'Copy')}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: WALLET TRANSACTIONS */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'سجل العمليات المالية والمشتريات:' : 'Transaction History:'}
                </span>
                <button
                  onClick={() => setShowTopupModal(true)}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                >
                  {isRtl ? '+ شحن رصيد جديد' : '+ Top up'}
                </button>
              </div>

              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                      <span className="text-[10px] text-slate-400">{tx.created_at}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, currency, isRtl).fullText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isRtl ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>

        {/* Top-up Balance Modal */}
        {showTopupModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isRtl ? 'شحن المحفظة الإلكترونية' : 'Top up Wallet Balance'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'أدخل المبلغ المراد إيداعه واستخدم رصيدك للشراء الفوري بنقرة واحدة.' : 'Enter amount to deposit into your account.'}
              </p>

              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? `المبلغ المراد شحنه (${currency})` : `Amount (${currency})`}
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-mono text-base font-bold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  {[25, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopupAmount(String(preset))}
                      className="flex-1 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    {isRtl ? 'تأكيد الشحن' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
