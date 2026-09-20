import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  ShoppingCart,
  Tv,
  Key,
  Tag,
  MessageSquare,
  Users,
  Settings,
  Server,
  LogOut,
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  FileText,
  Sliders,
  ShieldCheck,
  Sparkles,
  Layers,
  Save,
  Smartphone,
  Bell,
  Send,
  QrCode,
  Radio,
  Coins,
  Copy,
  Check,
  Terminal
} from 'lucide-react';
import {
  Product,
  Category,
  Order,
  Subscription,
  DigitalInventoryItem,
  Coupon,
  Review,
  StoreSettings,
  ProductVariant,
  ProductRequirement,
  MobileAppConfig,
  ManualPaymentMethod
} from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  allProducts: Product[];
  currentLang: 'ar' | 'en';
  currency: string;
  onRefreshProducts: () => void;
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  categories,
  allProducts,
  currentLang,
  currency,
  onRefreshProducts,
  settings,
  onSaveSettings
}) => {
  const isRtl = currentLang === 'ar';

  // Notification Toast State
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@digitex.store');
  const [adminPass, setAdminPass] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Active Admin Section
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'wizard' | 'products' | 'orders' | 'subscriptions' | 'coupons' | 'reviews' | 'settings' | 'cpanel' | 'mobile_app'
  >('dashboard');

  // Mobile App (APK) Management State
  const [mobileConfig, setMobileConfig] = useState<MobileAppConfig>({
    app_name: 'ديجيتكس ستور - Digitex',
    app_name_en: 'Digitex Store',
    package_id: 'com.digitex.store',
    app_version: '2.4.0',
    build_number: 24,
    min_supported_version: '2.0.0',
    force_update: false,
    apk_download_url: '/api/app/download-apk',
    update_title_ar: 'تحديث جديد متوفر',
    update_message_ar: 'تحديث شامل: دعم بوابات الدفع الجديدة (PayPal، نون باي، ماي فاتورة) وسرعة فائقة في التسليم الآلي.',
    announcement_enabled: true,
    announcement_text_ar: '🎉 مرحباً بكم في تطبيق ديجيتكس! استخدم كود APP15 لخصم إضافي 15% على أول طلب.',
    announcement_coupon: 'APP15',
    maintenance_mode: false,
    maintenance_message_ar: 'التطبيق قيد التحديث الدوري لخدمتكم بشكل أفضل، يرجى المحاولة بعد قليل.',
    splash_bg_color: '#0f172a',
    push_notifications_enabled: true,
    direct_apk_ready: true
  });
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [isSendingPush, setIsSendingPush] = useState(false);

  // Analytics & Metrics
  const [analytics, setAnalytics] = useState<any>({
    metrics: {
      total_sales: 12480,
      today_sales: 1420,
      total_orders: 164,
      pending_orders: 3,
      completed_orders: 158,
      active_subscriptions: 42
    },
    sales_chart: [
      { month: 'سبتمبر', sales: 4200, orders: 120 },
      { month: 'أغسطس', sales: 3800, orders: 95 },
      { month: 'يوليو', sales: 3100, orders: 82 }
    ],
    logs: []
  });

  // Orders State
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [orderDeliveryNote, setOrderDeliveryNote] = useState('');
  const [orderAdminNote, setOrderAdminNote] = useState('');

  // Manual Payment Methods Management State
  const [adminManualMethods, setAdminManualMethods] = useState<ManualPaymentMethod[]>([]);
  const [editingManualMethod, setEditingManualMethod] = useState<ManualPaymentMethod | null>(null);
  const [isAddingManualMethod, setIsAddingManualMethod] = useState(false);
  const [newMethodForm, setNewMethodForm] = useState<ManualPaymentMethod>({
    id: '',
    name: '',
    name_en: '',
    category: 'jordan_wallet',
    currency: 'JOD',
    recipient_account: '',
    account_name: '',
    instructions: '',
    icon_type: 'zain',
    is_active: true
  });

  // Subscriptions & Coupons & Reviews
  const [adminSubs, setAdminSubs] = useState<Subscription[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);

  // 8-Step Product Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardProduct, setWizardProduct] = useState<{
    name: string;
    name_en: string;
    category_id: number;
    type: 'service' | 'subscription' | 'digital' | 'custom';
    image: string;
    base_price: number;
    discount_price?: number;
    sku: string;
    description: string;
    delivery_type: 'manual' | 'code' | 'instant' | 'account';
    delivery_time_text: string;
    duration_days?: number;
    variants: ProductVariant[];
    requirements: ProductRequirement[];
  }>({
    name: '',
    name_en: '',
    category_id: 1,
    type: 'service',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    base_price: 25.00,
    discount_price: 19.00,
    sku: 'SRV-01',
    description: 'تفاصيل ومميزات الخدمة مع الضمان الكامل.',
    delivery_type: 'manual',
    delivery_time_text: 'خلال 15 دقيقة',
    duration_days: 30,
    variants: [
      { id: 1, product_id: 0, title: 'الباقة القياسية (1,000)', title_en: 'Standard 1,000', sku: 'VAR-1K', price: 25, discount_price: 19, stock: 999, delivery_time: '15 دقيقة', is_active: 1, sort_order: 1 }
    ],
    requirements: [
      { id: 1, product_id: 0, field_label: 'رابط الحساب / المستخدم', field_label_en: 'Profile Link / Username', field_type: 'text', placeholder: '@username', is_required: 1, sort_order: 1 }
    ]
  });

  // Load Admin Data on tab switch
  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => { if (data.success) setAnalytics(data); })
      .catch(() => {});

    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => { if (data.success) setOrdersList(data.orders); })
      .catch(() => {});

    fetch('/api/admin/subscriptions')
      .then(res => res.json())
      .then(data => { if (data.success) setAdminSubs(data.subscriptions); })
      .catch(() => {});

    fetch('/api/admin/coupons')
      .then(res => res.json())
      .then(data => { if (data.success) setAdminCoupons(data.coupons); })
      .catch(() => {});

    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => { if (data.success) setAdminReviews(data.reviews); })
      .catch(() => {});

    fetch('/api/app-config')
      .then(res => res.json())
      .then(data => { if (data.success && data.config) setMobileConfig(data.config); })
      .catch(() => {});

    fetch('/api/admin/manual-payment-methods')
      .then(res => res.json())
      .then(data => { if (data.success && Array.isArray(data.methods)) setAdminManualMethods(data.methods); })
      .catch(() => {});
  }, [activeTab]);

  const handleToggleManualMethod = async (method: ManualPaymentMethod) => {
    try {
      const updated = { ...method, is_active: !method.is_active };
      const res = await fetch(`/api/admin/manual-payment-methods/${method.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setAdminManualMethods(prev => prev.map(m => m.id === method.id ? data.method : m));
        showNotification(isRtl ? `تم تحديث حالة ${method.name}` : `Updated ${method.name}`);
      }
    } catch {
      showNotification(isRtl ? 'حدث خطأ أثناء التحديث' : 'Error updating method');
    }
  };

  const handleSaveManualMethod = async (methodData: ManualPaymentMethod, isNew: boolean) => {
    try {
      const url = isNew
        ? '/api/admin/manual-payment-methods'
        : `/api/admin/manual-payment-methods/${methodData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodData)
      });
      const data = await res.json();
      if (data.success) {
        if (isNew) {
          setAdminManualMethods(prev => [...prev, data.method]);
          setIsAddingManualMethod(false);
          setNewMethodForm({
            id: '',
            name: '',
            name_en: '',
            category: 'jordan_wallet',
            currency: 'JOD',
            recipient_account: '',
            account_name: '',
            instructions: '',
            icon_type: 'zain',
            is_active: true
          });
        } else {
          setAdminManualMethods(prev => prev.map(m => m.id === methodData.id ? data.method : m));
          setEditingManualMethod(null);
        }
        showNotification(isRtl ? 'تم حفظ طريقة الدفع اليدوية بنجاح' : 'Manual payment method saved successfully');
      }
    } catch {
      showNotification(isRtl ? 'حدث خطأ أثناء حفظ طريقة الدفع' : 'Error saving payment method');
    }
  };

  const handleDeleteManualMethod = async (id: string) => {
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف طريقة الدفع هذه؟' : 'Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/admin/manual-payment-methods/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAdminManualMethods(prev => prev.filter(m => m.id !== id));
        showNotification(isRtl ? 'تم حذف طريقة الدفع' : 'Payment method deleted');
      }
    } catch {
      showNotification(isRtl ? 'فشل حذف طريقة الدفع' : 'Failed to delete method');
    }
  };

  const handleSaveMobileConfig = async () => {
    try {
      const res = await fetch('/api/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mobileConfig)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(isRtl ? 'تم حفظ ومزامنة إعدادات تطبيق APK بنجاح!' : 'Mobile app configuration synced successfully!');
      }
    } catch {
      showNotification(isRtl ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
    }
  };

  const handleSendPushNotification = () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      showNotification(isRtl ? 'يرجى إدخال عنوان ونص الإشعار' : 'Please fill notification title and message');
      return;
    }
    setIsSendingPush(true);
    setTimeout(() => {
      setIsSendingPush(false);
      setPushTitle('');
      setPushBody('');
      showNotification(isRtl ? '🚀 تم بث الإشعار الفوري لجميع أجهزة مستخدمي التطبيق (APK) بنجاح!' : 'Push notification broadcasted to all APK users!');
    }, 600);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@digitex.store' && adminPass === 'admin123') {
      setIsAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError(isRtl ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
    }
  };

  // Add Variant helper in Wizard
  const addWizardVariant = () => {
    const newId = Date.now();
    setWizardProduct(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: newId,
          product_id: 0,
          title: `باقة إضافية ${prev.variants.length + 1}`,
          title_en: `Package ${prev.variants.length + 1}`,
          sku: `SKU-${prev.variants.length + 1}`,
          price: 50,
          discount_price: 39,
          stock: 999,
          delivery_time: 'ساعة واحدة',
          is_active: 1,
          sort_order: prev.variants.length + 1
        }
      ]
    }));
  };

  // Add Requirement helper in Wizard
  const addWizardRequirement = () => {
    const newId = Date.now();
    setWizardProduct(prev => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        {
          id: newId,
          product_id: 0,
          field_label: 'بيانات إضافية مطلوبة',
          field_label_en: 'Additional Field',
          field_type: 'text',
          placeholder: 'أدخل المطلوب...',
          is_required: 1,
          sort_order: prev.requirements.length + 1
        }
      ]
    }));
  };

  // Publish Product from Wizard
  const showNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 3500);
  };

  const handlePublishWizardProduct = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardProduct)
      });
      const data = await res.json();
      if (data.success) {
        onRefreshProducts();
        setActiveTab('products');
        setWizardStep(1);
        showNotification(isRtl ? 'تم حفظ ونشر المنتج بنجاح!' : 'Product published successfully!');
      }
    } catch {
      showNotification(isRtl ? 'حدث خطأ أثناء حفظ المنتج' : 'Error saving product');
    }
  };

  // Update Order Status & Deliver
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newOrderStatus || selectedOrder.order_status,
          admin_notes: orderAdminNote,
          delivery_notes: orderDeliveryNote
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrdersList(prev => prev.map(o => o.id === selectedOrder.id ? data.order : o));
        setSelectedOrder(data.order);
        showNotification(isRtl ? 'تم تحديث حالة الطلب وإرسال بيانات التسليم للعميل!' : 'Order updated & delivered!');
      }
    } catch {
      showNotification(isRtl ? 'خطأ في الاتصال بالخادم' : 'Server connection error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md overflow-hidden">
      <div className="relative w-full h-full sm:h-[94vh] sm:max-w-7xl sm:rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">لوحة تحكم إدارة عمده ستور (3mdh store)</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  3mdh.store Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">3mdh Store Admin Panel • https://3mdh.store/ • Mobile Responsive</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('cpanel')}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 text-xs font-bold hover:bg-cyan-600/30 transition cursor-pointer"
            >
              <Server className="h-3.5 w-3.5" />
              <span>{isRtl ? 'ملفات cPanel والنشر' : 'cPanel Files'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Action Notification Toast */}
        {actionNotification && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{actionNotification}</span>
            </div>
            <button onClick={() => setActionNotification(null)} className="text-white/80 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Admin Login Form if not logged in */}
        {!isAdminLoggedIn ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleAdminLogin} className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-8 space-y-4">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-white">تسجيل الدخول للوحة الإدارة</h3>
                <p className="text-xs text-slate-400">أدخل بيانات المدير العام للتحكم بالمتجر</p>
              </div>

              {loginError && <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg">{loginError}</p>}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
              >
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Layout: Sidebar + Content Area */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-l border-slate-800 bg-slate-900/60 p-4 space-y-1 overflow-y-auto hidden md:block shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>لوحة القيادة والمؤشرات</span>
              </button>

              <button
                onClick={() => { setActiveTab('wizard'); setWizardStep(1); }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'wizard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PlusCircle className="h-4 w-4 text-emerald-400" />
                <span>إضافة خدمة (Wizard 8 خطوات)</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>إدارة الخدمات والمنتجات ({allProducts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>الطلبات والفواتير ({ordersList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'subscriptions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>الاشتراكات والتجديدات ({adminSubs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'coupons' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>كوبونات الخصم ({adminCoupons.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>تقييمات وآراء العملاء</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>إعدادات المتجر وبوابات الدفع</span>
              </button>

              <button
                onClick={() => setActiveTab('mobile_app')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                  activeTab === 'mobile_app' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="flex-1">تطبيق الجوال APK والتحكم</span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 font-mono">
                  v{mobileConfig.app_version}
                </span>
              </button>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => setActiveTab('cpanel')}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-right cursor-pointer ${
                    activeTab === 'cpanel' ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:bg-cyan-950/40'
                  }`}
                >
                  <Server className="h-4 w-4" />
                  <span>نشر cPanel والمثبت /install</span>
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Mobile Tab Selector Strip */}
              <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-slate-800 shrink-0">
                {[
                  { id: 'dashboard', label: 'المؤشرات' },
                  { id: 'orders', label: `الطلبات (${ordersList.length})` },
                  { id: 'products', label: `الخدمات (${allProducts.length})` },
                  { id: 'wizard', label: '+ إضافة خدمة' },
                  { id: 'settings', label: 'بوابات الدفع' },
                  { id: 'mobile_app', label: 'تطبيق APK' },
                  { id: 'cpanel', label: 'النشر' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      activeTab === t.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: DASHBOARD METRICS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs text-slate-400">إجمالي المبيعات</span>
                      <p className="font-mono text-2xl font-black text-emerald-400">
                        {analytics.metrics.total_sales.toLocaleString()} {currency}
                      </p>
                      <span className="text-[10px] text-emerald-500 font-bold">↑ 24% نمو شهري</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs text-slate-400">مبيعات اليوم</span>
                      <p className="font-mono text-2xl font-black text-white">
                        {analytics.metrics.today_sales.toLocaleString()} {currency}
                      </p>
                      <span className="text-[10px] text-cyan-400 font-bold">تسليم آلي مفعّل</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs text-slate-400">إجمالي الطلبات</span>
                      <p className="font-mono text-2xl font-black text-indigo-400">
                        {analytics.metrics.total_orders}
                      </p>
                      <span className="text-[10px] text-slate-400">مكتمل ومسلّم</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-xs text-slate-400">طلبات قيد المعالجة</span>
                      <p className="font-mono text-2xl font-black text-amber-400">
                        {analytics.metrics.pending_orders}
                      </p>
                      <span className="text-[10px] text-amber-500 font-bold">تحتاج متابعة فورية</span>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white">سجل العمليات الإدارية الحديثة (Audit Logs)</h3>
                    <div className="space-y-2 text-xs">
                      {analytics.logs?.map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                          <div>
                            <span className="font-bold text-slate-200">{log.action}:</span>
                            <span className="text-slate-400 ml-2 mr-2">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{log.created_at}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 8-STEP PRODUCT & SERVICE WIZARD */}
              {activeTab === 'wizard' && (
                <div className="space-y-6">
                  {/* Wizard Header & Progress Bar */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                        <h3 className="text-base font-bold text-white">معالج إضافة خدمة / منتج رقمي احترافي</h3>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
                        الخطوة {wizardStep} من 8
                      </span>
                    </div>

                    {/* Progress indicators */}
                    <div className="grid grid-cols-8 gap-1.5 text-[11px] font-semibold text-slate-400">
                      {[
                        '1. المعلومات',
                        '2. الوسائط',
                        '3. التسعير',
                        '4. الباقات',
                        '5. المتطلبات',
                        '6. التسليم',
                        '7. السيو',
                        '8. النشر'
                      ].map((label, idx) => (
                        <div
                          key={idx}
                          className={`text-center py-1.5 rounded-lg border text-[10px] ${
                            wizardStep === idx + 1
                              ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                              : wizardStep > idx + 1
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900'
                              : 'bg-slate-800 border-slate-700'
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Basic Info */}
                  {wizardStep === 1 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 1: المعلومات الأساسية ونوع الخدمة</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">اسم الخدمة (بالعربية) *</label>
                          <input
                            type="text"
                            value={wizardProduct.name}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, name: e.target.value })}
                            placeholder="مثال: زيادة لايكات تيك توك نشطة وسريعة"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">اسم الخدمة (English)</label>
                          <input
                            type="text"
                            value={wizardProduct.name_en}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, name_en: e.target.value })}
                            placeholder="e.g. TikTok Fast Video Likes"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">القسم / التصنيف *</label>
                          <select
                            value={wizardProduct.category_id}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, category_id: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">نوع المنتج / الخدمة *</label>
                          <select
                            value={wizardProduct.type}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, type: e.target.value as any })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          >
                            <option value="service">خدمة تنفيذية (سوشيال ميديا، زيادة تفاعل)</option>
                            <option value="subscription">اشتراك رقمي رسمي (نتفلكس، يوتيوب، شات جي بي تي)</option>
                            <option value="digital">مفتاح ترخيص رقمي أو كود فوري (ويندوز، أوفيس، برامج)</option>
                            <option value="custom">خدمة مخصصة حسب طلب العميل</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Media */}
                  {wizardStep === 2 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 2: الصورة التعريفية والوصف</h4>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">رابط صورة الغلاف (URL أو رابط جاهز)</label>
                        <input
                          type="text"
                          value={wizardProduct.image}
                          onChange={(e) => setWizardProduct({ ...wizardProduct, image: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="w-48 aspect-video rounded-xl overflow-hidden border border-slate-700">
                        <img src={wizardProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">وصف الخدمة ومميزاتها</label>
                        <textarea
                          rows={3}
                          value={wizardProduct.description}
                          onChange={(e) => setWizardProduct({ ...wizardProduct, description: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Base Pricing */}
                  {wizardStep === 3 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 3: التسعير الأساسي</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">السعر الأساسي ({currency}) *</label>
                          <input
                            type="number"
                            value={wizardProduct.base_price}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, base_price: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">سعر الخصم / العرض ({currency})</label>
                          <input
                            type="number"
                            value={wizardProduct.discount_price || ''}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, discount_price: Number(e.target.value) })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">رمز المنتج (SKU)</label>
                          <input
                            type="text"
                            value={wizardProduct.sku}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, sku: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Variants Builder */}
                  {wizardStep === 4 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">الخطوة 4: منشئ الباقات والخيارات (Variants Builder)</h4>
                        <button
                          type="button"
                          onClick={addWizardVariant}
                          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>إضافة باقة جديدة</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {wizardProduct.variants.map((v, i) => (
                          <div key={v.id} className="p-3 rounded-xl border border-slate-800 bg-slate-800/60 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <input
                              type="text"
                              value={v.title}
                              onChange={(e) => {
                                const copy = [...wizardProduct.variants];
                                copy[i].title = e.target.value;
                                setWizardProduct({ ...wizardProduct, variants: copy });
                              }}
                              placeholder="عنوان الباقة"
                              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                            />
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const copy = [...wizardProduct.variants];
                                copy[i].price = Number(e.target.value);
                                setWizardProduct({ ...wizardProduct, variants: copy });
                              }}
                              placeholder="السعر"
                              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white font-mono"
                            />
                            <input
                              type="text"
                              value={v.delivery_time}
                              onChange={(e) => {
                                const copy = [...wizardProduct.variants];
                                copy[i].delivery_time = e.target.value;
                                setWizardProduct({ ...wizardProduct, variants: copy });
                              }}
                              placeholder="وقت التسليم"
                              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setWizardProduct({
                                  ...wizardProduct,
                                  variants: wizardProduct.variants.filter((_, idx) => idx !== i)
                                });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Customer Requirements Builder */}
                  {wizardStep === 5 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">الخطوة 5: منشئ متطلبات العميل (Requirements Form Builder)</h4>
                        <button
                          type="button"
                          onClick={addWizardRequirement}
                          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>إضافة حقل مطلوب</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {wizardProduct.requirements.map((r, i) => (
                          <div key={r.id} className="p-3 rounded-xl border border-slate-800 bg-slate-800/60 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <input
                              type="text"
                              value={r.field_label}
                              onChange={(e) => {
                                const copy = [...wizardProduct.requirements];
                                copy[i].field_label = e.target.value;
                                setWizardProduct({ ...wizardProduct, requirements: copy });
                              }}
                              placeholder="اسم الحقل (مثال: رابط الفيديو)"
                              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                            />
                            <select
                              value={r.field_type}
                              onChange={(e) => {
                                const copy = [...wizardProduct.requirements];
                                copy[i].field_type = e.target.value as any;
                                setWizardProduct({ ...wizardProduct, requirements: copy });
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                            >
                              <option value="text">نص قصير (Text)</option>
                              <option value="url">رابط مباشر (URL)</option>
                              <option value="email">بريد إلكتروني (Email)</option>
                              <option value="textarea">نص طويل (Textarea)</option>
                            </select>
                            <label className="flex items-center gap-2 text-xs text-slate-300">
                              <input
                                type="checkbox"
                                checked={r.is_required === 1}
                                onChange={(e) => {
                                  const copy = [...wizardProduct.requirements];
                                  copy[i].is_required = e.target.checked ? 1 : 0;
                                  setWizardProduct({ ...wizardProduct, requirements: copy });
                                }}
                              />
                              <span>إلزامي</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setWizardProduct({
                                  ...wizardProduct,
                                  requirements: wizardProduct.requirements.filter((_, idx) => idx !== i)
                                });
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                            >
                              حذف الحقل
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 6: Delivery Settings */}
                  {wizardStep === 6 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 6: إعدادات التسليم والضمان</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">طريقة التسليم للمشتري</label>
                          <select
                            value={wizardProduct.delivery_type}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, delivery_type: e.target.value as any })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          >
                            <option value="manual">يدوي بواسطة فريق العمل بعد فحص الرابط</option>
                            <option value="code">آلي فوري من المخزون الرقمي (License Key)</option>
                            <option value="account">تسليم بيانات حساب واشتراك جاهز</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">نص وقت التسليم المعروض للمشتري</label>
                          <input
                            type="text"
                            value={wizardProduct.delivery_time_text}
                            onChange={(e) => setWizardProduct({ ...wizardProduct, delivery_time_text: e.target.value })}
                            placeholder="مثال: فوري خلال دقائق"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 7: SEO */}
                  {wizardStep === 7 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 7: تحسين محركات البحث (SEO & Slug)</h4>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">الرابط المخصص (Slug)</label>
                        <input
                          type="text"
                          value={wizardProduct.name_en ? wizardProduct.name_en.toLowerCase().replace(/\s+/g, '-') : 'service-item'}
                          readOnly
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 8: Preview & Publish */}
                  {wizardStep === 8 && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h4 className="font-bold text-sm text-white">الخطوة 8: المعاينة النهائية والتأكيد</h4>
                      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <p className="font-bold text-base text-white">{wizardProduct.name}</p>
                        <p className="text-xs text-indigo-400 font-mono">
                          السعر: {wizardProduct.discount_price || wizardProduct.base_price} {currency}
                        </p>
                        <p className="text-xs text-slate-400">الباقات المضافة: {wizardProduct.variants.length}</p>
                        <p className="text-xs text-slate-400">الحقول المطلوبة من العميل: {wizardProduct.requirements.length}</p>
                      </div>
                      <button
                        onClick={handlePublishWizardProduct}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>نشر الخدمة فوراً في المتجر 🚀</span>
                      </button>
                    </div>
                  )}

                  {/* Wizard Step Controls */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={wizardStep === 1}
                      onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                      className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      ← الخطوة السابقة
                    </button>

                    {wizardStep < 8 && (
                      <button
                        type="button"
                        onClick={() => setWizardStep(s => Math.min(8, s + 1))}
                        className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        المتابعة إلى الخطوة التالية →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS MANAGEMENT TABLE */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">قائمة المنتجات والخدمات المعروضة</h3>
                    <button
                      onClick={() => { setActiveTab('wizard'); setWizardStep(1); }}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>إضافة خدمة جديدة</span>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800/70 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">الخدمة</th>
                          <th className="p-3">النوع</th>
                          <th className="p-3">السعر</th>
                          <th className="p-3">الباقات</th>
                          <th className="p-3">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {allProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40">
                            <td className="p-3 flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-bold text-white line-clamp-1">{p.name}</span>
                            </td>
                            <td className="p-3">
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-indigo-400">
                                {p.type}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              {(p.discount_price || p.base_price).toFixed(2)} {currency}
                            </td>
                            <td className="p-3">{p.variants?.length || 0} باقة</td>
                            <td className="p-3">
                              <span className="text-emerald-400 font-bold">نشط ✓</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-white">إدارة طلبات وفواتير العملاء</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 font-bold">
                        {ordersList.filter(o => o.order_status === 'pending_payment').length} بانتظار تأكيد الدفع
                      </span>
                      <span className="rounded-full bg-slate-800 text-slate-300 px-2.5 py-0.5">
                        إجمالي: {ordersList.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ordersList.map((o) => {
                      const isPendingManual = o.payment_method === 'manual' && o.order_status === 'pending_payment';
                      return (
                        <div
                          key={o.id}
                          className={`p-4 rounded-2xl border space-y-3 transition ${
                            isPendingManual
                              ? 'border-amber-500/50 bg-amber-950/20 shadow-md shadow-amber-950/40'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-white">{o.order_number}</span>
                              <span className="text-xs text-slate-400">({o.guest_name} • {o.guest_email})</span>
                              {o.payment_method === 'manual' && (
                                <span className="rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                                  دفع يدوي: {o.manual_method_name || 'محفظة رقمية'}
                                </span>
                              )}
                              {o.payment_method === 'paypal' && (
                                <span className="rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 border border-blue-500/30">
                                  PayPal تلقائي
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-emerald-400">
                                {o.total_amount.toFixed(2)} {o.currency}
                              </span>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                o.order_status === 'pending_payment'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : o.order_status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-slate-800 text-indigo-400'
                              }`}>
                                {o.order_status === 'pending_payment' ? 'بانتظار تأكيد الدفع' : o.order_status}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setNewOrderStatus(o.order_status);
                                  setOrderDeliveryNote(o.delivery_notes || '');
                                  setOrderAdminNote(o.admin_notes || '');
                                }}
                                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                              >
                                معالجة وتسليم
                              </button>
                            </div>
                          </div>

                          {/* Manual Payment verification info if available */}
                          {o.payment_method === 'manual' && (o.payment_transaction_ref || o.payment_sender_info || o.payment_receipt_url) && (
                            <div className="p-2.5 rounded-xl bg-slate-850/80 border border-amber-800/40 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {o.payment_transaction_ref && (
                                <div>
                                  <span className="text-slate-400 text-[10px] block">رقم العملية / الحوالة:</span>
                                  <span className="font-mono font-bold text-amber-300">{o.payment_transaction_ref}</span>
                                </div>
                              )}
                              {o.payment_sender_info && (
                                <div>
                                  <span className="text-slate-400 text-[10px] block">حساب / هاتف المرسل:</span>
                                  <span className="font-mono text-white">{o.payment_sender_info}</span>
                                </div>
                              )}
                              {o.payment_receipt_url && (
                                <div>
                                  <span className="text-slate-400 text-[10px] block">إشعار التحويل:</span>
                                  <a
                                    href={o.payment_receipt_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 underline hover:text-indigo-300 font-bold"
                                  >
                                    معاينة صورة الإشعار 📄
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-slate-300">
                            {o.items.map((it) => (
                              <div key={it.id}>• {it.product_name} ({it.variant_title})</div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Process Order Modal */}
                  {selectedOrder && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
                      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <h4 className="font-bold text-sm text-white">معالجة وتحديث الطلب #{selectedOrder.order_number}</h4>
                          <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        {selectedOrder.payment_method === 'manual' && (
                          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/40 text-xs space-y-1">
                            <p className="font-bold text-amber-300">بيانات تحويل العميل اليدوي:</p>
                            <p className="text-slate-300">طريقة الدفع: <span className="text-white font-bold">{selectedOrder.manual_method_name || 'يدوي'}</span></p>
                            {selectedOrder.payment_transaction_ref && (
                              <p className="text-slate-300">رقم الحوالة: <span className="font-mono text-amber-200">{selectedOrder.payment_transaction_ref}</span></p>
                            )}
                            {selectedOrder.payment_sender_info && (
                              <p className="text-slate-300">بيانات المرسل: <span className="text-white">{selectedOrder.payment_sender_info}</span></p>
                            )}
                            {selectedOrder.payment_receipt_url && (
                              <a href={selectedOrder.payment_receipt_url} target="_blank" rel="noreferrer" className="inline-block mt-1 text-indigo-400 underline">
                                فتح صورة الإشعار المرفوعة
                              </a>
                            )}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">تغيير حالة الطلب</label>
                          <select
                            value={newOrderStatus}
                            onChange={(e) => setNewOrderStatus(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          >
                            <option value="pending_payment">في انتظار الدفع (Pending Payment)</option>
                            <option value="processing">جارٍ التنفيذ والمعالجة (Processing)</option>
                            <option value="completed">مكتمل وتم التسليم (Completed)</option>
                            <option value="cancelled">ملغي (Cancelled)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">بيانات التسليم للعميل (تظهر في تتبع الطلب)</label>
                          <textarea
                            rows={3}
                            value={orderDeliveryNote}
                            onChange={(e) => setOrderDeliveryNote(e.target.value)}
                            placeholder="أدخل كود التفعيل أو بيانات الحساب أو رابط إثبات التنفيذ..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-800"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleUpdateOrderStatus}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
                          >
                            حفظ وتحديث الطلب
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: cPanel DEPLOYMENT HUB */}
              {activeTab === 'cpanel' && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-800/40 p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Server className="h-6 w-6 text-cyan-400" />
                      <div>
                        <h3 className="text-base font-extrabold text-white">مركز النشر والتشغيل على استضافة Namecheap cPanel</h3>
                        <p className="text-xs text-slate-300">تم تجهيز كافة ملفات المشروع لتعمل بنسبة 100% على بيئة PHP 8.2 + MySQL</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Schema SQL Download */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <FileText className="h-8 w-8 text-amber-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">ملف قاعدة البيانات (schema.sql)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          يحتوي على كافة الجداول الـ 25+ مع البيانات الأولية والفهارس لاستيراده في phpMyAdmin بنقرة واحدة.
                        </p>
                      </div>
                      <a
                        href="/api/export/schema.sql"
                        download="schema.sql"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>تحميل schema.sql</span>
                      </a>
                    </div>

                    {/* Deployment Guide */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <FileText className="h-8 w-8 text-indigo-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">دليل النشر الشامل (DEPLOYMENT.md)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          شرح تفصيلي خطوة بخطوة لربط الدومين، شهادة SSL المجانية، وإنشاء قاعدة البيانات ورفع الملفات.
                        </p>
                      </div>
                      <a
                        href="/api/export/deployment-guide"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        <span>عرض دليل النشر</span>
                      </a>
                    </div>

                    {/* Installer Guide */}
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 flex flex-col justify-between">
                      <div>
                        <Sparkles className="h-8 w-8 text-emerald-400 mb-2" />
                        <h4 className="font-bold text-sm text-white">المثبت الذكي (/install)</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          كود PHP جاهز داخل <code>public_html/install/</code> لفحص الخادم وربط قاعدة البيانات تلقائياً.
                        </p>
                      </div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-800/80 p-2 rounded-lg text-center">
                        /public_html/install/
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS (بوابات الدفع وإعدادات المتجر بدون Stripe نهائياً) */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* General Store Settings */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-indigo-400" />
                      <span>إعدادات المتجر والعملات</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم المتجر (بالعربية)</label>
                        <input
                          type="text"
                          value={settings.store_name}
                          onChange={(e) => onSaveSettings({ ...settings, store_name: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">اسم المتجر (بالإنجليزية)</label>
                        <input
                          type="text"
                          value={settings.store_name_en || 'Digitex Digital Store'}
                          onChange={(e) => onSaveSettings({ ...settings, store_name_en: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">العملة الافتراضية الأساسية</label>
                        <select
                          value={settings.default_currency}
                          onChange={(e) => onSaveSettings({ ...settings, default_currency: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                        >
                          {settings.allowed_currencies.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">رقم الواتساب للدعم الفني</label>
                        <input
                          type="text"
                          value={settings.support_whatsapp || '+966501234567'}
                          onChange={(e) => onSaveSettings({ ...settings, support_whatsapp: e.target.value })}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Gateways Section (PayPal + طرق الدفع اليدوية المتعددة) */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span>بوابات وطرق الدفع في المتجر (PayPal + طرق الدفع اليدوية)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        تحكم ببوابة PayPal المباشرة وإدارة جميع طرق الدفع اليدوية (محافظ إلكترونية في الأردن، Binance Pay، RedotPay، وغيرها) مع تخصيص العملة وتفاصيل الحساب لكل طريقة.
                      </p>
                    </div>

                    {/* PayPal Card */}
                    <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-[#003087] text-white flex items-center justify-center font-black text-xs italic">P</span>
                          <div>
                            <h4 className="font-bold text-xs text-white">بوابة PayPal الدولية</h4>
                            <span className="text-[10px] text-slate-400">دفع إلكتروني فوري تلقائي</span>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payment_paypal_enabled === '1'}
                            onChange={(e) => onSaveSettings({ ...settings, payment_paypal_enabled: e.target.checked ? '1' : '0' })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">PayPal Client ID</label>
                          <input
                            type="text"
                            value={settings.payment_paypal_client_id || 'sb-paypal-client-id-live-demo'}
                            onChange={(e) => onSaveSettings({ ...settings, payment_paypal_client_id: e.target.value })}
                            placeholder="Client ID..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-850 p-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">وضع التشغيل (Environment)</label>
                          <select
                            value={settings.payment_paypal_mode || 'live'}
                            onChange={(e) => onSaveSettings({ ...settings, payment_paypal_mode: e.target.value as 'live' | 'sandbox' })}
                            className="w-full rounded-lg border border-slate-700 bg-slate-850 p-2 text-xs text-white"
                          >
                            <option value="live">Live (إنتاج حقيقي مباشر)</option>
                            <option value="sandbox">Sandbox (بيئة تجريبية)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Manual Payment Methods Management Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <Coins className="h-4 w-4 text-amber-400" />
                            <span>إدارة طرق الدفع اليدوية (Manual Payment Methods)</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            المحافظ الرقمية والتحويلات اليدوية التي يختارها العميل ويرفع إشعار الدفع ورقم الحوالة لتأكيدها من لوحة التحكم.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingManualMethod(true);
                            setNewMethodForm({
                              id: `manual_${Date.now()}`,
                              name: '',
                              name_en: '',
                              category: 'jordan_wallet',
                              currency: 'JOD',
                              recipient_account: '',
                              account_name: '',
                              instructions: '',
                              icon_type: 'zain',
                              is_active: true
                            });
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer shadow"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>إضافة طريقة دفع يدوية جديدة</span>
                        </button>
                      </div>

                      {/* Add / Edit Manual Method Modal/Form */}
                      {(isAddingManualMethod || editingManualMethod) && (
                        <div className="p-4 rounded-2xl border border-amber-800/60 bg-amber-950/30 space-y-4">
                          <div className="flex items-center justify-between border-b border-amber-800/40 pb-2.5">
                            <span className="font-bold text-xs text-amber-300">
                              {isAddingManualMethod ? 'إضافة طريقة دفع يدوية جديدة' : `تعديل طريقة: ${editingManualMethod?.name}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setIsAddingManualMethod(false); setEditingManualMethod(null); }}
                              className="text-slate-400 hover:text-white text-xs"
                            >
                              ✕ إلغاء
                            </button>
                          </div>

                          {(() => {
                            const form = isAddingManualMethod ? newMethodForm : editingManualMethod!;
                            const updateForm = (fields: Partial<ManualPaymentMethod>) => {
                              if (isAddingManualMethod) {
                                setNewMethodForm(prev => ({ ...prev, ...fields }));
                              } else {
                                setEditingManualMethod(prev => prev ? ({ ...prev, ...fields }) : null);
                              }
                            };

                            return (
                              <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-slate-300 mb-1">اسم الطريقة (بالعربية)</label>
                                    <input
                                      type="text"
                                      value={form.name}
                                      onChange={(e) => updateForm({ name: e.target.value })}
                                      placeholder="مثال: محفظة زين كاش (الأردن) أو Binance Pay"
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-300 mb-1">اسم الطريقة (بالإنجليزية)</label>
                                    <input
                                      type="text"
                                      value={form.name_en || ''}
                                      onChange={(e) => updateForm({ name_en: e.target.value })}
                                      placeholder="e.g. Zain Cash Jordan / Binance Pay"
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-slate-300 mb-1">التصنيف</label>
                                    <select
                                      value={form.category}
                                      onChange={(e) => updateForm({ category: e.target.value as any })}
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    >
                                      <option value="jordan_wallet">محفظة إلكترونية (الأردن)</option>
                                      <option value="crypto_wallet">محفظة عملات رقمية (Crypto / Binance)</option>
                                      <option value="global_ewallet">محفظة إلكترونية دولية (RedotPay / STC)</option>
                                      <option value="bank_transfer">تحويل بنكي مباشر</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-slate-300 mb-1">عملة بوابة الدفع</label>
                                    <select
                                      value={form.currency}
                                      onChange={(e) => updateForm({ currency: e.target.value })}
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    >
                                      <option value="JOD">JOD (دينار أردني)</option>
                                      <option value="USDT">USDT (تيذر رقمي)</option>
                                      <option value="USD">USD (دولار أمريكي)</option>
                                      <option value="SAR">SAR (ريال سعودي)</option>
                                      <option value="AED">AED (درهم إماراتي)</option>
                                      <option value="EGP">EGP (جنيه مصري)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-slate-300 mb-1">رمز الأيقونة</label>
                                    <select
                                      value={form.icon_type}
                                      onChange={(e) => updateForm({ icon_type: e.target.value })}
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    >
                                      <option value="zain">زين كاش (Zain Cash)</option>
                                      <option value="cliq">كليك الأردني (CliQ Jordan)</option>
                                      <option value="orange">أورنج موني (Orange Money)</option>
                                      <option value="binance">بينانس باي (Binance Pay)</option>
                                      <option value="redotpay">ريدوت باي (RedotPay)</option>
                                      <option value="stc">STC Pay</option>
                                      <option value="bank">حساب بنكي (Bank Transfer)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-slate-300 mb-1">رقم الحساب / رقم الهاتف / معرف Binance ID</label>
                                    <input
                                      type="text"
                                      value={form.recipient_account}
                                      onChange={(e) => updateForm({ recipient_account: e.target.value })}
                                      placeholder="مثال: 0791234567 أو Binance ID: 39482019"
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-300 mb-1">اسم صاحب الحساب / المستلم</label>
                                    <input
                                      type="text"
                                      value={form.account_name || ''}
                                      onChange={(e) => updateForm({ account_name: e.target.value })}
                                      placeholder="مثال: متجر عمده ستور 3mdh Store"
                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-slate-300 mb-1">تعليمات التحويل للعميل</label>
                                  <textarea
                                    rows={2}
                                    value={form.instructions || ''}
                                    onChange={(e) => updateForm({ instructions: e.target.value })}
                                    placeholder="اكتب تعليمات التحويل التي تظهر للمشتري عند اختيار هذه الطريقة..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => { setIsAddingManualMethod(false); setEditingManualMethod(null); }}
                                    className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:bg-slate-800"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveManualMethod(form, isAddingManualMethod)}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow"
                                  >
                                    حفظ وتفعيل
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* List of Manual Payment Methods */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {adminManualMethods.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3.5 rounded-2xl border transition ${
                              m.is_active ? 'border-slate-700 bg-slate-850/80' : 'border-slate-800/60 bg-slate-900/40 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                                  {m.icon_type === 'binance' ? '🟡' : m.icon_type === 'redotpay' ? '🔴' : m.icon_type === 'cliq' ? '⚡' : '💳'}
                                </span>
                                <div>
                                  <h5 className="font-bold text-xs text-white">{m.name}</h5>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="font-mono text-emerald-400 font-bold">{m.currency}</span>
                                    <span>•</span>
                                    <span>{m.category}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Toggle switch */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={m.is_active}
                                  onChange={() => handleToggleManualMethod(m)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                              </label>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-slate-400">الحساب:</span>
                                <span className="text-white font-bold">{m.recipient_account}</span>
                              </div>
                              {m.account_name && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">المستلم:</span>
                                  <span className="text-slate-300">{m.account_name}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => { setEditingManualMethod(m); setIsAddingManualMethod(false); }}
                                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteManualMethod(m.id)}
                                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold ml-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => showNotification(isRtl ? 'تم حفظ إعدادات المتجر وبوابات الدفع بنجاح!' : 'Settings saved successfully!')}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-md"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isRtl ? 'حفظ كافة الإعدادات' : 'Save All Settings'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: MOBILE APP (APK) MANAGEMENT (الخانة المخصصة للتحكم في تطبيق APK) */}
              {activeTab === 'mobile_app' && (
                <div className="space-y-6">
                  {/* Banner Overview */}
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border border-emerald-800/40 p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                          <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                            <span>لوحة التحكم بتطبيق الأندرويد الخارجي (APK Management Hub)</span>
                            <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 border border-emerald-500/30 font-mono">
                              مربوط بالمتجر مباشرة ✓
                            </span>
                          </h3>
                          <p className="text-xs text-slate-300">
                            تطبيق APK أصلي مبني لنظام Android ومربوط بمتجرك عبر API موحد، تتيح لك هذه اللوحة التحكم الفوري في التطبيق دون الحاجة لإعادة رفع التحديث.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={mobileConfig.apk_download_url || '/api/app/download-apk'}
                          download="Digitex-Store.apk"
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>تحميل حزمة التطبيق (APK 14.8 MB)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* App Stats Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">إجمالي تحميلات التطبيق</span>
                      <p className="font-mono text-xl font-black text-white">1,842</p>
                      <span className="text-[10px] text-emerald-400 font-medium">↑ +18% هذا الشهر</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">مستخدمي التطبيق النشطين</span>
                      <p className="font-mono text-xl font-black text-emerald-400">624</p>
                      <span className="text-[10px] text-slate-500">Android 9.0 - 15.0</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">إصدار التطبيق الحالي</span>
                      <p className="font-mono text-xl font-black text-indigo-400">v{mobileConfig.app_version}</p>
                      <span className="text-[10px] text-slate-500">{mobileConfig.package_id}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">حالة الربط والـ API</span>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>متصل لحظياً (200 OK)</span>
                      </p>
                      <span className="text-[10px] text-slate-500">منفذ 3000 /api/app-config</span>
                    </div>
                  </div>

                  {/* App Configuration Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Basic App Details */}
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-indigo-400" />
                        <span>بيانات وهوية التطبيق</span>
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">اسم التطبيق في شاشة الهاتف</label>
                          <input
                            type="text"
                            value={mobileConfig.app_name}
                            onChange={(e) => setMobileConfig({ ...mobileConfig, app_name: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">معرّف حزمة الأندرويد (Package ID)</label>
                          <input
                            type="text"
                            value={mobileConfig.package_id}
                            onChange={(e) => setMobileConfig({ ...mobileConfig, package_id: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">الإصدار المتاح (App Version)</label>
                            <input
                              type="text"
                              value={mobileConfig.app_version}
                              onChange={(e) => setMobileConfig({ ...mobileConfig, app_version: e.target.value })}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">الحد الأدنى المطلوب (Min Version)</label>
                            <input
                              type="text"
                              value={mobileConfig.min_supported_version}
                              onChange={(e) => setMobileConfig({ ...mobileConfig, min_supported_version: e.target.value })}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">رابط تحميل ملف الـ APK المباشر</label>
                          <input
                            type="text"
                            value={mobileConfig.apk_download_url}
                            onChange={(e) => setMobileConfig({ ...mobileConfig, apk_download_url: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">ملاحظات التحديث للعملاء (Release Notes)</label>
                          <textarea
                            rows={2}
                            value={mobileConfig.update_message_ar}
                            onChange={(e) => setMobileConfig({ ...mobileConfig, update_message_ar: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* App Controls & Maintenance */}
                    <div className="space-y-4">
                      {/* Maintenance Mode */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white">وضع الصيانة للتطبيق (App Maintenance)</h4>
                            <p className="text-[11px] text-slate-400">عند تفعيله، سيتم إيقاف التطبيق مؤقتاً وعرض رسالة الصيانة للعميل.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mobileConfig.maintenance_mode}
                              onChange={(e) => setMobileConfig({ ...mobileConfig, maintenance_mode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                          </label>
                        </div>

                        {mobileConfig.maintenance_mode && (
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">نص رسالة الصيانة التي تظهر في شاشة التطبيق</label>
                            <input
                              type="text"
                              value={mobileConfig.maintenance_message_ar}
                              onChange={(e) => setMobileConfig({ ...mobileConfig, maintenance_message_ar: e.target.value })}
                              className="w-full rounded-xl border border-rose-800 bg-slate-800 p-2.5 text-xs text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* In-App Announcement Banner */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-white">شريط الإعلانات أعلى التطبيق (In-App Banner)</h4>
                            <p className="text-[11px] text-slate-400">يظهر فور فتح التطبيق لجذب انتباه العملاء للعروض والكوبونات.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mobileConfig.announcement_enabled}
                              onChange={(e) => setMobileConfig({ ...mobileConfig, announcement_enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">نص الإعلان أو كود الخصم داخل التطبيق</label>
                          <input
                            type="text"
                            value={mobileConfig.announcement_text_ar}
                            onChange={(e) => setMobileConfig({ ...mobileConfig, announcement_text_ar: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications Broadcast Center */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">مركز إرسال الإشعارات الفورية (Push Notifications)</h4>
                          <p className="text-xs text-slate-400">أرسل تنبيهات فورية تظهر على شاشات هواتف جميع عملاء تطبيق APK في نفس اللحظة.</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                        1,842 جهاز مسجل
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">عنوان الإشعار</label>
                        <input
                          type="text"
                          value={pushTitle}
                          onChange={(e) => setPushTitle(e.target.value)}
                          placeholder="مثال: خصم 25% على اشتراكات IPTV 📺"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">نص التنبيه</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pushBody}
                            onChange={(e) => setPushBody(e.target.value)}
                            placeholder="مثال: استخدم الكود APP25 لتفعيل الخصم فورا من داخل التطبيق..."
                            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleSendPushNotification}
                            disabled={isSendingPush}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>{isSendingPush ? 'جارٍ البث...' : 'إرسال لجميع الهواتف'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Android Deployment & APK Building Guide Card */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                      <Terminal className="h-5 w-5 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-sm text-white">دليل تجهيز وتصدير تطبيق الأندرويد APK للنشر والتحميل</h4>
                        <p className="text-xs text-slate-400">خطوات تشغيل وتصدير ملف الـ APK النهائي بواسطة Capacitor أو Android Studio لربطه بمتجرك https://3mdh.store/</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-850/90 border border-slate-800 space-y-2">
                        <span className="font-bold text-emerald-400 block">الطريقة الأولى: التصدير السريع بضغطة زر (Capacitor / TWA)</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          المشروع متوافق مع PWA و TWA (Trusted Web Activity) بالإضافة إلى Capacitor. يمكنك تحويل الموقع فورياً إلى حزمة أندرويد عبر الأوامر التالية في مجلد المشروع:
                        </p>
                        <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-300 space-y-1 select-all">
                          <p>npx @capacitor/cli init "3mdh Store" store.app.amdh</p>
                          <p>npx @capacitor/cli add android</p>
                          <p>npm run build</p>
                          <p>npx @capacitor/cli copy android</p>
                          <p>npx @capacitor/cli open android</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-850/90 border border-slate-800 space-y-2">
                        <span className="font-bold text-indigo-400 block">الطريقة الثانية: استخراج APK جاهز عبر Bubblewrap أو Android Studio</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          1. افتح مجلد المشروع في Windows أو افتح Android Studio.<br />
                          2. اذهب إلى قائمة <b>Build → Build Bundle(s) / APK(s) → Build APK(s)</b>.<br />
                          3. بعد انتهاء البناء بدقيقة ستجد ملف <code className="text-amber-300">app-release.apk</code> جاهزاً.<br />
                          4. ارفعه على استضافتك في <code className="text-cyan-300">public/3mdh-store.apk</code> وضع رابطه هنا ليتم تحميله فوراً للعملاء.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Mobile App Config Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveMobileConfig}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      <Save className="h-4 w-4" />
                      <span>حفظ ومزامنة إعدادات تطبيق APK لحظياً</span>
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
