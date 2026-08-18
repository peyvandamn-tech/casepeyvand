/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { Case, Payment, Introduction, IntroductionFeedback } from '../../types';
import { TrendingUp, Users, HeartHandshake, Wallet, Star, Quote } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  CONSENT_PENDING: 'در انتظار رضایت‌نامه',
  PAYMENT_PENDING: 'در انتظار پرداخت',
  PROFILE_PENDING: 'در انتظار تکمیل پروفایل',
  TEST_PENDING: 'در حال انجام آزمون‌ها',
  TEST_COMPLETED: 'آزمون‌ها تکمیل شده',
  EXPERT_REVIEW: 'در بررسی کارشناس',
  INTRODUCED: 'معرفی‌شده',
  CLOSED: 'بسته‌شده',
};

export const AdminSuccessDashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [feedback, setFeedback] = useState<IntroductionFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, p, i] = await Promise.all([
        StorageService.getCases(),
        StorageService.getPayments(),
        StorageService.getIntroductions(),
      ]);
      const allFeedback = (
        await Promise.all(i.map((intro) => StorageService.getFeedbackForIntroduction(intro.id)))
      ).flat();
      setCases(c);
      setPayments(p);
      setIntroductions(i);
      setFeedback(allFeedback);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-6 text-xs text-slate-500">در حال بارگذاری...</div>;
  }

  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const funnelSteps = [
    'CONSENT_PENDING', 'PAYMENT_PENDING', 'PROFILE_PENDING', 'TEST_PENDING',
    'EXPERT_REVIEW', 'INTRODUCED',
  ];
  const funnelCounts = funnelSteps.map((status) => ({
    status,
    label: STATUS_LABELS[status] || status,
    count: cases.filter((c) => c.status === status || (status === 'INTRODUCED' && c.status === 'INTRODUCED')).length,
  }));

  const mutualPositive = introductions.filter((intro) => {
    const fbs = feedback.filter((f) => f.introductionId === intro.id);
    const a = fbs.find((f) => f.caseId === intro.caseAId);
    const b = fbs.find((f) => f.caseId === intro.caseBId);
    return a?.wantsToContinue && b?.wantsToContinue;
  });

  const avgRating = feedback.filter((f) => f.rating).length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.filter((f) => f.rating).length).toFixed(1)
    : '—';

  const positiveComments = feedback.filter((f) => f.wantsToContinue && f.comments && f.comments.trim().length > 0);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          داشبورد موفقیت و عملکرد مرکز
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">نمای کلی از قیف پرونده‌ها، درآمد، و نتیجه‌ی آشنایی‌ها.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <Users className="w-5 h-5 text-slate-400 mb-2" />
          <div className="text-xl font-extrabold text-slate-900">{cases.length}</div>
          <div className="text-[11px] text-slate-500">کل پرونده‌ها</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <Wallet className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-xl font-extrabold text-slate-900">{totalRevenue.toLocaleString('fa-IR')}</div>
          <div className="text-[11px] text-slate-500">درآمد ثبت‌شده (تومان)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <HeartHandshake className="w-5 h-5 text-rose-500 mb-2" />
          <div className="text-xl font-extrabold text-slate-900">
            {mutualPositive.length}
            <span className="text-xs text-slate-400 font-medium"> / {introductions.length}</span>
          </div>
          <div className="text-[11px] text-slate-500">آشنایی‌های با تمایل دوطرفه به ادامه</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <Star className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-xl font-extrabold text-slate-900">{avgRating}</div>
          <div className="text-[11px] text-slate-500">میانگین امتیاز بازخورد</div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <h2 className="text-xs font-bold text-slate-700 mb-3">قیف مراحل پرونده‌ها</h2>
        <div className="space-y-2">
          {funnelCounts.map((f) => (
            <div key={f.status} className="flex items-center gap-3">
              <div className="w-40 shrink-0 text-[11px] text-slate-600 font-semibold">{f.label}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-teal-500 h-full flex items-center justify-end pl-2"
                  style={{ width: `${cases.length ? Math.max(4, (f.count / cases.length) * 100) : 0}%` }}
                >
                  <span className="text-[10px] text-white font-bold">{f.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial-worthy feedback */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <h2 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <Quote className="w-4 h-4 text-teal-600" />
          بازخوردهای مثبت (منبع محتوای شهادت‌نامه)
        </h2>
        {positiveComments.length === 0 ? (
          <p className="text-[11px] text-slate-400">هنوز بازخورد مثبتی با توضیح ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {positiveComments.map((f) => (
              <div key={f.id} className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-xs text-slate-700">
                {f.rating && <div className="text-amber-500 text-[11px] mb-1">{'★'.repeat(f.rating)}</div>}
                «{f.comments}»
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
