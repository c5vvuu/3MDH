import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Headphones,
  FileCheck2,
  Server,
  Heart
} from 'lucide-react';

interface FooterProps {
  currentLang: 'ar' | 'en';
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenTracker,
  onOpenAdmin
}) => {
  const isRtl = currentLang === 'ar';

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 dark:border-slate-800 pb-24 md:pb-12 pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Guarantees Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">{isRtl ? 'تسليم فوري وآلي' : 'Instant Delivery'}</h4>
              <p className="text-[10px] text-slate-400">{isRtl ? 'أكواد واشتراكات بدقائق' : 'Codes within minutes'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">{isRtl ? 'ضمان كامل المدة' : 'Full Warranty'}</h4>
              <p className="text-[10px] text-slate-400">{isRtl ? 'تعويض فوري أو استرجاع' : 'Replacement guarantee'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">{isRtl ? 'دفع آمن ومشفر' : 'Secure Checkout'}</h4>
              <p className="text-[10px] text-slate-400">{isRtl ? 'تشفير 256-Bit SSL' : '256-Bit SSL Encrypted'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs">{isRtl ? 'دعم فني متخصص 24/7' : '24/7 Support'}</h4>
              <p className="text-[10px] text-slate-400">{isRtl ? 'واتساب وتذاكر سريعة' : 'WhatsApp & Ticket help'}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 font-black text-white text-sm">
                3M
              </div>
              <span className="font-black text-base text-white">متجر عمده ستور (3mdh store)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {isRtl
                ? 'المنصة الرائدة لخدمات السوشيال ميديا، الاشتراكات الرسمية، والمفاتيح البرمجية مع التسليم الآلي الموثوق والضمان الذهبي.'
                : 'Leading digital store for verified subscriptions, social growth services, and genuine software licenses.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <FileCheck2 className="h-4 w-4" />
              <span>{isRtl ? 'منصة موثقة رسمياً • رابط المتجر: https://3mdh.store/' : 'Verified Platform • https://3mdh.store/'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">{isRtl ? 'روابط المتجر' : 'Quick Links'}</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="hover:text-white transition">{isRtl ? 'خدمات السوشيال ميديا' : 'Social Media Services'}</a></li>
              <li><a href="#subscriptions" className="hover:text-white transition">{isRtl ? 'اشتراكات البث والذكاء الاصطناعي' : 'Streaming & AI Subscriptions'}</a></li>
              <li><a href="#keys" className="hover:text-white transition">{isRtl ? 'مفاتيح التفعيل والبرامج' : 'Software License Keys'}</a></li>
              <li><button onClick={onOpenTracker} className="hover:text-white transition text-right">{isRtl ? 'تتبع حالة طلبك' : 'Track Order'}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">{isRtl ? 'طرق الدفع المعتمدة' : 'Accepted Payments'}</h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700">PayPal</span>
              <span className="p-2 rounded-lg bg-slate-800 text-yellow-400 border border-slate-700">Binance Pay (ID)</span>
              <span className="p-2 rounded-lg bg-slate-800 text-rose-400 border border-slate-700">RedotPay</span>
              <span className="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">محافظ الأردن (زين كاش / CliQ)</span>
              <span className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">رصيد المحفظة Wallet</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">{isRtl ? 'النشر والاستضافة' : 'Deployment & Hosting'}</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isRtl
                ? 'جاهز 100% للرفع المباشر على دومين https://3mdh.store/ واستضافتك مع توافق تام لشاشات الهواتف (iPhone / Samsung / Pixel).'
                : '100% ready for hosting on https://3mdh.store/ with seamless mobile responsiveness (iPhone / Samsung / Pixel).'}
            </p>
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <Server className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isRtl ? 'لوحة تحكم المدير والإعدادات' : 'Admin & Deployment'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 عمده ستور (3mdh store). جميع الحقوق محفوظة لمتجر عمده ستور.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>https://3mdh.store/</span>
            <span>•</span>
            <span>Mobile-First Responsive</span>
            <span>•</span>
            <span>PWA & APK Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
