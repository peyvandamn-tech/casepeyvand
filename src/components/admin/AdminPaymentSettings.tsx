/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService, DEFAULT_PAYMENT_SETTINGS } from '../../services/storage';
import { SystemPaymentSettings, Payment } from '../../types';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Save, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Landmark,
  KeyRound,
  RefreshCw
} from 'lucide-react';

export const AdminPaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const loadData = async () => {
    const [s, p] = await Promise.all([StorageService.getPaymentSettings(), StorageService.getPayments()]);
    setSettings(s);
    setPayments(p);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await StorageService.savePaymentSettings(settings);
    setSavedMessage('تنظیمات درگاه‌های پرداخت با موفقیت ذخیره شد.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleApprovePayment = async (paymentId: string) => {
    await StorageService.updatePaymentStatus(paymentId, 'SUCCESS');
    await loadData();
    setSavedMessage('تراکنش با موفقیت تایید شد و پرونده مراجع فعال گردید.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleRejectPayment = async (paymentId: string) => {
    await StorageService.updatePaymentStatus(paymentId, 'FAILED');
    await loadData();
  };

  const pendingPayments = payments.filter((p) => p.status === 'PENDING' || p.gateway === 'CARD_TO_CARD');

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-600" />
            <span>مدیریت درگاه‌های پرداخت و کارت‌به‌کارت</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تنظیم وضعیت فعال/غیرفعال بودن درگاه زرین‌پال، اطلاعات کارت بانکی و تایید فیش‌های واریزی
          </p>
        </div>
        {savedMessage && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZarinPal Gateway Box */}
        <div className={`bg-white rounded-2xl p-6 border transition-all ${settings.zarinpalEnabled ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'border-slate-200 opacity-90'}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">درگاه پرداخت آنلاین (زرین‌پال)</h3>
                <span className="text-[11px] text-slate-500">پرداخت مستقیم از طریق شتاب</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.zarinpalEnabled}
                onChange={(e) => setSettings({ ...settings, zarinpalEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">وضعیت فعلی:</span>
              {settings.zarinpalEnabled ? (
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  روشن (فعال)
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  خاموش (غیرفعال)
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                کد مرچنت (ZarinPal Merchant ID)
              </label>
              <input
                type="text"
                value={settings.zarinpalMerchantId}
                onChange={(e) => setSettings({ ...settings, zarinpalMerchantId: e.target.value })}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full text-left font-mono dir-ltr px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <p className="text-[11px] text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
              توضیح: هنگام خاموش بودن زرین‌پال، سیستم به‌طور خودکار روش واریز کارت‌به‌کارت را جهت انجام تراکنش مراجعین نمایش می‌دهد.
            </p>
          </div>
        </div>

        {/* Card-to-Card Box */}
        <div className={`bg-white rounded-2xl p-6 border transition-all ${settings.cardToCardEnabled ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-200 opacity-90'}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">سیستم کارت به کارت (واریز مستقیم)</h3>
                <span className="text-[11px] text-slate-500">مشاهده مشخصات حساب و ثبت فیش</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cardToCardEnabled}
                onChange={(e) => setSettings({ ...settings, cardToCardEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-slate-600 font-semibold">وضعیت فعلی:</span>
              {settings.cardToCardEnabled ? (
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  روشن (فعال)
                </span>
              ) : (
                <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  خاموش (غیرفعال)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">نام بانک</label>
                <input
                  type="text"
                  value={settings.bankDetails.bankName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">نام صاحب حساب</label>
                <input
                  type="text"
                  value={settings.bankDetails.accountHolder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: { ...settings.bankDetails, accountHolder: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">شماره کارت (۱۶ رقمی)</label>
              <input
                type="text"
                value={settings.bankDetails.cardNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, cardNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 dir-ltr text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">شماره شبا (IBAN)</label>
              <input
                type="text"
                value={settings.bankDetails.shebaNumber}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bankDetails: { ...settings.bankDetails, shebaNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 dir-ltr text-center"
              />
            </div>
          </div>
        </div>

        {/* Submit Form Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تغییرات درگاه‌ها</span>
          </button>
        </div>
      </form>

      {/* Pending Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">لیست فیش‌ها و تراکنش‌های دریافتی</h2>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-mono">
            کل تراکنش‌ها: {payments.length}
          </span>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            هیچ تراکنش کارت‌به‌کارت یا در انتظار تاییدی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">شماره پرونده</th>
                  <th className="p-3">درگاه / روش</th>
                  <th className="p-3">مبلغ (تومان)</th>
                  <th className="p-3">کد پیگیری / اطلاعات فیش</th>
                  <th className="p-3">تاریخ ثبت</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {pendingPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-sky-700">{p.caseId}</td>
                    <td className="p-3 font-semibold">
                      {p.gateway === 'CARD_TO_CARD' ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          کارت به کارت
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          زرین‌پال
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      {(p.amount / 10).toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-900">{p.transactionId}</div>
                      {p.cardReceiptInfo && (
                        <div className="text-[10px] text-slate-500">
                          {p.cardReceiptInfo.cardNumberLast4 && `کارت مبدأ: **** ${p.cardReceiptInfo.cardNumberLast4} | `}
                          {p.cardReceiptInfo.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-3">
                      {p.status === 'SUCCESS' ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          تایید شده
                        </span>
                      ) : p.status === 'PENDING' ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          در انتظار تایید
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          رد شده
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {p.status === 'PENDING' && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleApprovePayment(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تایید فیش</span>
                          </button>
                          <button
                            onClick={() => handleRejectPayment(p.id)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded-lg font-bold text-[11px] transition"
                          >
                            رد
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
