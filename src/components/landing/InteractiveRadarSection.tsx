import React, { useState, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';
import {
  Brain,
  Heart,
  Compass,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface Dimension {
  id: string;
  nameFa: string;
  nameEn: string;
  category: string;
  scoreWeight: string;
  icon: any;
  summary: string;
  clinicalImpact: string;
  sampleQuestion: string;
  highMatchEffect: string;
}

const DIMENSIONS: Dimension[] = [
  {
    id: 'neo',
    nameFa: 'شخصیت و خلق‌وخو (آزمون ۵ عاملی NEO)',
    nameEn: 'Big Five Personality (NEO-PI-R)',
    category: 'سازگاری روانی',
    scoreWeight: '۲۵٪ از وزن همسانی',
    icon: Brain,
    summary:
      'ارزیابی ۵ صفت بنیادین ژنتیکی و پایدار شامل روان‌رنجوری (ثبات هیجانی)، برون‌گرایی، گشودگی به تجربه، توافق‌پذیری و وجدان‌گرایی.',
    clinicalImpact:
      'پیش‌بینی میزان پایداری در بحران‌ها، نحوه تقسیم وظایف خانه و تطابق انرژی روانی دو نفر در زیر یک سقف.',
    sampleQuestion: 'هنگام مواجهه با ناکامی مالی یا شغلی، تا چه میزان واکنش اضطرابی یا خشم نشان می‌دهید؟',
    highMatchEffect: 'کاهش ۷۵ درصدی دلخوری‌های روزمره و ایجاد زبان مشترک در حل چالش‌ها.',
  },
  {
    id: 'attachment',
    nameFa: 'سبک‌های دلبستگی عاطفی (Hazan-Shaver)',
    nameEn: 'Adult Attachment Dynamics',
    category: 'امنیت هیجانی',
    scoreWeight: '۲۵٪ از وزن همسانی',
    icon: Heart,
    summary:
      'تشخیص الگوی ناخودآگاه فرد در ایجاد صمیمیت و نحوه مواجهه با ترس از طرد شدن یا وابستگی (ایمن، مضطرب یا اجتنابی).',
    clinicalImpact:
      'جلوگیری از افتادن در تله کلاسیک «یکی پیگیر و خواهان صحبت مداوم، دیگری فراری و دیوارکش» در زندگی مشترک.',
    sampleQuestion: 'وقتی شریک زندگی‌تان نیاز به تنهایی چندساعته دارد، چه احساسی در شما فعال می‌شود؟',
    highMatchEffect: 'ایجاد آشیانه امن روانی که پناهگاه فرد در روزهای پرتنش بیرونی است.',
  },
  {
    id: 'gottman',
    nameFa: 'مدیریت اختلاف و حل تعارض (الگوی گاتمن)',
    nameEn: 'Gottman Conflict Resolution',
    category: 'مهارت تعاملی',
    scoreWeight: '۲۰٪ از وزن همسانی',
    icon: Compass,
    summary:
      'سنجش حضور یا غیاب «چهار سوار ویرانگر رابطه» (انتقاد گزنده، تحقیر، موضع دفاعی، سکوت و دیوارکشی) و وجود پادزهرهای اصلاحی.',
    clinicalImpact:
      'تضمین اینکه تفاوت سلیقه‌ها و بحث‌های عادی، به جراحت عاطفی عمیق یا فرسایش عشق تبدیل نشوند.',
    sampleQuestion: 'در حین جروبحث، آیا توانایی متوقف کردن بحث و عذرخواهی یا شنیدن دیدگاه مقابل را دارید؟',
    highMatchEffect: 'توانایی بازسازی سریع صمیمیت ظرف کمتر از ۲۴ ساعت پس از هر اختلاف.',
  },
  {
    id: 'schwartz',
    nameFa: 'ماتریس ارزش‌های بنیادین شوارتز',
    nameEn: 'Schwartz Theory of Basic Human Values',
    category: 'جهان‌بینی و اهداف',
    scoreWeight: '۱۵٪ از وزن همسانی',
    icon: Sparkles,
    summary:
      'شفاف‌سازی ۱۰ جهت‌گیری اولویت‌دار زندگی شامل تمایل به سنت و خانواده، پیشرفت و جاه‌طلبی شغلی، استقلال فردی یا لذت‌گرایی.',
    clinicalImpact:
      'هم‌راستایی در محل زندگی، نحوه هزینه‌کرد درآمد، تربیت فرزند و ارتباط با خانواده‌های پدری و مادری.',
    sampleQuestion: 'اگر بین فرصت مهاجرت شغلی عالی و نزدیکی به خانواده پدری تعارض پیش آید، تصمیم شما چیست؟',
    highMatchEffect: 'هم‌افزایی اقتصادی و پرهیز از احساس سرخوردگی یا فداکاری اجباری در سال‌های بعد.',
  },
  {
    id: 'hardredlines',
    nameFa: 'فیلتر قطعی خطوط قرمز (Hard Criteria)',
    nameEn: 'Non-Negotiable Redlines Matrix',
    category: 'شروط ضروری',
    scoreWeight: '۱۵٪ (شرط لازم معرفی)',
    icon: ShieldAlert,
    summary:
      'ارزیابی مواردی که با سازش یا مشاوره تغییر نمی‌کنند، از جمله تصمیم قطعی درباره فرزندآوری، محل سکونت و پیشینه‌های حقوقی/ازدواج.',
    clinicalImpact:
      'حذف کامل اتلاف وقت و سرخوردگی ناشی از کشف شروط غیرقابل‌تغییر پس از ماه‌ها وابستگی عاطفی.',
    sampleQuestion: 'آیا در خصوص زمان و تعداد فرزندان، خط‌قرمز تغییرناپذیری دارید؟',
    highMatchEffect: 'اطمینان ۱۰۰٪ از نبود بن‌بست‌های اساسی قبل از اولین قرار معارفه.',
  },
];

interface InteractiveRadarSectionProps {
  onStartRegistration: () => void;
}

export const InteractiveRadarSection: React.FC<InteractiveRadarSectionProps> = ({
  onStartRegistration,
}) => {
  const [selectedDimensionId, setSelectedDimensionId] = useState('neo');
  const containerRef = useRef<HTMLDivElement>(null);
  const activeDim = DIMENSIONS.find((d) => d.id === selectedDimensionId) || DIMENSIONS[0];
  const Icon = activeDim.icon;

  useGsapContext(
    () => {
      gsap.from('.radar-header', {
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
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} id="scientific-framework" className="space-y-8 scroll-mt-24">
      {/* Header */}
      <div className="radar-header text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black border border-teal-200">
          <Brain className="w-3.5 h-3.5 text-teal-700" />
          مبانی علمی همسان‌گزینی روانشناختی
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ۵ ستون علمی ارزیابی پیش از ازدواج
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          هر پرونده بر پایه ۵ پرسشنامه استاندارد روان‌سنجی بررسی و نمره‌گذاری می‌شود تا تصویری شفاف از تناسب دو شخصیت حاصل شود.
        </p>
      </div>

      {/* Interactive 5-Dimensional Hub */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-6">
        {/* Dimension Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {DIMENSIONS.map((dim) => {
            const isSelected = dim.id === selectedDimensionId;
            const DimIcon = dim.icon;
            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => setSelectedDimensionId(dim.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-900 text-white shadow-sm ring-2 ring-teal-800/30'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-teal-300'
                }`}
              >
                <DimIcon className={`w-4 h-4 ${isSelected ? 'text-teal-300' : 'text-slate-500'}`} />
                <span>{dim.nameFa.split('(')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Dimension Active Card Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-start">
          {/* Dimension Details (8 cols) */}
          <div className="lg:col-span-8 space-y-5 bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {activeDim.nameFa}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">{activeDim.nameEn}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-teal-100 text-teal-800 border border-teal-200">
                {activeDim.scoreWeight}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {activeDim.summary}
            </p>

            <div className="space-y-3 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>تأثیر بالینی این شاخص در زندگی مشترک:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light">
                  {activeDim.clinicalImpact}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>نمونه موضوع سنجش‌شده در آزمون:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                  «{activeDim.sampleQuestion}»
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>نتیجه تطابق بالا: {activeDim.highMatchEffect}</span>
              </div>
            </div>
          </div>

          {/* Side Summary & Action (4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-2xl p-6 space-y-5 border border-teal-700/40 shadow-md">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-teal-300">گزارش کارنامه ۵ بعدی</span>
              <h4 className="text-base font-black text-white">تفسیر اختصاصی کارشناس ارشد</h4>
            </div>

            <p className="text-xs text-teal-100 leading-relaxed font-light">
              پس از تکمیل آزمون‌ها، نمودار ۵ بعدی همسانی شما رسم شده و نقاط قوت ارتباطی و هشدارهای بالینی توسط سرکار خانم خوینی تشریح می‌گردد.
            </p>

            <div className="space-y-2 text-xs text-teal-200 pt-2 border-t border-teal-800">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>ارائه نمودار راداری نمرات ۵ صفت نئو</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>تحلیل سبک دلبستگی پارتنر ایده‌آل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>پیش‌بینی نرخ سازگاری در ۱۰ سال اول</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3 rounded-xl bg-white text-teal-950 hover:bg-teal-50 font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>پاسخ به آزمون‌های ۵ بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
