import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../lib/pwa';

export const OfflineBanner: React.FC<{ currentLang: 'ar' | 'en' }> = ({ currentLang }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  const isRtl = currentLang === 'ar';

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="h-4 w-4" />
      <span>
        {isRtl
          ? 'أنت تعمل حالياً في وضع عدم الاتصال (Offline Mode) - تم تفعيل التخزين المؤقت المحلي للخدمات.'
          : 'You are currently offline - Local cached catalog is active.'}
      </span>
    </div>
  );
};
