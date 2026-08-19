/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService, DEFAULT_SMS_SETTINGS } from '../../services/storage';
import { SystemSmsSettings } from '../../types';
import {
  MessageSquareText,
  Smartphone,
  KeyRound,
  User as UserIcon,
  Hash,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

export const AdminSmsSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSmsSettings>(DEFAULT_SMS_SETTINGS);
  const [showPassword, setShowPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    StorageService.getSmsSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await StorageService.saveSmsSettings(settings);
    setSavedMessage('تنظیمات پیامک و ورود با کد یک‌بارمصرف ذخیره شد.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const credentialsFilled =
    settings.melipayamakUsername.trim() && settings.melipayamakPassword.trim() && settings.melipayamakBodyId.trim();

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-teal-700" />
            <span>تنظیمات پیامک و ورود با کد یک‌بارمصرف</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            فعال/غیرفعال کردن ورود با پیامک و اتصال به پنل ملی‌پیامک برای ارسال کد
          </p>
        </div>
        {savedMessage && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* OTP Login Toggle */}
        <div
          className={`bg-white rounded-2xl p-6 border transition-all ${
            settings.otpLoginEnabled ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-slate-200 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-teal-100 text-teal-700 p-2 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">ورود مراجعین با کد پیامکی (OTP)</h3>
                <span className="text-[11px] text-slate-500">فرم ورود با شماره موبایل در صفحه اول و پنل کاربری</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.otpLoginEnabled}
                onChange={(e) => setSettings({ ...settings, otpLoginEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold">وضعیت فعلی:</span>
            {settings.otpLoginEnabled ? (
              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                روشن (فعال)
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                خاموش (غیرفعال)
              </span>
            )}
          </div>

          {settings.otpLoginEnabled && !credentialsFilled && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 p-3 rounded-xl leading-relaxed mt-3">
              ورود پیامکی روشن است اما اطلاعات پنل ملی‌پیامک زیر هنوز کامل نشده — تا تکمیل نشود، ارسال کد با خطا مواجه می‌شود.
            </p>
          )}
        </div>

        {/* Melipayamak credentials */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="bg-sky-100 text-sky-700 p-2 rounded-xl">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">اطلاعات اتصال به ملی‌پیامک</h3>
              <span className="text-[11px] text-slate-500">برای ارسال واقعی پیامک کد ورود استفاده می‌شود</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                نام کاربری پنل
              </label>
              <input
                type="text"
                value={settings.melipayamakUsername}
                onChange={(e) => setSettings({ ...settings, melipayamakUsername: e.target.value })}
                placeholder="مثال: 0912xxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                رمز عبور پنل
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.melipayamakPassword}
                  onChange={(e) => setSettings({ ...settings, melipayamakPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 dir-ltr text-left font-mono pl-9 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              کد الگو (Body ID)
            </label>
            <input
              type="text"
              value={settings.melipayamakBodyId}
              onChange={(e) => setSettings({ ...settings, melipayamakBodyId: e.target.value })}
              placeholder="مثال: 123456"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              الگویی که در پنل ملی‌پیامک با یک جای‌خالی <code className="bg-slate-100 px-1 rounded">{'{0}'}</code> برای کد ثبت کرده‌اید، مثلاً «کد ورود شما به پیوند امن: {'{0}'}».
            </p>
          </div>
        </div>

        {/* Remaining infra steps — cannot be done from this panel */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2.5">
          <h4 className="font-bold text-xs text-slate-800">مراحل باقی‌مانده (یک‌بار، در پنل Supabase)</h4>
          <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed list-disc pr-4">
            <li>Authentication → Providers → Phone را روشن کنید.</li>
            <li>
              تابع <code className="bg-white px-1 rounded border border-slate-200">send-sms-hook</code> را دیپلوی کنید:{' '}
              <code className="bg-white px-1 rounded border border-slate-200 dir-ltr inline-block">
                npx supabase functions deploy send-sms-hook --no-verify-jwt
              </code>
            </li>
            <li>Authentication → Hooks → Send SMS hook را فعال و به آدرس همین تابع وصل کنید.</li>
            <li>
              رمز امضای همان Hook را در Secrets تابع، با نام{' '}
              <code className="bg-white px-1 rounded border border-slate-200">SEND_SMS_HOOK_SECRET</code> ثبت کنید.
            </li>
          </ul>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 hover:text-teal-800 pt-1"
          >
            باز کردن داشبورد Supabase
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تنظیمات پیامک</span>
          </button>
        </div>
      </form>
    </div>
  );
};
