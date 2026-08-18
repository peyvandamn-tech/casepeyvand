/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ConsentType, Case, User } from '../../types';
import { ShieldCheck, CheckSquare, Square, FileText, AlertTriangle } from 'lucide-react';

interface CaseConsentModalProps {
  caseId?: string;
  userId?: string;
  activeCase?: Case;
  currentUser?: User;
  isOpen?: boolean;
  onClose: () => void;
  onAcceptConsent?: (type: ConsentType) => void;
}

export const CaseConsentModal: React.FC<CaseConsentModalProps> = ({
  caseId: propCaseId,
  userId: propUserId,
  activeCase,
  currentUser,
  isOpen = true,
  onClose,
  onAcceptConsent,
}) => {
  const caseId = propCaseId || activeCase?.id || 'CASE-2026-00128';
  const userId = propUserId || currentUser?.id || 'user-sara';

  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAssessment, setAgreedAssessment] = useState(false);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedPrivacy || !agreedAssessment || !agreedDisclaimer) {
      alert('لطفاً تمامی بندهای رضایت‌نامه تخصصی را مطالعه کرده و تایید نمایید.');
      return;
    }

    let clientIp = '127.0.0.1';
    let userAgent = navigator.userAgent;

    try {
      const res = await fetch('/api/client-info');
      if (res.ok) {
        const info = await res.json();
        if (info.ip) clientIp = info.ip;
        if (info.userAgent) userAgent = info.userAgent;
      }
    } catch (err) {
      console.warn('Could not fetch client info, using browser navigator fallback:', err);
    }

    if (onAcceptConsent) {
      onAcceptConsent('PRIVACY');
      onAcceptConsent('ASSESSMENT');
      onAcceptConsent('EXPERT_DISCLAIMER');
    } else {
      StorageService.addConsentWithDetails(caseId, userId, 'PRIVACY', clientIp, userAgent);
      StorageService.addConsentWithDetails(caseId, userId, 'ASSESSMENT', clientIp, userAgent);
      StorageService.addConsentWithDetails(caseId, userId, 'EXPERT_DISCLAIMER', clientIp, userAgent);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4 mb-4">
          <div className="bg-teal-50 text-teal-700 p-2.5 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">رضایت‌نامه آگاهانه تشکیل پرونده ازدواج</h3>
            <p className="text-xs text-slate-500">شماره پرونده: <span className="font-mono font-semibold">{caseId}</span></p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <p className="font-semibold text-slate-900">
            کاربر گرامی، ورود به سامانه کیس ازدواج پیوند امن و فرآیند معرفی تحت نظارت سرکار خانم مهناز خوینی مستلزم موافقت با اصول اخلاقی و حقوقی زیر می‌باشد:
          </p>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm text-teal-800">۱. اصل حریم خصوصی و عدم ارائه مستقیم اطلاعات تماس</h4>
            <p className="text-slate-600">
              تمام اطلاعات فردی، روانشناختی و آزمون‌ها کاملاً محرمانه نزد سامانه و متخصص محفوظ می‌ماند. شماره تلفن و مشخصات شناسنامه‌ای به هیچ وجه بدون رضایت صریح و تایید کارشناس به فرد مقابل منتقل نخواهد شد.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm text-teal-800">۲. ماهیت ارزیابی روانشناختی و پیشنهاد همخوانی</h4>
            <p className="text-slate-600">
              این سامانه یک پلتفرم همسریابی خودکار یا الگوریتمی محض نیست. تمام پیشنهادات اولیه پس از تحلیل آزمون‌ها مجدداً توسط متخصص (خانم مهناز خوینی) بررسی و در صورت تایید اولیه معرفی کنترل‌شده انجام می‌گیرد.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center space-x-1.5 space-x-reverse text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>۳. مسئولیت و تصمیم نهایی</span>
            </div>
            <p className="text-amber-800">
              مسئولیت و تصمیم نهایی در خصوص ادامه آشنایی، ورود به نامزدی و عقد ازدواج کاملاً بر عهده خود افراد و خانواده‌های محترم ایشان بوده و متخصص نقش راهنما و ارزیاب علمی را دارد.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition">
            <button
              type="button"
              onClick={() => setAgreedPrivacy(!agreedPrivacy)}
              className="mt-0.5 text-teal-600 focus:outline-none"
            >
              {agreedPrivacy ? <CheckSquare className="w-5 h-5 text-teal-600" /> : <Square className="w-5 h-5 text-slate-400" />}
            </button>
            <span className="text-xs text-slate-800 font-medium">
              شرایط حریم خصوصی و نحوه نگهداری اطلاعات پرونده را مطالعه نموده و می‌پذیرم.
            </span>
          </label>

          <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition">
            <button
              type="button"
              onClick={() => setAgreedAssessment(!agreedAssessment)}
              className="mt-0.5 text-teal-600 focus:outline-none"
            >
              {agreedAssessment ? <CheckSquare className="w-5 h-5 text-teal-600" /> : <Square className="w-5 h-5 text-slate-400" />}
            </button>
            <span className="text-xs text-slate-800 font-medium">
              اجازه انجام آزمون‌های روانشناختی و ارزیابی معیارهای ازدواج توسط متخصص را صادر می‌نمایم.
            </span>
          </label>

          <label className="flex items-start space-x-3 space-x-reverse cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition">
            <button
              type="button"
              onClick={() => setAgreedDisclaimer(!agreedDisclaimer)}
              className="mt-0.5 text-teal-600 focus:outline-none"
            >
              {agreedDisclaimer ? <CheckSquare className="w-5 h-5 text-teal-600" /> : <Square className="w-5 h-5 text-slate-400" />}
            </button>
            <span className="text-xs text-slate-800 font-medium">
              تایید می‌کنم تصمیم نهایی در خصوص ادامه آشنایی و ازدواج کاملاً با اینجانب است.
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              ثبت امضای الکترونیک و ادامه
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
