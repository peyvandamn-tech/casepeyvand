/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Smartphone, KeyRound, ShieldCheck, ArrowRight, User as UserIcon } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { User } from '../../types';

interface OtpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Supabase phone auth needs E.164 (+98912...); the UI collects the local
// format (0912...) people actually type.
function toE164(localPhone: string): string {
  const digits = localPhone.replace(/\D/g, '');
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;
  return `+98${withoutLeadingZero}`;
}

export const OtpAuthModal: React.FC<OtpAuthModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE'>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Supabase's session updates automatically after verifyOtp succeeds, and
  // App.tsx listens for that (supabase.auth.onAuthStateChange) to reload
  // the current user — so logging in here just means closing the modal.
  function finishLogin() {
    onClose();
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length < 11) {
      setError('لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setError('اتصال به سرویس احراز هویت پیکربندی نشده است (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      return;
    }

    setLoading(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    setLoading(false);

    if (sendError) {
      setError(sendError.message || 'ارسال کد تأیید با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      return;
    }
    setStep('OTP');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supabase) return;
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(phone),
      token: otp,
      type: 'sms',
    });
    setLoading(false);

    if (verifyError || !data.user) {
      setError(verifyError?.message || 'کد تأیید نادرست است.');
      return;
    }

    const authUserId = data.user.id;
    const existingLocalUser = (await StorageService.getUsers()).find((u) => u.id === authUserId);

    if (existingLocalUser) {
      finishLogin();
      return;
    }

    // First time this auth user has been seen — collect name/gender before
    // creating their case.
    setPendingUserId(authUserId);
    setStep('PROFILE');
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }

    const newUser: User = {
      id: pendingUserId,
      phone,
      fullName: fullName.trim(),
      gender,
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };
    await StorageService.saveUser(newUser);
    await StorageService.createCase(newUser.id);
    finishLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-teal-50 text-teal-700 rounded-2xl mb-3 border border-teal-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">ورود و ثبت‌نام در سامانه پیوند امن</h3>
          <p className="text-xs text-slate-500 mt-1">کد یکبارمصرف (OTP) جهت ورود امن به پرونده ازدواج ارسال خواهد شد.</p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">{error}</div>
        )}

        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">شماره تلفن همراه</label>
              <div className="relative dir-ltr">
                <input
                  type="tel"
                  required
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-left pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <Smartphone className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">شماره موبایل شما به عنوان شناسه اصلی پرونده ثبت می‌گردد.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2 space-x-reverse"
            >
              <span>{loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-xs text-teal-800 flex justify-between items-center">
              <span>کد ارسال شده به {phone}:</span>
              <button type="button" onClick={() => setStep('PHONE')} className="text-teal-700 underline font-semibold">ویرایش شماره</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">کد تأیید</label>
              <div className="relative dir-ltr">
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
            >
              {loading ? 'در حال بررسی...' : 'تأیید و ورود به پرونده'}
            </button>
          </form>
        )}

        {step === 'PROFILE' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-xs text-teal-800 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>شماره شما تأیید شد. برای تکمیل ثبت‌نام، اطلاعات زیر را وارد کنید.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                placeholder="مثال: سارا محمدی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">جنسیت</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    gender === 'FEMALE' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  خانم
                </button>
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    gender === 'MALE' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  آقا
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
            >
              تکمیل ثبت‌نام و ورود به پرونده
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
