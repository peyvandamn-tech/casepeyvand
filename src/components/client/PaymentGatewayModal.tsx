/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService, DEFAULT_PAYMENT_SETTINGS } from '../../services/storage';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Building2, 
  Landmark, 
  Copy, 
  Check, 
  Send,
  AlertCircle 
} from 'lucide-react';

interface PaymentGatewayModalProps {
  caseId?: string;
  userId?: string;
  activeCase?: { id: string };
  currentUser?: { id: string };
  isOpen?: boolean;
  onClose: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  caseId: propCaseId,
  userId: propUserId,
  activeCase,
  currentUser,
  isOpen = true,
  onClose,
}) => {
  const caseId = propCaseId || activeCase?.id || 'CASE-001';
  const userId = propUserId || currentUser?.id || 'user-001';
  const [settings, setSettings] = useState(DEFAULT_PAYMENT_SETTINGS);

  useEffect(() => {
    StorageService.getPaymentSettings().then((s) => {
      setSettings(s);
      setActiveTab(s.zarinpalEnabled ? 'ZARINPAL' : 'CARD_TO_CARD');
    });
  }, []);

  const [activeTab, setActiveTab] = useState<'ZARINPAL' | 'CARD_TO_CARD'>('CARD_TO_CARD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card to Card Form State
  const [trackingCode, setTrackingCode] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [receiptNote, setReceiptNote] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleZarinpalPay = async () => {
    setLoading(true);
    try {
      const reqRes = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          userId,
          amount: 12000000,
          description: 'پکیج ارزیابی روانشناختی و تشکیل پرونده',
        }),
      });
      const reqData = await reqRes.json();

      if (reqData.success && reqData.paymentUrl) {
        // Stash context for the callback route to pick back up after
        // ZarinPal redirects the user back to this app.
        sessionStorage.setItem('peyvand_pending_payment', JSON.stringify({ caseId, userId, amount: 12000000 }));
        window.location.href = reqData.paymentUrl;
        return; // page is navigating away — nothing left to do here
      }

      alert(reqData.error || 'خطا در اتصال به درگاه پرداخت زرین‌پال');
      setLoading(false);
    } catch (err) {
      console.error('Payment request error:', err);
      alert('خطا در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید.');
      setLoading(false);
    }
  };

  const handleCardToCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      alert('لطفاً شماره پیگیری یا کد ارجاع واریز را وارد کنید.');
      return;
    }

    setLoading(true);

    try {
      // Stays PENDING until an admin verifies the deposit receipt — this is
      // not a paid confirmation, just a submission for manual review. RLS
      // only allows the client to insert a PENDING card-to-card row; a
      // SUCCESS/ZarinPal row can only be written server-side.
      await StorageService.submitCardToCardReceipt({
        id: `pay-${Date.now()}`,
        caseId,
        userId,
        amount: 12000000,
        gateway: 'CARD_TO_CARD',
        transactionId: trackingCode.trim(),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        cardReceiptInfo: {
          cardNumberLast4: cardLast4,
          trackingCode: trackingCode.trim(),
          receiptDate: new Date().toLocaleDateString('fa-IR'),
          notes: receiptNote,
        },
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to submit card-to-card receipt:', err);
      setLoading(false);
      alert('ثبت رسید با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Landmark className="w-5 h-5 text-sky-600" />
            <span className="font-bold text-sm text-slate-800">پرداخت هزینه تشکیل پرونده و آزمون‌ها</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">SECURE-PAY</span>
        </div>

        {/* Tab Selection if both enabled */}
        {settings.zarinpalEnabled && settings.cardToCardEnabled && !success && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('ZARINPAL')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ZARINPAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>درگاه آنلاین (زرین‌پال)</span>
            </button>
            <button
              onClick={() => setActiveTab('CARD_TO_CARD')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'CARD_TO_CARD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>کارت به کارت (مستقیم)</span>
            </button>
          </div>
        )}

        {/* Notice if ZarinPal is turned off */}
        {!settings.zarinpalEnabled && settings.cardToCardEnabled && !success && (
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>درگاه آنلاین موقتاً غیرفعال است؛ لطفاً از روش واریز کارت‌به‌کارت استفاده فرمایید.</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">پرداخت با موفقیت ثبت شد</h3>
            <p className="text-xs text-slate-500">پکیج ارزیابی روانشناختی و تشکیل پرونده شما فعال گردید.</p>
          </div>
        ) : activeTab === 'CARD_TO_CARD' || (!settings.zarinpalEnabled && settings.cardToCardEnabled) ? (
          /* CARD TO CARD VIEW */
          <div className="space-y-4">
            {/* Bank Details Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-md space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400">{settings.bankDetails.bankName}</span>
                <span className="text-[10px] text-slate-400">حساب رسمی پیوند امن</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">شماره کارت:</span>
                <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                  <span className="font-mono text-sm tracking-widest font-bold dir-ltr">
                    {settings.bankDetails.cardNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.bankDetails.cardNumber, 'card')}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                  >
                    {copiedField === 'card' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">صاحب حساب:</span>
                  <span className="font-semibold text-slate-200 text-[11px] truncate block">
                    {settings.bankDetails.accountHolder}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">مبلغ قابل واریز:</span>
                  <span className="font-bold text-emerald-400 text-xs">۱,۲۰۰,۰۰۰ تومان</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">شماره شبا (IBAN):</span>
                <div className="flex items-center justify-between bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700">
                  <span className="font-mono text-[11px] dir-ltr text-slate-300">
                    {settings.bankDetails.shebaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.bankDetails.shebaNumber, 'sheba')}
                    className="p-1 text-slate-300 hover:bg-slate-700 rounded-lg transition"
                  >
                    {copiedField === 'sheba' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Form */}
            <form onSubmit={handleCardToCardSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 border-b border-slate-200 pb-2">
                ثبت اطلاعات فیش واریزی
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  کد پیگیری / شماره ارجاع واریز <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="مثال: ۹۸۷۶۵۴۳۲۱"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">۴ رقم آخر کارت شما</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    placeholder="۱۲۳۴"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-center dir-ltr text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">تاریخ پرداخت</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('fa-IR')}
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-center text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">توضیحات یا کد پیگیری تکمیلی (اختیاری)</label>
                <input
                  type="text"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  placeholder="توضیحات کوتاه..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>در حال ثبت فیش...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>ثبت فیش و فعال‌سازی</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ZARINPAL ONLINE VIEW */
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>عنوان خدمت:</span>
                <span className="font-bold text-slate-800">پکیج ارزیابی روانشناختی و ۵ آزمون تخصصی</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>شماره پرونده:</span>
                <span className="font-mono font-semibold text-slate-800">{caseId}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">مبلغ قابل پرداخت:</span>
                <span className="font-bold text-teal-700 text-sm">۱,۲۰۰,۰۰۰ تومان</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>با کلیک روی دکمه زیر، به درگاه امن زرین‌پال منتقل می‌شوید و پس از پرداخت به‌صورت خودکار به این صفحه بازمی‌گردید.</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>اتصال ایمن با پروتکل SSL و تایید خودکار پس از پرداخت</span>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                انصراف
              </button>
              <button
                onClick={handleZarinpalPay}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-2 space-x-reverse"
              >
                {loading ? (
                  <span>در حال ارتباط با بانک...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>پرداخت آنلاین زرین‌پال</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
