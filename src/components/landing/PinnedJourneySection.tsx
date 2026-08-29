import React, { useState, useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';
import {
  ShieldCheck,
  Brain,
  Award,
  Filter,
  Users,
  ChevronLeft,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  ArrowDown,
} from 'lucide-react';

interface PinnedJourneySectionProps {
  onStartRegistration: () => void;
}

interface JourneyStage {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  bulletPoints: string[];
  clinicalInsight: string;
  privacyGuarantee: string;
}

const STAGES: JourneyStage[] = [
  {
    id: 'auth',
    stepNumber: '۰۱',
    title: 'ثبت‌نام پیامکی و پرونده الکترونیک',
    subtitle: 'رمزگذاری کامل و اختصاص شناسه یکتای محرمانه',
    icon: LockKeyhole,
    color: 'teal',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-200',
    description:
      'در مرحله نخست، تنها با یک پیامک وارد سامانه می‌شوید. هویت، نام خانوادگی، تصاویر و اطلاعات تماس شما رمزگذاری شده و در هیچ بخش عمومی نمایش داده نمی‌شود.',
    bulletPoints: [
      'عدم نمایش عکس، شماره تماس و مشخصات هویتی برای عموم',
      'تخصیص شناسه امنیتی یکتا جهت پیگیری‌های کلینیک',
      'ثبت منشور اخلاقی و توافق‌نامه رازداری دوطرفه',
    ],
    clinicalInsight:
      'احساس امنیت روانی پیش‌شرط صداقت در پاسخگویی به آزمون‌های روان‌شناختی است.',
    privacyGuarantee: 'ضمانت ۱۰۰٪ محرمانگی تحت نظارت نظام روان‌شناسی ایران',
  },
  {
    id: 'tests',
    stepNumber: '۰۲',
    title: 'آزمون‌های استاندارد روان‌سنجی ۵ بعدی',
    subtitle: 'شخصیت NEO، سبک‌های دلبستگی، گاتمن و ارزش‌های شوارتز',
    icon: Brain,
    color: 'sky',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-200',
    description:
      'پاسخگویی به پرسشنامه‌های بالینی معتبر جهانی در محیطی آرام و بدون محدودیت زمانی با قابلیت ذخیره خودکار پاسخ‌ها.',
    bulletPoints: [
      'آزمون ۵ عاملی شخصیت نئو (روان‌رنجوری، برون‌گرایی، سازگاری و وجدان)',
      'سنجش الگوی دلبستگی ایمن، اضطرابی یا اجتنابی (Hazan-Shaver)',
      'ارزیابی پویایی حل اختلاف بر پایه مدل ۴ سوار گاتمن',
    ],
    clinicalInsight:
      'بیش از ۸۰٪ طلاق‌های زودهنگام ناشی از تفاوت‌های شدید در روان‌رنجورخویی و سبک دلبستگی است که با این آزمون‌ها شناسایی می‌شود.',
    privacyGuarantee: 'نتایج تست‌ها منحصراً در اختیار مشاور ارشد قرار می‌گیرد.',
  },
  {
    id: 'interview',
    stepNumber: '۰۳',
    title: 'مصاحبه تشخیصی با سرکار خانم مهناز خوینی',
    subtitle: 'بررسی بالینی پرونده، انطباق نیازها و رفع ابهامات',
    icon: Award,
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-200',
    description:
      'جلسه اختصاصی با کارشناس ارشد روانشناسی (حضوری در کلینیک تهران یا آنلاین برای سایر شهرها) جهت اعتبارسنجی بالینی کارنامه روان‌سنجی.',
    bulletPoints: [
      'بررسی دقیق پیشینه خانوادگی، اهداف فردی و اولویت‌های زندگی',
      'تحلیل عمیق تضادهای بالقوه و ارائه راهکارهای رشد پیش از ازدواج',
      'تعیین دقیق وزن شاخص‌های همسان‌گزینی برای شخص شما',
    ],
    clinicalInsight:
      'مصاحبه بالینی، هوش آزمون‌های تستی را با تجربه ۱۵ ساله درمانگری پیوند می‌زند.',
    privacyGuarantee: 'جلسه کاملاً اختصاصی و با رعایت کامل سوگندنامه رازداری پزشکی.',
  },
  {
    id: 'matching',
    stepNumber: '۰۴',
    title: 'انطباق هوشمند و بررسی خطوط قرمز',
    subtitle: 'فیلتر قطعی شرایط غیرقابل‌مذاکره و محاسبه ماتریس سازگاری',
    icon: Filter,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    borderColor: 'border-emerald-200',
    description:
      'بررسی دقیق خطوط قرمز (فرزندآوری، مهاجرت، وضعیت اقتصادی و مسائل حقوقی) پیش از آنکه طرفین زمان یا انرژی عاطفی هزینه کنند.',
    bulletPoints: [
      'فیلتر ۱۰۰٪ خطوط قرمز غیرقابل‌مذاکره',
      'محاسبه شاخص ترکیبی همسانی بر مبنای هوش بالینی',
      'تأیید دستی هر مورد معرفی توسط کارشناس ارشد پیش از ارسال',
    ],
    clinicalInsight:
      'هیچ معرفی‌ای صرفاً بر اساس محاسبات ماشینی انجام نمی‌شود؛ تأیید نهایی منوط به بررسی روان‌شناس است.',
    privacyGuarantee: 'تنها خلاصه ناشناس (بدون عکس و نام) برای بررسی اولیه ارسال می‌شود.',
  },
  {
    id: 'intro',
    stepNumber: '۰۵',
    title: 'معرفی کنترل‌شده و جلسات آشنایی هدایت‌شده',
    subtitle: 'برگزاری جلسه با رضایت دوطرفه و حضور مشاور و خانواده‌ها',
    icon: Users,
    color: 'teal',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-900',
    borderColor: 'border-teal-200',
    description:
      'پس از تأیید پیش‌نمایش ناشناس توسط هر دو طرف، جلسه معارفه در کلینیک یا با هماهنگی خانواده‌ها همراه با پروتکل‌های گفتگوی سازنده برگزار می‌گردد.',
    bulletPoints: [
      'ارائه سرفصل‌های تخصصی گفتگو برای جلسات اول تا سوم',
      'پشتیبانی مشاور جهت پاسخگویی به تردیدها و سوالات طرفین',
      'امکان ادامه فرایند و معرفی گزینه‌های دیگر در صورت عدم توافق اولیه',
    ],
    clinicalInsight:
      'همراهی مشاور در جلسات نخست، از تصمیم‌گیری‌های شتاب‌زده یا سوءتفاهم‌های کلامی جلوگیری می‌کند.',
    privacyGuarantee: 'تبادل اطلاعات تماس و عکس تنها پس از توافق صریح دوطرفه در جلسه رسمی.',
  },
];

export const PinnedJourneySection: React.FC<PinnedJourneySectionProps> = ({
  onStartRegistration,
}) => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStage = STAGES[activeStageIdx];
  const IconComponent = activeStage.icon;

  useGsapContext(
    () => {
      // Gentle entrance for title and cards
      gsap.from('.journey-header', {
        opacity: 0,
        y: 30,
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
    <section ref={containerRef} className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="journey-header text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black border border-teal-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          نقشه راه کلینیکی از اولین گام تا عقد آگاهانه
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ۵ گام امن، ساختاریافته و تضمین‌شده
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          سامانه پیوند امن چگونه شما را از تله‌های عاطفی، انتخاب‌های احساسی و سردرگمی در ازدواج محافظت می‌کند؟
        </p>
      </div>

      {/* Main Interactive Stage Viewer (Desktop & Mobile Friendly) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-8">
        {/* Navigation Step Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {STAGES.map((stage, idx) => {
            const isSelected = idx === activeStageIdx;
            const StageIcon = stage.icon;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStageIdx(idx)}
                className={`p-3 sm:p-4 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-900 shadow-md shadow-teal-950/20'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg ${
                      isSelected
                        ? 'bg-teal-800 text-teal-200'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800'
                    }`}
                  >
                    گام {stage.stepNumber}
                  </span>
                  <StageIcon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-teal-300' : 'text-slate-400 group-hover:text-teal-600'
                    }`}
                  />
                </div>
                <div className="font-extrabold text-xs leading-snug line-clamp-1">
                  {stage.title.split(' ')[0]} {stage.title.split(' ')[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Detail Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 shadow-2xs">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-teal-700">
                  مرحله {activeStage.stepNumber} از ۵
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeStage.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-[1.9] font-normal">
              {activeStage.description}
            </p>

            {/* Bullet Points */}
            <div className="space-y-2.5 pt-1">
              {activeStage.bulletPoints.map((point, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{point}</span>
                </div>
              ))}
            </div>

            {/* Clinical Insight & Privacy Note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <Award className="w-4 h-4 text-amber-600" />
                <span>نگاه بالینی مشاور:</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                «{activeStage.clinicalInsight}»
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] font-bold text-teal-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{activeStage.privacyGuarantee}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onStartRegistration}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <span>ورود به سامانه و ثبت گام {activeStage.stepNumber}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Summary Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 p-6 sm:p-7 text-white shadow-xl border border-teal-500/20 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold text-teal-300">شاخص اطمینان بالینی</span>
                <span className="text-xs font-mono font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-xl border border-teal-500/30">
                  تضمین نظارت
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">سطح محرمانگی داده‌ها:</div>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>۱۰۰٪ رمزگذاری شده (بدون انتشار عمومی)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">مرجع بازبینی و تأیید:</div>
                  <div className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>سرکار خانم مهناز خوینی (عضو سازمان نظام)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">میانگین زمان طی این گام:</div>
                  <div className="text-sm font-black text-teal-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>فوری / در بستر الکترونیک ۲۴ ساعته</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>پروتکل اخلاقی پیوند امن</span>
                <span className="text-teal-400 font-mono text-[11px]">ISO / Clinical Standard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
