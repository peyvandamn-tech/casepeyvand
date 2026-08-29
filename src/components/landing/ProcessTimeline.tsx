import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, FileCheck, Brain, Calendar, Users, ChevronLeft, ShieldCheck, Check } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  shortDesc: string;
  detailedDesc: string;
  icon: any;
  bulletPoints: string[];
  actionLabel: string;
}

const STEPS: Step[] = [
  {
    number: '۱',
    title: 'احراز هویت و ثبت‌نام پیامکی',
    shortDesc: 'ورود امن با شماره همراه و دریافت کد یکبارمصرف',
    detailedDesc: 'در کمتر از ۲ دقیقه، شماره تماس شما در سامانه ثبت شده و حساب کاربری رمزگذاری‌شده شما فعال می‌گردد.',
    icon: Smartphone,
    bulletPoints: ['بدون نیاز به پسوردهای پیچیده', 'حفاظت کامل از شماره تماس', 'ایجاد پرونده الکترونیک امن'],
    actionLabel: 'ثبت‌نام با پیامک',
  },
  {
    number: '۲',
    title: 'تکمیل پروفایل و امضای رضایت‌نامه',
    shortDesc: 'ثبت اطلاعات فردی، تحصیلی و پذیرش منشور اخلاقی',
    detailedDesc: 'ثبت شرایط فردی، خطوط قرمز و پذیرش شفاف منشور محرمانگی و امضای پرونده جهت آغاز فرایند کارشناسی.',
    icon: FileCheck,
    bulletPoints: ['تعریف دقیق خطوط قرمز (فرزند، سکونت، تحصیل)', 'ثبت سبک زندگی و ارزش‌ها', 'ضمانت عدم انتشار داده'],
    actionLabel: 'تکمیل فرم پرونده',
  },
  {
    number: '۳',
    title: 'آزمون‌های استاندارد روان‌سنجی',
    shortDesc: 'پاسخ به سوالات علمی شخصیت، دلبستگی و تعارض',
    detailedDesc: 'انجام آزمون‌های معتبر NEO، دلبستگی و ارزش‌های شوارتز در محیطی آرام و بدون محدودیت زمانی با ذخیره خودکار.',
    icon: Brain,
    bulletPoints: ['تحلیل ۵ عاملی شخصیت', 'سنجش سبک دلبستگی عاشقانه', 'گزارش نمرات به صورت آنی'],
    actionLabel: 'ورود به سامانه آزمون‌ها',
  },
  {
    number: '۴',
    title: 'مصاحبه و ارزیابی کارشناس ارشد',
    shortDesc: 'بررسی بالینی پرونده توسط سرکار خانم خوینی',
    detailedDesc: 'جلسه تخصصی آنلاین یا حضوری با روان‌شناس جهت ارزیابی عمقی، بازبینی نتایج آزمون‌ها و آماده‌سازی برای معرفی همسان.',
    icon: Calendar,
    bulletPoints: ['ارزیابی حضوری یا آنلاین', 'تحلیل سازگاری و تعارضات پنهان', 'تأیید نهایی جهت ورود به چرخه معرفی'],
    actionLabel: 'رزرو وقت مصاحبه',
  },
  {
    number: '۵',
    title: 'معرفی کنترل‌شده و گام‌های آشنایی',
    shortDesc: 'ارسال پیش‌نمایش ناشناس و هماهنگی جلسه حضوری',
    detailedDesc: 'پس از انطباق‌سنجی الگوریتمی و تأیید کارشناس، خلاصه ناشناس به طرفین ارسال و پس از رضایت دوطرفه، جلسه آشنایی با همراهی خانواده‌ها برگزار می‌گردد.',
    icon: Users,
    bulletPoints: ['پیش‌نمایش ۱۰۰٪ ناشناس', 'رضایت دوطرفه الزامی', 'همراهی مشاور در تمام جلسات'],
    actionLabel: 'مشاهده روال معرفی‌ها',
  },
];

interface ProcessTimelineProps {
  onStepClick: (stepIndex: number) => void;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ onStepClick }) => {
  const [activeStep, setActiveStep] = useState(0);

  const cur = STEPS[activeStep];

  return (
    <section id="process" className="space-y-10 scroll-mt-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          فرایند ۵ مرحله‌ای تشکیل پرونده تا معرفی
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          مسیر روشن، شفاف و قانون‌مند
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          هر مرحله با نظارت کامل کارشناس ارشد مشاوره و با حفظ کامل حریم خصوصی شما انجام می‌شود.
        </p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STEPS.map((s, idx) => {
          const isSelected = idx === activeStep;
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-700 shadow-lg shadow-teal-900/10 ring-2 ring-teal-600/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border border-teal-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-extrabold ${
                    isSelected ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  گام {s.number}
                </span>
              </div>
              <div className="space-y-1">
                <div className="font-black text-xs sm:text-sm">{s.title}</div>
                <div
                  className={`text-[11px] leading-relaxed line-clamp-2 ${
                    isSelected ? 'text-teal-100' : 'text-slate-500'
                  }`}
                >
                  {s.shortDesc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              گام {cur.number} از ۵
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">{cur.title}</h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {cur.detailedDesc}
          </p>

          <div className="space-y-2 pt-2">
            {cur.bulletPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-stretch justify-center gap-3 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onStepClick(activeStep)}
            className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{cur.actionLabel}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-center text-slate-400">
            برای انجام این مرحله روی دکمه کلیک کنید
          </p>
        </div>
      </div>
    </section>
  );
};
