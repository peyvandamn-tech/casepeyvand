/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Case } from '../../types';
import { StorageService } from '../../services/storage';
import { PhoneCall, Sparkles, UserCheck, ShieldCheck, Plus, CheckCircle2, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser?: User;
  activeCase?: Case;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOtpModal: () => void;
  onOpenConsentModal?: () => void;
  onOpenPaymentModal?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'مراجع',
  EXPERT: 'کارشناس',
  COUNSELOR: 'مشاور',
  FINANCE: 'مالی',
  ADMIN: 'مدیر سامانه',
  SUPER_ADMIN: 'مدیر ارشد',
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeCase,
  activeTab,
  setActiveTab,
  onOpenOtpModal,
  onOpenConsentModal,
  onOpenPaymentModal,
}) => {
  const handleSignOut = async () => {
    if (!confirm('از حساب کاربری خود خارج می‌شوید؟')) return;
    await StorageService.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs z-30 shrink-0">
      {/* Case Details Badge & Status */}
      <div className="flex items-center gap-3">
        {activeCase ? (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">شماره پرونده:</span>
            <span className="font-mono text-xs font-bold text-slate-800">{activeCase.id}</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {activeCase.status === 'READY_FOR_MATCHING'
                ? 'آماده معرفی'
                : activeCase.status === 'EXPERT_REVIEW'
                ? 'بررسی تخصصی'
                : 'فعال'}
            </span>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-700">سامانه کیس ازدواج پیوند امن</div>
        )}

        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>مسئول پرونده: <strong>خانم مهناز خوینی</strong> (روان‌شناس و مشاوره ازدواج)</span>
        </div>
      </div>

      {/* Quick Actions & Auth */}
      <div className="flex items-center gap-2">
        {currentUser?.role === 'CLIENT' && (
          <>
            {onOpenConsentModal && (
              <button
                onClick={onOpenConsentModal}
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-slate-300"
              >
                <span>رضایت‌نامه</span>
              </button>
            )}
            {onOpenPaymentModal && (
              <button
                onClick={onOpenPaymentModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>پرداخت و فعال‌سازی</span>
              </button>
            )}
          </>
        )}

        {currentUser ? (
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1.5 bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-100">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentUser.fullName}</span>
              <span className="text-teal-500 font-normal">· {ROLE_LABELS[currentUser.role] || currentUser.role}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-bold transition border border-transparent hover:border-rose-200"
              title="خروج از حساب کاربری"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenOtpModal}
            className="flex items-center gap-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-sky-200"
            title="ورود / ثبت‌نام سریع با شماره همراه"
          >
            <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">ورود با شماره</span>
          </button>
        )}
      </div>
    </header>
  );
};
