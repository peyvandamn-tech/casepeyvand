/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  KeyRound, 
  Hash, 
  Save, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Radio,
  Layers,
  Sparkles,
  Terminal
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SystemSmsSettings } from '../../types';

interface AdminSmsSettingsProps {
  onSettingsUpdated?: () => void;
}

export const AdminSmsSettings: React.FC<AdminSmsSettingsProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<SystemSmsSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const fetched = await StorageService.getSmsSettings();
      setSettings(fetched);
    } catch {
      setErrorMessage('خطا در دریافت تنظیمات سامانه پیامک');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await StorageService.saveSmsSettings(settings);
      setSuccessMessage('تنظیمات سامانه پیامک با موفقیت ذخیره شد.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch {
      setErrorMessage('خطا در ذخیره تنظیمات پیامک');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
          <span>در حال فراخوانی تنظیمات پیامکی...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8 bg-slate-50/50">
      {/* Header Banner */}
      <div 
        id="admin-sms-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 backdrop-blur-md">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>پیکربندی پنل ملی‌پیامک و وب‌هوک</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              تنظیمات درگاه پیامک و کدهای ورود (OTP)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              اتصال به وب‌سرویس پترن ملی‌پیامک جهت ارسال آنی کدهای احراز هویت مراجعین و اعلانات نوبت‌دهی جلسات.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">وضعیت ورود پیامکی</span>
              <span className={`text-lg font-black font-mono mt-0.5 block ${settings.otpLoginEnabled ? 'text-teal-300' : 'text-rose-300'}`}>
                {settings.otpLoginEnabled ? 'فعال و برخط' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-center gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Switch Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${settings.otpLoginEnabled ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
              <h2 className="text-sm font-bold text-slate-900">فعال‌سازی ورود با پیامک برای مراجعین</h2>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              در صورت غیرفعال بودن، مراجعین با پیام راهنما مواجه شده و ارسال پیامک متوقف می‌گردد.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.otpLoginEnabled}
              onChange={(e) => setSettings({ ...settings, otpLoginEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 shadow-2xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">اطلاعات وب‌سرویس پترن و خدماتی ملی‌پیامک</h2>
              <p className="text-xs text-slate-400 font-normal">ارسال از طریق متد Service Base بدون مسدودی بلک‌لیست مخابرات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>نام کاربری پنل ملی‌پیامک</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={settings.melipayamakUsername}
                onChange={(e) => setSettings({ ...settings, melipayamakUsername: e.target.value })}
                placeholder="0912xxxxxxx"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>رمز عبور وب‌سرویس</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={settings.melipayamakPassword}
                  onChange={(e) => setSettings({ ...settings, melipayamakPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 text-left pl-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>کد الگوی وب‌سرویس خدماتی (Body ID)</span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={settings.melipayamakBodyId}
                onChange={(e) => setSettings({ ...settings, melipayamakBodyId: e.target.value })}
                placeholder="مثال: 123456"
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                کد پترن تأیید شده در بخش وب‌سرویس خدماتی که دارای پارامتر متغیر برای درج کد یکبار مصرف می‌باشد.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Instructions Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-6 text-white shadow-sm space-y-3 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
              <Terminal className="w-4 h-4" />
              <span>مراحل استقرار وب‌هوک پیامک در سرور پایگاه‌داده (Supabase)</span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 font-semibold"
            >
              <span>داشبورد Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            جهت اتصال مستقیم به تابع سرورلس، دستور زیر را در ترمینال پروژه اجرا فرمایید:
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-teal-300 dir-ltr text-left overflow-x-auto shadow-inner">
            npx supabase functions deploy send-sms-hook --no-verify-jwt
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات پیامک'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
