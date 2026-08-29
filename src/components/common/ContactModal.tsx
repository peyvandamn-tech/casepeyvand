import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  Send,
  ShieldCheck,
  Award,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-6"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-950 text-white p-6 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <img src="/logo-mark.png" alt="پیوند امن" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">راه‌های ارتباطی کلینیک پیوند امن</h3>
                <p className="text-xs text-teal-200/90 mt-0.5">
                  مرکز تخصصی روانشناسی و ارزیابی ازدواج • وب‌سایت: peyvandamn.ir
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Clinical Director Banner */}
            <div className="bg-gradient-to-br from-teal-50 to-sky-50 p-4 rounded-2xl border border-teal-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>سرکار خانم مهناز خوینی</span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                    زوج‌درمانگر و مسئول فنی کلینیک
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  کارشناس ارشد روانشناسی بالینی و مشاوره خانواده و زوج‌درمانگر، عضو رسمی سازمان نظام روان‌شناسی و مشاوره ایران (شماره پروانه تخصصی: <strong>۱۴۱۴۰۸۳</strong>). مدیر سامانه تخصصی زوج‌درمانی (zoojdarman.ir) و مسئول فنی کلینیک پیوند امن.
                </p>
              </div>
            </div>

            {/* Direct Contact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Landline Phone */}
              <a
                href="tel:02144600980"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">تلفن ثابت کلینیک</div>
                    <div className="font-mono text-sm font-extrabold text-slate-900 dir-ltr text-right">
                      ۰۲۱-۴۴۶۰۰۹۸۰
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-700 font-bold bg-teal-50 group-hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200">
                  تماس تلفنی
                </span>
              </a>

              {/* Mobile Phone & Special Line */}
              <a
                href="tel:09199087264"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">تلفن همراه و مشاوره</div>
                    <div className="font-mono text-sm font-extrabold text-slate-900 dir-ltr text-right">
                      ۰۹۱۹۹۰۸۷۲۶۴
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-700 font-bold bg-teal-50 group-hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200">
                  تماس مستقیم
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/989199087264?text=%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D8%AC%D9%87%D8%AA%20%D9%85%D8%B4%D8%A7%D9%88%D8%B1%D9%87%20%D9%88%20%D8%AA%D8%B4%DA%A9%DB%8C%D9%84%20%D9%BE%D8%B1%D9%88%D9%86%D8%AF%D9%87%20%D8%AF%D8%B1%20%D9%BE%DB%8C%D9%88%D9%86%D8%AF%20%D8%A7%D9%85%D9%86%20%D9%BE%DB%8C%D8%A7%D9%85%20%D9%85%DB%8C%E2%80%8C%D8%AF%D9%87%D9%85."
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">پشتیبانی و نوبت‌دهی واتساپ</div>
                    <div className="font-mono text-sm font-extrabold text-slate-900 dir-ltr text-right">
                      ۰۹۱۹۹۰۸۷۲۶۴
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  ارسال پیام
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              {/* Official Email */}
              <a
                href="mailto:Khoini.1988@gmail.com"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 font-medium">پست الکترونیک درمانگر</div>
                    <div className="font-mono text-xs font-bold text-slate-800 truncate">
                      Khoini.1988@gmail.com
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-teal-700 font-bold bg-teal-50 group-hover:bg-teal-100 px-2 py-1 rounded-lg border border-teal-200">
                  ایمیل مستقیم
                </span>
              </a>
            </div>

            {/* Websites Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Peyvand Amn Website */}
              <a
                href="https://peyvandamn.ir"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">سامانه همسان‌گزینی</div>
                    <div className="font-mono text-xs font-bold text-slate-800">peyvandamn.ir</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              {/* ZoojDarman Website */}
              <a
                href="https://zoojdarman.ir"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">پلتفرم تخصصی زوج‌درمانی</div>
                    <div className="font-mono text-xs font-bold text-slate-800">zoojdarman.ir</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Physical Location & Directions */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  نشانی مطب و کلینیک
                </div>
                <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                  پذیرش با تعیین وقت قبلی
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                استان تهران، <strong>منطقه ۲ تهران</strong> (دسترسی مناسب، پذیرش حضوری جلسات معارفه و مصاحبه بالینی و همچنین ارائه جلسات آنلاین و تلفنی برای سراسر کشور).
              </p>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>ساعات پاسخگویی و جلسات: شنبه تا پنجشنبه ۹:۰۰ الی ۲۱:۰۰</span>
                </div>
                <span className="text-teal-300 font-medium">
                  پاسخگویی سریع مشاوران
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>پشتیبانی امن و مشاوره اختصاصی</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              بستن
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
