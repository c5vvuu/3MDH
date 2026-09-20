import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../lib/pwa';

export const PWAInstallPrompt: React.FC<{ currentLang: 'ar' | 'en' }> = ({ currentLang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const isRtl = currentLang === 'ar';

  if (isInstalled || isDismissed) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (isInstallable) {
      await install();
    }
  };

  return (
    <>
      {/* Floating Bottom Bar for Mobile / Web */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-sm rounded-2xl border border-indigo-200 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900/95 animate-in slide-in-from-bottom-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isRtl ? 'تثبيت تطبيق عمده ستور (3mdh)' : 'Install 3mdh Store App'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                {isRtl ? 'سرعة فائقة، وصول فوري لطلباتك ومفاتيحك' : 'Fast 1-tap access to your services and keys'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1"
          >
            {isRtl ? 'لاحقاً' : 'Later'}
          </button>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isRtl ? 'تثبيت الآن' : 'Install App'}</span>
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {isRtl ? 'تثبيت التطبيق على أجهزة iPhone / iPad' : 'Install on iPhone / iPad'}
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 text-right">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <Share className="h-5 w-5 text-indigo-600 shrink-0" />
                <span>{isRtl ? '1. اضغط على زر المشاركة (Share) أسفل المتصفح' : '1. Tap the Share button in Safari'}</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <PlusSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                <span>{isRtl ? '2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)' : '2. Select "Add to Home Screen"'}</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
            >
              {isRtl ? 'فهمت ذلك' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
