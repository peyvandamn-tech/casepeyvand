/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Case } from '../../types';
import { 
  LayoutDashboard,
  FileText, 
  Users, 
  Calendar, 
  BrainCircuit, 
  SlidersHorizontal, 
  ShieldAlert, 
  Sparkles,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  BookOpen,
  Users2
} from 'lucide-react';

interface SidebarProps {
  currentUser?: User;
  activeCase?: Case;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingIntroductionsCount?: number;
  pendingMatchReviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeCase,
  activeTab,
  setActiveTab,
  pendingIntroductionsCount = 0,
  pendingMatchReviewCount = 0,
}) => {
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-l border-slate-800 shrink-0">
      <div>
        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="bg-white p-1.5 rounded-xl shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/20">
            <img src="/logo-mark.png" alt="پیوند امن" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
              پیوند امن
              <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-500/30">
                تخصصی
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">کیس ازدواج و تطبیق هوشمند</p>
          </div>
        </div>

        {/* Current Active Case Card (if present) */}
        {activeCase && (
          <div className="mb-6 bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 shadow-inner">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">پرونده فعال</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {activeCase.status === 'READY_FOR_MATCHING' ? 'آماده معرفی' : activeCase.status === 'EXPERT_REVIEW' ? 'در حال بررسی' : 'فعال'}
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-white tracking-wide">{activeCase.id}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>آخرین بروزرسانی: امروز</span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="space-y-6">
          {/* CLIENT NAV */}
          {currentUser?.role === 'CLIENT' && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                منوی مراجع
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('client-dashboard')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'client-dashboard'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  <span>داشبورد پرونده</span>
                </button>

                <button
                  onClick={() => setActiveTab('client-tests')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'client-tests'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>آزمون‌های روان‌شناختی</span>
                </button>

                <button
                  onClick={() => setActiveTab('client-introductions')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center justify-between text-xs font-bold transition-all ${
                    activeTab === 'client-introductions'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>معرفی‌های کنترل‌شده</span>
                  </div>
                  {pendingIntroductionsCount > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {pendingIntroductionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('client-appointment')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'client-appointment'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span>رزرو مشاوره</span>
                </button>

                <button
                  onClick={() => setActiveTab('client-groups')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'client-groups'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users2 className="w-4 h-4 text-teal-400" />
                  <span>جلسات گروهی</span>
                </button>

                <button
                  onClick={() => setActiveTab('content-library')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'content-library'
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span>مجله آموزشی</span>
                </button>
              </nav>
            </div>
          )}

          {/* EXPERT NAV */}
          {(currentUser?.role === 'EXPERT' || currentUser?.role === 'ADMIN') && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                میز بررسی تخصصی (خانم خوینی)
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('expert-dashboard')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'expert-dashboard'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-400" />
                  <span>داشبورد پرونده‌ها</span>
                </button>

                <button
                  onClick={() => setActiveTab('expert-matching')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center justify-between text-xs font-bold transition-all ${
                    activeTab === 'expert-matching'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-sky-400" />
                    <span>میز تطبیق (Matching Desk)</span>
                  </div>
                  {pendingMatchReviewCount > 0 && (
                    <span className="bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {pendingMatchReviewCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('expert-appointments')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'expert-appointments'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>جلسات مشاوره</span>
                </button>
              </nav>
            </div>
          )}

          {/* ADMIN NAV */}
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EXPERT') && (
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
                مدیریت ارشد سامانه
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('admin-success')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-success'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>داشبورد موفقیت</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-tests')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-tests'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                  <span>کاتالوگ آزمون‌ها</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-payments')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-payments'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>مدیریت درگاه‌های پرداخت</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-content')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-content'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>مدیریت مجله آموزشی</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-groups')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-groups'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Users2 className="w-4 h-4 text-sky-400" />
                  <span>مدیریت جلسات گروهی</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin-audit')}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                    activeTab === 'admin-audit'
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>ثبت وقایع (Audit Log)</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
