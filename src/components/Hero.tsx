import React from 'react';
import {
  Zap,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ArrowDownCircle,
  CreditCard,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroProps {
  settings: StoreSettings;
  currentLang: 'ar' | 'en';
  onScrollToCatalog: () => void;
  onOpenOrderTracker: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  currentLang,
  onScrollToCatalog,
  onOpenOrderTracker,
}) => {
  const isRtl = currentLang === 'ar';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-900 py-12 sm:py-16 text-white border-b border-indigo-900/40">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 text-center lg:text-right space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>
                {isRtl
                  ? 'المتجر الرقمي المعتمد الأسرع في الشرق الأوسط ⚡'
                  : 'Fastest Verified Digital Services Store'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-display">
              {isRtl ? (
                <>
                  خدمات السوشيال ميديا،{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    الاشتراكات الرقمية
                  </span>{' '}
                  ومفاتيح البرامج في مكان واحد
                </>
              ) : (
                <>
                  Social Media Services,{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    Digital Subscriptions
                  </span>{' '}
                  & Software Keys
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {isRtl
                ? 'استمتع بتسليم آلي وفوري على مدار الساعة، بأعلى معايير الأمان وبدون الحاجة لمشاركة كلمات المرور. اشتراكات رسمية وضمان كامل مدة الاستخدام.'
                : 'Experience 24/7 automated delivery with maximum security without sharing passwords. Official subscriptions backed by 100% full-term warranty.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onScrollToCatalog}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] transition cursor-pointer"
              >
                <Layers className="h-4 w-4" />
                <span>{isRtl ? 'تصفح الباقات والخدمات' : 'Explore Services'}</span>
              </button>

              <button
                onClick={onOpenOrderTracker}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700/80 transition cursor-pointer backdrop-blur-md"
              >
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{isRtl ? 'تتبع طلبك برقم الفاتورة' : 'Track Existing Order'}</span>
              </button>
            </div>

            {/* Guarantees List */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{isRtl ? 'تسليم فوري وآمن' : 'Instant Delivery'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{isRtl ? 'ضمان رسمي 100%' : '100% Warranty'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Headphones className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{isRtl ? 'دعم فني متواصل' : '24/7 Support'}</span>
              </div>
            </div>
          </div>

          {/* Feature Showcase Card (Right Column) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">
                    {isRtl ? 'أحدث الطلبات المكتملة الآن' : 'Live Order Delivery Feed'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded">
                  {isRtl ? 'مباشر' : 'LIVE'}
                </span>
              </div>

              {/* Feed items */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="h-9 w-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {isRtl ? 'اشتراك نتفلكس 4K بريميوم - ملف خاص' : 'Netflix 4K Ultra HD - Private Profile'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'تم التسليم خلال 45 ثانية إلى الرياض' : 'Delivered in 45s to Riyadh'}
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">✓ {isRtl ? 'اكتمل' : 'Done'}</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    IG
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {isRtl ? '5,000 متابع انستقرام حقيقي مع ضمان' : '5,000 Real Instagram Followers'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'جارٍ الإرسال بنجاح إلى @designer_sa' : 'Sending in progress to @designer_sa'}
                    </p>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-bold">94%</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    WIN
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {isRtl ? 'مفتاح ويندوز 11 برو أصلي مدى الحياة' : 'Windows 11 Pro Lifetime Retail Key'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'تسليم آلي فوري للكود' : 'Auto-delivered code'}
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">✓ {isRtl ? 'اكتمل' : 'Done'}</span>
                </div>
              </div>

              {/* Payment Methods Badges */}
              <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-slate-400 text-xs">
                <span>{isRtl ? 'طرق دفع آمنة 100%:' : 'Secure Payment Methods:'}</span>
                <div className="flex items-center gap-2 font-bold text-slate-300 text-[11px]">
                  <span>مدى</span>
                  <span>•</span>
                  <span>Apple Pay</span>
                  <span>•</span>
                  <span>Visa</span>
                  <span>•</span>
                  <span>المحفظة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
