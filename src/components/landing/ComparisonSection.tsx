import React, { useRef } from 'react';
import { Check, X, Shield, Users, Lock, Award, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';

export const ComparisonSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGsapContext(
    () => {
      gsap.from('.comparison-header', {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      gsap.from('.comparison-row', {
        opacity: 0,
        y: 15,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.comparison-table',
          start: 'top 85%',
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  const comparisonRows = [
    {
      feature: 'نحوه ارزیابی و شناخت اولیه',
      traditional: 'بر اساس ادعاها، ظاهر اولیه یا معرفی‌های تصادفی واسطه‌ها بدون سنجش',
      peyvand: 'آزمون‌های استاندارد ۵ عاملی روان‌سنجی (NEO) + مصاحبه بالینی کارشناس ارشد',
      benefit: 'شناخت علمی عمقی',
    },
    {
      feature: 'بررسی خطوط قرمز و تعارضات',
      traditional: 'مسکوت ماندن تا ماه‌ها پس از آشنایی یا بعد از عقد و بروز سرخوردگی',
      peyvand: 'فیلتر قطعی خطوط قرمز (فرزندآوری، سکونت، سبک زندگی) قبل از هرگونه معرفی',
      benefit: 'صرفه‌جویی در زمان و احساس',
    },
    {
      feature: 'حفظ محرمانگی و حریم خصوصی',
      traditional: 'انتشار عکس‌ها، کانال‌های عمومی تلگرام یا واسطه‌گری‌های غیرمجاز',
      peyvand: 'پیش‌نمایش ۱۰۰٪ ناشناس (Anonymous Preview) و رمزگذاری کامل داده‌ها',
      benefit: 'حفظ آبرو و وقار خانوادگی',
    },
    {
      feature: 'نظارت تخصصی و هدایت گفتگوها',
      traditional: 'بدون حضور روان‌شناس، متکی بر آزمون و خطای طرفین و سوءتفاهم‌ها',
      peyvand: 'نظارت مستقیم سرکار خانم مهناز خوینی (عضو سازمان نظام روان‌شناسی • پروانه ۱۴۱۴۰۸۳)',
      benefit: 'راهنمایی گام‌به‌گام تخصصی',
    },
    {
      feature: 'مدیریت انتظارات و آموزش پیش از عقد',
      traditional: 'صفر — تصمیم‌گیری‌های شتاب‌زده بر مبنای هیجانات زودگذر',
      peyvand: 'ارائه کارنامه تحلیلی سازگاری، آموزش حل تعارض گاتمن و جلسات مشاوره',
      benefit: 'پایداری رابطه در بلندمدت',
    },
  ];

  return (
    <section ref={containerRef} id="comparison-section" className="space-y-8 scroll-mt-24">
      <div className="comparison-header text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black border border-teal-200 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-teal-700" />
          مقایسه رویکرد بالینی با روش‌های سنتی
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          چرا انتخاب علمی با پیوند امن آرامش‌بخش است؟
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          تفاوت‌های اساسی سامانه تخصصی و تحت نظارت روانشناس بالینی در برابر شیوه‌های متداول سنتی و تصادفی
        </p>
      </div>

      <div className="comparison-table bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-700">
          <div className="p-4 md:col-span-4 border-b md:border-b-0 md:border-l border-slate-200 flex items-center gap-2">
            <span>شاخص مقایسه و ارزیابی</span>
          </div>
          <div className="p-4 md:col-span-4 border-b md:border-b-0 md:border-l border-slate-200 text-rose-900 bg-rose-50/40 flex items-center gap-2 font-extrabold">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>روش‌های سنتی و واسطه‌گری‌های تصادفی</span>
          </div>
          <div className="p-4 md:col-span-4 bg-teal-900 text-white flex items-center gap-2 font-black">
            <Check className="w-4 h-4 text-teal-300 shrink-0" />
            <span>سامانه تخصصی پیوند امن (peyvandamn.ir)</span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {comparisonRows.map((row, idx) => (
            <div
              key={idx}
              className="comparison-row grid grid-cols-1 md:grid-cols-12 text-xs transition-colors hover:bg-slate-50/70"
            >
              <div className="p-4 md:col-span-4 font-black text-slate-900 md:border-l border-slate-100 flex flex-col justify-center gap-1">
                <span>{row.feature}</span>
                <span className="text-[11px] font-bold text-teal-800 hidden sm:inline">
                  {row.benefit}
                </span>
              </div>
              <div className="p-4 md:col-span-4 text-slate-600 md:border-l border-slate-100 leading-relaxed flex items-start gap-2.5 bg-slate-50/30">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✕
                </span>
                <span className="font-normal">{row.traditional}</span>
              </div>
              <div className="p-4 md:col-span-4 text-slate-900 font-medium leading-relaxed flex items-start gap-2.5 bg-teal-50/30">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="font-semibold text-teal-950">{row.peyvand}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
