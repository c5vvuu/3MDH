import React from 'react';
import {
  Home,
  LayoutGrid,
  Clock,
  ShoppingCart,
  User,
  ShieldCheck
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'home' | 'categories' | 'tracker' | 'cart' | 'account';
  onSelectTab: (tab: 'home' | 'categories' | 'tracker' | 'cart' | 'account') => void;
  cartCount: number;
  currentLang: 'ar' | 'en';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  currentLang
}) => {
  const isRtl = currentLang === 'ar';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-1">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            currentTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">{isRtl ? 'الرئيسية' : 'Home'}</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            currentTab === 'categories'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px]">{isRtl ? 'الأقسام' : 'Explore'}</span>
        </button>

        {/* Orders Tracker */}
        <button
          onClick={() => onSelectTab('tracker')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            currentTab === 'tracker'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className="text-[10px]">{isRtl ? 'تتبع الطلب' : 'Track'}</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => onSelectTab('cart')}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            currentTab === 'cart'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-[10px]">{isRtl ? 'السلة' : 'Cart'}</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
              {cartCount}
            </span>
          )}
        </button>

        {/* Account */}
        <button
          onClick={() => onSelectTab('account')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            currentTab === 'account'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">{isRtl ? 'حسابي' : 'Account'}</span>
        </button>
      </div>
    </div>
  );
};
