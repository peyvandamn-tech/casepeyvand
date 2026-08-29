/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Landmark, 
  CheckCircle2, 
  ShieldAlert, 
  Save, 
  RefreshCw, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SystemPaymentSettings, Payment } from '../../types';

interface AdminPaymentSettingsProps {
  onSettingsUpdated?: () => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<SystemPaymentSettings | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedPayments] = await Promise.all([
        StorageService.getPaymentSettings(),
        StorageService.getPayments(),
      ]);
      setSettings(fetchedSettings);
      setPayments(fetchedPayments);
    } catch {
      setErrorMessage('خطا در دریافت اطلاعات درگاه‌های مالی و تراکنش‌ها');
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
      await StorageService.savePaymentSettings(settings);
      setSuccessMessage('تنظیمات درگاه‌های پرداخت با موفقیت ذخیره گردید.');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch {
      setErrorMessage('خطا در ذخیره تنظیمات پرداخت');
    } finally {
      setSaving(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      await StorageService.updatePaymentStatus(paymentId, 'SUCCESS');
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'SUCCESS' } : p))
      );
      setSuccessMessage('فیش واریزی تأیید و وضعیت پرونده متقاضی به مرحله بعد ارتقا یافت.');
    } catch {
      setErrorMessage('خطا در تأیید فیش واریزی');
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await StorageService.updatePaymentStatus(paymentId, 'FAILED');
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: 'FAILED' } : p))
      );
    } catch {
      setErrorMessage('خطا در رد فیش واریزی');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
          <span>در حال فراخوانی درگاه‌های مالی...</span>
        </div>
      </div>
    );
  }

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const successCount = payments.filter(p => p.status === 'SUCCESS').length;

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-8 bg-slate-50/50">
      {/* Top Banner with Soft Organizational Gradient */}
      <div 
        id="admin-payments-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 backdrop-blur-md">
              <CreditCard className="w-3.5 h-3.5" />
              <span>پیکربندی درگاه‌های بانکی و مالی</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              مدیریت تراکنش‌ها و درگاه‌های پرداخت
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              تنظیم درگاه پرداخت اینترنتی زرین‌پال، اطلاعات حساب واریز مستقیم (کارت‌به‌کارت) و بررسی فیش‌های واریزی مراجعین.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">فیش‌های در انتظار تأیید</span>
              <span className={`text-lg font-black font-mono mt-0.5 block ${pendingCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {pendingCount} <span className="text-xs font-normal text-slate-400">مورد</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
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

      {/* Gateway Configuration Cards */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ZarinPal Gateway Card */}
          <div 
            id="card-zarinpal-gateway"
            className="relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      درگاه اینترنتی زرین‌پال (ZarinPal)
                    </h2>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      پرداخت آنلاین شتابی با انتقال خودکار
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.zarinpalEnabled}
                    onChange={(e) => setSettings({ ...settings, zarinpalEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  کد مرچنت درگاه (Merchant ID)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={settings.zarinpalMerchantId}
                  onChange={(e) => setSettings({ ...settings, zarinpalMerchantId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all text-left"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>دریافت کد مرچنت از پنل اختصاصی زرین‌پال</span>
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>وضعیت درگاه:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                settings.zarinpalEnabled ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {settings.zarinpalEnabled ? 'فعال و در دسترس' : 'غیرفعال'}
              </span>
            </div>
          </div>

          {/* Card-to-Card Box */}
          <div 
            id="card-cardtocard-gateway"
            className="relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      واریز مستقیم و کارت‌به‌کارت
                    </h2>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      ارائه شماره شبا/کارت و بررسی فیش دستی
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cardToCardEnabled}
                    onChange={(e) => setSettings({ ...settings, cardToCardEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نام بانک</label>
                  <input
                    type="text"
                    value={settings.bankDetails.bankName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankDetails: { ...settings.bankDetails, bankName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">صاحب حساب</label>
                  <input
                    type="text"
                    value={settings.bankDetails.accountHolder}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankDetails: { ...settings.bankDetails, accountHolder: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره کارت (۱۶ رقمی)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.bankDetails.cardNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankDetails: { ...settings.bankDetails, cardNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-center tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">شماره شبا (IBAN)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={settings.bankDetails.shebaNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bankDetails: { ...settings.bankDetails, shebaNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>وضعیت کارت‌به‌کارت:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                settings.cardToCardEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {settings.cardToCardEnabled ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات درگاه‌ها'}</span>
          </button>
        </div>
      </form>

      {/* Transaction & Receipt Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">دفتر کل تراکنش‌ها و فیش‌های ارسالی</h2>
              <p className="text-xs text-slate-400 font-normal">بررسی و تأیید پرداخت‌های متقاضیان</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-xl font-bold font-mono">
              کل تراکنش‌ها: {payments.length}
            </span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            تراکنشی در سیستم ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3">شناسه پرونده</th>
                  <th className="p-3">روش پرداخت</th>
                  <th className="p-3">مبلغ (تومان)</th>
                  <th className="p-3">کد پیگیری / توضیحات فیش</th>
                  <th className="p-3">تاریخ ثبت</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-700">{p.caseId}</td>
                    <td className="p-3 font-semibold">
                      {p.gateway === 'CARD_TO_CARD' ? (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200/70 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          کارت‌به‌کارت
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200/70 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          زرین‌پال
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900 font-mono">
                      {(p.amount / 10).toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">{p.transactionId}</div>
                      {p.cardReceiptInfo && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {p.cardReceiptInfo.cardNumberLast4 && `۴ رقم آخر کارت: ${p.cardReceiptInfo.cardNumberLast4} | `}
                          {p.cardReceiptInfo.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px] font-mono">
                      {new Date(p.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-3">
                      {p.status === 'SUCCESS' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full font-bold text-[10px]">
                          تأیید شده
                        </span>
                      ) : p.status === 'PENDING' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full font-bold text-[10px]">
                          در انتظار بررسی
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full font-bold text-[10px]">
                          رد شده
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprovePayment(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تأیید فیش</span>
                          </button>
                          <button
                            onClick={() => handleRejectPayment(p.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer"
                          >
                            رد
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">انجام شده</span>
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
