/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('جهت افزودن اپلیکیشن به صفحه اصلی مرورگر، از منوی مرورگر گزینه "Add to Home Screen" را انتخاب کنید.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner && !installed) {
    return (
      <div className="bg-teal-900 text-teal-100 text-xs px-4 py-2 flex items-center justify-between border-b border-teal-800">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Smartphone className="w-4 h-4 text-teal-300" />
          <span>قابلیت نصب نسخه PWA بر روی موبایل و تبلت فعال است.</span>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-2.5 py-1 rounded text-xs transition flex items-center space-x-1 space-x-reverse"
        >
          <Download className="w-3 h-3" />
          <span>نصب وب‌اپ</span>
        </button>
      </div>
    );
  }

  if (installed) return null;

  return (
    <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-3.5 shadow-md flex items-center justify-between rounded-lg m-3 border border-teal-600">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="bg-white/10 p-2 rounded-lg">
          <Smartphone className="w-5 h-5 text-teal-200" />
        </div>
        <div>
          <p className="font-bold text-sm">افزودن پیوند امن به صفحه اصلی</p>
          <p className="text-xs text-teal-100">دسترسی سریع‌تر، اعلان‌ها و کارکرد آفلاین بدون نیاز به دانلود از استور</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <button
          onClick={handleInstallClick}
          className="bg-white text-teal-800 hover:bg-teal-50 font-bold px-3 py-1.5 rounded-md text-xs transition shadow-sm flex items-center space-x-1 space-x-reverse"
        >
          <Download className="w-3.5 h-3.5" />
          <span>افزودن</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-teal-200 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
