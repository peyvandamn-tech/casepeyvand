/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  LockKeyhole,
  HeartHandshake,
  Users2,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ChevronLeft,
  FileCheck2,
  Building2,
  Award,
  CalendarCheck
} from 'lucide-react';

interface LandingPageProps {
  onOpenOtpModal: () => void;
  onOpenContactModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenConsentModal?: () => void;
  onOpenPaymentModal?: () => void;
  onStartTest?: (testId: string) => void;
}

const ASSESSMENT_DIMENSIONS = [
  {
    id: 'neo',
    title: '۱. پنج عامل بزرگ شخصیت (NEO-FFI)',
    subtitle: 'ارزیابی ساختار پایدار شخصیت و صفات خلقی',
    description:
      'سنجش پنج شاخص بنیادین: ثبات هیجانی (در برابر روان‌رنجورخویی)، برون‌گرایی، گشودگی به تجارب جدید، دلپذیر بودن (توافق‌پذیری) و وظیفه‌شناسی و مسئولیت‌پذیری در زندگی مشترک.',
    details: [
      'بررسی هم‌خوانی سطح برون‌گرایی در سبک تفریح و معاشرت خانوادگی',
      'میزان مسئولیت‌پذیری مالی و تعهد به برنامه‌ریزی‌های مشترک',
      'نحوه مدیریت استرس‌ها و پایداری خلق در شرایط دشوار زندگی',
    ],
  },
  {
    id: 'attachment',
    title: '۲. سبک‌های دلبستگی بزرگسالان (ECR)',
    subtitle: 'ریشه‌یابی ناخودآگاه نیازهای عاطفی و صمیمیت',
    description:
      'تشخیص سبک‌های دلبستگی ایمن، مضطرب و اجتنابی. سبک دلبستگی مشخص می‌کند فرد در مواجهه با دوری، ترس از طرد شدن یا صمیمیت عاطفی چگونه واکنش نشان می‌دهد.',
    details: [
      'ارزیابی میزان اعتماد متقابل و احساس امنیت روانی در رابطه',
      'شناسایی الگوهای فاصله گرفتن یا نیاز مداوم به تایید عاطفی',
      'پیش‌بینی سازگاری دوطرفه بر اساس رویکرد درمان هیجان‌مدار (EFT)',
    ],
  },
  {
    id: 'gottman',
    title: '۳. الگوهای حل تعارض و رابطه پایدار (گاتمن)',
    subtitle: 'چگونگی مواجهه با اختلاف‌نظرها و گفتگوی سازنده',
    description:
      'بر اساس دهه‌ها پژوهش بالینی دکتر جان گاتمن: ارزیابی حضور «چهار سوارکار ویرانگر رابطه» (انتقاد تند، سرزنش و تحقیر، جبهه‌گیری تدافعی، و سکوت و دیوارکشی).',
    details: [
      'توانایی عذرخواهی و ترمیم رابطه پس از بروز دلخوری',
      'میزان احترام به دیدگاه‌های طرف مقابل در مسائل چالش‌برانگیز',
      'ایجاد معنا و آرمان‌های مشترک در زندگی زناشویی',
    ],
  },
  {
    id: 'schwartz',
    title: '۴. نیمرخ ارزش‌ها و اولویت‌های زندگی (شوارتز)',
    subtitle: 'سازگاری در جهان‌بینی، معنویت و سبک زندگی',
    description:
      'ارزیابی ده انگیزه بنیادین انسانی شامل: استقلال فردی، امنیت و ثبات خانواده، پیشرفت و موفقیت، سنت‌گرایی و باورهای اخلاقی-مذهبی، و نیک‌خواهی.',
    details: [
      'هم‌پوشانی در چشم‌انداز اقتصادی و نگرش به پس‌انداز یا رفاه',
      'هماهنگی در تعاملات با خانواده‌های پدری و حفظ حریم خصوصی',
      'سازگاری در تصمیم‌گیری‌های کلان و تربیت فرزندان آینده',
    ],
  },
  {
    id: 'criteria',
    title: '۵. خطوط قرمز و شرایط غیرقابل مذاکره (Hard Criteria)',
    subtitle: 'فیلتر اولیه برای پیشگیری از ناهماهنگی‌های بنیادین',
    description:
      'غربالگری هوشمند و بدون اغماض در خصوص معیارهای ضروری: بازه سنی مجاز، تمایل به فرزندآوری، پذیرش ازدواج قبلی یا فرزند، اهداف مهاجرت، و شهر محل سکونت.',
    details: [
      'عدم معرفی پرونده‌هایی که در خطوط قرمز حیاتی با یکدیگر تضاد دارند',
      'شفافیت کامل از همان ابتدا بدون اتلاف وقت و انرژی عاطفی مراجعین',
      'بررسی دقیق پرونده توسط روان‌شناس پیش از هرگونه اعلام به طرفین',
    ],
  },
];

const FAQS = [
  {
    q: 'شماره تلفن و هویت من چگونه محافظت می‌شود؟',
    a: 'در سامانه پیوند امن، هیچ نام خانوادگی، شماره تماس یا اطلاعات مکانی در اختیار متقاضیان دیگر قرار نمی‌گیرد. تمام معرفی‌ها با یک کد پرونده محرمانه و خلاصه مشخصات کیفی انجام می‌شود. تبادل اطلاعات تماس فقط و فقط پس از رضایت صریح و کتبی دوطرفه و تایید مشاور کلینیک صورت می‌پذیرد.',
  },
  {
    q: 'تفاوت پیوند امن با کانال‌ها و سایت‌های همسریابی سنتی چیست؟',
    a: 'پیوند امن یک مرکز تخصصی مشاوره روان‌شناختی دارای پروانه رسمی است. در اینجا هیچ کاتالوگ عمومی یا جستجوی آزاد عکس وجود ندارد. تمامی پرونده‌ها از فیلتر ۴ آزمون استاندارد روان‌سنجی و مصاحبه بالینی عبور کرده و همسان‌گزینی با نظارت مستقیم روان‌شناس انجام می‌شود.',
  },
  {
    q: 'جلسات معارفه چگونه و در کجا برگزار می‌شود؟',
    a: 'پس از تایید تطابق و اعلام تمایل دوطرفه، جلسه نخست معارفه در محیط امن و رسمی کلینیک روانشناسی پیوند امن در تهران با حضور سرکار خانم مهناز خوینی (مشاور و زوج‌درمانگر) برگزار می‌شود تا گفتگوی اولیه در بستری حرفه‌ای و توام با آرامش شکل بگیرد.',
  },
  {
    q: 'مدارک و صحت‌سنجی اطلاعات مراجعین چگونه است؟',
    a: 'پیش از ورود به مرحله معرفی، مدارک هویتی، وضعیت تاهل و سوابق تحصیلی مراجعین به صورت محرمانه توسط کارشناس پذیرش تطبیق داده می‌شود تا اطمینان ۱۰۰ درصدی برای هر دو خانواده فراهم گردد.',
  },
  {
    q: 'اگر در حین فرآیند مایل به انصراف باشم، چه اتفاقی می‌افتد؟',
    a: 'مراجع در هر مرحله از ارزیابی یا معرفی حق دارد وضعیت پرونده خود را به حالت «تعلیق» یا «بایگانی دائم» درآورد. اطلاعات شما به هیچ عنوان بدون اجازه در سیستم فعال باقی نخواهد ماند.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenOtpModal,
  onOpenContactModal,
  onNavigateTab,
}) => {
  const [activeDimension, setActiveDimension] = useState<string>('neo');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Quick interactive readiness assessment
  const [surveyStep, setSurveyStep] = useState<number>(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});
  const [surveyCompleted, setSurveyCompleted] = useState<boolean>(false);

  const selectedDim = ASSESSMENT_DIMENSIONS.find((d) => d.id === activeDimension) || ASSESSMENT_DIMENSIONS[0];

  const handleSurveyOption = (key: string, value: string) => {
    const nextAnswers = { ...surveyAnswers, [key]: value };
    setSurveyAnswers(nextAnswers);
    if (surveyStep < 2) {
      setSurveyStep(surveyStep + 1);
    } else {
      setSurveyCompleted(true);
    }
  };

  const resetSurvey = () => {
    setSurveyStep(0);
    setSurveyAnswers({});
    setSurveyCompleted(false);
  };

  return (
    <div className="w-full bg-[#fcfaf6] text-slate-900 font-sans selection:bg-teal-800 selection:text-white pb-16">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#e7decb] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Clinical Kicker */}
          <div className="text-center mb-4">
            <span className="text-xs sm:text-sm font-semibold text-teal-800 tracking-wide">
              مرکز تخصصی ارزیابی روان‌شناختی پیش از ازدواج و همسان‌گزینی کنترل‌شده
            </span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 text-center leading-tight sm:leading-tight mb-5 max-w-4xl mx-auto [text-wrap:balance]">
            انتخاب آگاهانه شریک زندگی، با تکیه بر سنجش ۵ بعدی روان‌شناختی و رازداری کامل
          </h1>

          {/* Value Proposition Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 text-center max-w-3xl mx-auto leading-relaxed mb-8">
            تشکیل پرونده محرمانه، ارزیابی چندبعدی شخصیت و سبک دلبستگی، و معرفی متقابل افراد سازگار تحت نظارت مستقیم{' '}
            <strong className="text-teal-900 font-bold">سرکار خانم مهناز خوینی</strong> (کارشناس ارشد روان‌شناسی بالینی و زوج‌درمانگر — پروانه تخصصی سازمان نظام روان‌شناسی: ۱۴۱۴۰۸۳).
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              type="button"
              onClick={onOpenOtpModal}
              className="px-6 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer min-h-[48px]"
            >
              <span>تشکیل پرونده و شروع سنجش علمی</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            <button
              type="button"
              onClick={onOpenOtpModal}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer min-h-[48px]"
            >
              <Building2 className="w-4 h-4 text-sky-700" />
              <span>پرتال کارشناس و مدیریت</span>
            </button>

            {onOpenContactModal && (
              <button
                type="button"
                onClick={onOpenContactModal}
                className="px-5 py-3.5 rounded-xl bg-[#f2ecdf] hover:bg-[#e8e0d0] text-teal-950 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-teal-800" />
                <span>مشاوره تلفنی: ۰۲۱-۴۴۶۰۰۹۸۰</span>
              </button>
            )}
          </div>

          {/* 4 Quiet Trust Markers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right max-w-4xl mx-auto pt-6 border-t border-[#e7decb]">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">پروانه تخصصی رسمی</span>
                <span className="text-[11px] text-slate-500 block">نظام روان‌شناسی (۱۴۱۴۰۸۳)</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <LockKeyhole className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">رازداری مطلق داده‌ها</span>
                <span className="text-[11px] text-slate-500 block">عدم افشای شماره و هویت</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">سنجش ۵ بعدی استاندارد</span>
                <span className="text-[11px] text-slate-500 block">شخصیت، دلبستگی، گاتمن</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">جلسه معارفه حضوری</span>
                <span className="text-[11px] text-slate-500 block">در کلینیک تهران با مشاور</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual Asset */}
        <div className="max-w-5xl mx-auto mt-10 rounded-2xl overflow-hidden border border-[#e2d8c3] shadow-md bg-white">
          <img
            src="/src/assets/images/peyvand_clinic_hero_1791022218334.jpg"
            alt="فضای آرام و محرمانه اتاق مشاوره و همسان‌گزینی کلینیک پیوند امن"
            className="w-full h-64 sm:h-96 object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="p-3 sm:p-4 bg-[#f8f5ee] border-t border-[#e7decb] flex items-center justify-between text-xs text-slate-600">
            <span>فضای اختصاصی و محرمانه کلینیک پیوند امن جهت برگزاری جلسات معارفه و مشاوره پیش از ازدواج</span>
            <span className="font-semibold text-teal-900">تهران، منطقه ۲</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 4-STAGE PROTECTED PATHWAY                                         */}
      {/* ========================================================================= */}
      <section id="journey-section" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e7decb]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block mb-1">
              مسیر امن تشکیل پرونده تا ازدواج
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              فرآیند ۴ مرحله‌ای؛ شفاف، علمی و با حفظ کرامت انسانی
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              هر پرونده در ۴ گام مستقل و با تایید بالینی پیش می‌رود تا از هرگونه اتلاف زمان یا آسیب عاطفی پیشگیری شود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e4d9c4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200 mb-3">
                  ۰۱
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">ثبت‌نام و سنجش ۵ بعدی</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تکمیل پرسشنامه‌های روان‌سنجی شخصیت (نئو)، سبک‌های دلبستگی، ارزش‌ها و مشخص کردن خطوط قرمز ازدواج در سامانه.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-teal-800 font-medium">
                ذخیره امن و بدون دسترسی عموم
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e4d9c4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200 mb-3">
                  ۰۲
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">مصاحبه بالینی تشخیصی</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  بررسی سوابق، اعتبارسنجی مدارک هویتی، و مصاحبه حضوری یا برخط با سرکار خانم خوینی جهت تکمیل پرونده روانشناختی.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-teal-800 font-medium">
                تایید بالینی آمادگی برای ازدواج
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e4d9c4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200 mb-3">
                  ۰۳
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">همسان‌گزینی و تطبیق هوشمند</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  محاسبه تطابق چندبعدی با پرونده‌های همگن، حذف ناهمخوانی‌های بنیادین، و تایید نهایی زوج پیشنهادی توسط مشاور.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-teal-800 font-medium">
                انطباق بر اساس اصول روان‌شناسی
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#e4d9c4] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200 mb-3">
                  ۰۴
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">معرفی محافظت‌شده و معارفه</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ارسال نمایه بدون شماره به طرفین، ثبت رضایت متقابل، و هماهنگی جلسه معارفه حضوری در کلینیک تهران با حضور مشاور.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-teal-800 font-medium">
                حضور در محیط امن کلینیک
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE 5D SCIENTIFIC ASSESSMENT FRAMEWORK                        */}
      {/* ========================================================================= */}
      <section id="scientific-framework" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f7f3ea] border-b border-[#e7decb]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block mb-1">
              روش‌شناسی و ابزارهای روان‌سنجی
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ۵ لایه سنجش علمی؛ فراتر از ظواهر و سلیقه‌های سطحی
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              بر خلاف رویکردهای سنتی یا شبکه‌های اجتماعی، ارزیابی ما بر اساس پرسشنامه‌های معتبر جهانی با نرم استاندارد ایرانی انجام می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Dimension Selection Buttons */}
            <div className="lg:col-span-5 space-y-2">
              {ASSESSMENT_DIMENSIONS.map((dim) => {
                const isActive = dim.id === activeDimension;
                return (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => setActiveDimension(dim.id)}
                    className={`w-full text-right p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                        : 'bg-white text-slate-800 border-[#e4d9c4] hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">{dim.title}</div>
                    <div className={`text-xs ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                      {dim.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dimension Card Details */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#e4d9c4] shadow-xs">
              <div className="text-xs font-bold text-teal-800 mb-2">توضیحات و کاربرد بالینی</div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
                {selectedDim.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {selectedDim.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">نکات مورد ارزیابی در این بعد:</span>
                {selectedDim.details.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">طراحی و تطبیق نرم‌افزاری تحت نظارت کارشناس ارشد</span>
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  انجام این آزمون
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CONFIDENTIALITY & PRIVACY CHARTER                                     */}
      {/* ========================================================================= */}
      <section id="confidentiality-charter" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e7decb]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e2d6bf] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                  <LockKeyhole className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    سوگندنامه و منشور اخلاقی رازداری پیوند امن
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    اصول بنیادین حفظ امانت و امنیت اطلاعات مراجعین محترم
                  </p>
                </div>
              </div>
              <div className="text-xs font-bold text-teal-900 bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200 self-start md:self-auto">
                مطابق استانداردهای نظام روان‌شناسی
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۱. عدم انتشار عمومی مشخصات</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هیچ فهرست، گالری یا نمایه قابل جستجو برای عموم وجود ندارد. پرونده‌ها صرفاً در بستر سامانه بسته کلینیک نگهداری می‌شوند.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۲. حفاظت از شماره تماس و نام</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  شماره تماس شما تا پایان فرآیند معرفی به طرف مقابل داده نمی‌شود و تنها در صورت رضایت مکتوب دوطرفه مبادله می‌گردد.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۳. تفکیک یادداشت‌های بالینی</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تحلیل‌های روانشناختی و یادداشت‌های ارزیابی کارشناس به صورت محرمانه بوده و در دسترس طرف مقابل قرار نمی‌گیرد.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۴. نظارت روان‌شناس مسئول</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  مسئولیت اخلاقی و حرفه‌ای کلیه مراحل معرفی مستقیماً بر عهده سرکار خانم مهناز خوینی (عضو نظام روانشناسی) است.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۵. رضایت‌نامه رسمی با مهر زمانی</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ثبت رضایت‌نامه‌ها با ثبت آی‌پی، زمان دقیق و تایید هویت انجام می‌پذیرد تا از حقوق قانونی هر دو طرف صیانت گردد.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>۶. حق انصراف و تعلیق در هر زمان</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هر مراجع می‌تواند هر زمان که بخواهد، با یک کلیک وضعیت پرونده خود را تعلیق یا به طور کامل بایگانی فرماید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE PREMARITAL READINESS QUICK-CHECK                           */}
      {/* ========================================================================= */}
      <section id="quick-assessment" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f0e4] border-b border-[#e7decb]">
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-9 rounded-3xl border border-[#e4d9c4] shadow-sm text-right">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-teal-800 tracking-wide uppercase block mb-1">
              پیش‌نمایش آنلاین آزمون‌ها
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              خودارزیابی سریع آمادگی ازدواج (۳ پرسش نمونه)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              نمونه‌ای از دقت شاخص‌های تشخیصی آزمون‌های ۵ بعدی سامانه پیوند امن
            </p>
          </div>

          {!surveyCompleted ? (
            <div>
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>پرسش {surveyStep + 1} از ۳</span>
                <span className="font-mono font-bold text-teal-800">{Math.round(((surveyStep + 1) / 3) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-teal-800 transition-all duration-300"
                  style={{ width: `${((surveyStep + 1) / 3) * 100}%` }}
                />
              </div>

              {surveyStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    هنگامی که در رابطه اختلاف‌نظر جدی پیش می‌آید، واکنش غالب شما چیست؟
                  </h3>
                  <div className="space-y-2">
                    {[
                      { val: 'TALK', text: 'گفتگوی آرام در زمان مناسب برای پیدا کردن راه‌حل مشترک (دلبستگی ایمن)' },
                      { val: 'ANXIOUS', text: 'نگرانی شدید از کمرنگ شدن احساس طرف مقابل و نیاز فوری به صحبت (دلبستگی مضطرب)' },
                      { val: 'AVOID', text: 'ترجیح می‌دهم سکوت کنم و تا چند روز فاصله بگیرم تا موضوع فراموش شود (دلبستگی اجتنابی)' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleSurveyOption('conflictStyle', opt.val)}
                        className="w-full text-right p-3.5 rounded-xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-colors text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {surveyStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    در خصوص مرزبندی با خانواده پدری و مدیریت زندگی مشترک چه نگرشی دارید؟
                  </h3>
                  <div className="space-y-2">
                    {[
                      { val: 'INDEPENDENT', text: 'استقلال کامل تصمیم‌گیری همسران همراه با احترام متقابل به خانواده‌ها' },
                      { val: 'CLOSE', text: 'مشورت و تعامل روزمره با والدین در اغلب تصمیمات مهم زندگی' },
                      { val: 'MODERATE', text: 'مرزبندی بر اساس توافق و شرایط پیش‌آمده با اولویت آرامش رابطه' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleSurveyOption('familyStyle', opt.val)}
                        className="w-full text-right p-3.5 rounded-xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-colors text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {surveyStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    اولویت اصلی شما در مدیریت اقتصادی و مالی زندگی مشترک کدام است؟
                  </h3>
                  <div className="space-y-2">
                    {[
                      { val: 'SECURITY', text: 'امنیت و پس‌انداز منظم برای آینده و تامین ثبات مالی' },
                      { val: 'EXPERIENCE', text: 'سرمایه‌گذاری روی کیفیت فعلی زندگی، تفریحات و رشد فردی' },
                      { val: 'PARTNERSHIP', text: 'هم‌فکری کامل و شفافیت ریال به ریال در تمامی درآمدها و هزینه‌ها' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleSurveyOption('financeStyle', opt.val)}
                        className="w-full text-right p-3.5 rounded-xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-colors text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                پاسخ‌های شما نشان‌دهنده بینش و آمادگی برای سنجش ۵ بعدی است
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                آزمون جامع شامل ۶۰ سوال نئو، ۳۶ سوال دلبستگی ECR و مقیاس‌های گاتمن است که پروفایل دقیق همسانی شما را رسم می‌کند.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  تشکیل پرونده و شروع آزمون‌های کامل
                </button>
                <button
                  type="button"
                  onClick={resetSurvey}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  پاسخ مجدد
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ABOUT CLINICAL SUPERVISOR & CLINIC                                    */}
      {/* ========================================================================= */}
      <section id="supervisor-info" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e7decb]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Portrait / Clinical Scene */}
            <div className="md:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-[#e2d6bf] shadow-md bg-white">
                <img
                  src="/src/assets/images/consultant_session_1791022229582.jpg"
                  alt="سرکار خانم مهناز خوینی، کارشناس ارشد روانشناسی بالینی و زوج‌درمانگر"
                  className="w-full h-80 object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 bg-[#f8f5ee] border-t border-[#e7decb]">
                  <span className="font-extrabold text-sm text-slate-900 block">سرکار خانم مهناز خوینی</span>
                  <span className="text-xs text-teal-900 block">کارشناس ارشد روان‌شناسی بالینی و زوج‌درمانگر</span>
                  <span className="text-[11px] text-slate-500 block mt-1">شماره پروانه تخصصی سازمان نظام روان‌شناسی: ۱۴۱۴۰۸۳</span>
                </div>
              </div>
            </div>

            {/* Biography & Credentials */}
            <div className="md:col-span-7 space-y-4">
              <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                سرپرست علمی و مسئول پرونده‌ها
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                رویکرد علمی، تجربه بالینی و تعهد اخلاقی در امر مقدس ازدواج
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                سرکار خانم مهناز خوینی با بیش از یک دهه سابقه بالینی در حوزه زوج‌درمانی هیجان‌مدار (EFT)، مشاوره تخصصی پیش از ازدواج و ارزیابی‌های روان‌سنجی، سامانه پیوند امن را با هدف گذار از همسریابی‌های سطحی به همسان‌گزینی دقیق علمی پایه‌گذاری نموده‌اند.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>عضو رسمی سازمان نظام روان‌شناسی و مشاوره جمهوری اسلامی ایران</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>دوره تخصصی زوج‌درمانی هیجان‌مدار (EFT) و کار با تعارضات زناشویی</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>نظارت مستقیم و مصاحبه تشخیصی با تک‌تک متقاضیان پیش از هرگونه معرفی</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  رزرو نوبت مشاوره و تشکیل پرونده
                </button>
                {onOpenContactModal && (
                  <button
                    type="button"
                    onClick={onOpenContactModal}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    نشانی کلینیک و اطلاعات تماس
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                                      */}
      {/* ========================================================================= */}
      <section id="faq-section" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e7decb]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase block mb-1">
              پاسخ به دغدغه‌ها
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              پرسش‌های متداول مراجعین درباره رازداری و فرآیند
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-[#e4d9c4] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-teal-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-800 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL ACTION BANNER                                                    */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fcfaf6] to-[#f5eee0]">
        <div className="max-w-4xl mx-auto bg-teal-900 text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-teal-800/80 rounded-2xl mb-1 border border-teal-700/60">
              <ShieldCheck className="w-8 h-8 text-teal-200" />
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              آغاز مسیر یک ازدواج آرام، پایدار و آگاهانه
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl mx-auto leading-relaxed">
              پرونده شما با نهایت رازداری و دقت علمی تشکیل خواهد شد. همین امروز با تکمیل پرسشنامه‌های روان‌شناختی، گام اول را بردارید.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenOtpModal}
                className="px-7 py-3 rounded-xl bg-white hover:bg-teal-50 text-teal-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                ورود و تشکیل پرونده محرمانه
              </button>
              {onOpenContactModal && (
                <button
                  type="button"
                  onClick={onOpenContactModal}
                  className="px-5 py-3 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white font-bold text-sm border border-teal-700 transition-colors cursor-pointer"
                >
                  تماس مستقیم: ۰۲۱-۴۴۶۰۰۹۸۰
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. QUIET PROFESSIONAL FOOTER                                             */}
      {/* ========================================================================= */}
      <footer className="mt-8 border-t border-[#e7decb] pt-10 pb-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <span className="font-extrabold text-sm text-slate-800 block mb-1">
              سامانه تخصصی مشاوره و همسان‌گزینی پیوند امن
            </span>
            <span>مرکز ارزیابی ۵ بعدی روان‌شناختی پیش از ازدواج • تحت نظارت سرکار خانم مهناز خوینی</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={onOpenOtpModal}
              className="text-teal-800 hover:underline cursor-pointer"
            >
              تشکیل پرونده
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={onOpenOtpModal}
              className="text-slate-700 hover:text-teal-800 cursor-pointer"
            >
              پرتال کارشناسان
            </button>
            <span className="text-slate-300">·</span>
            <a href="tel:02144600980" className="text-slate-700 hover:text-teal-800">
              تلفن: ۰۲۱۴۴۶۰۰۹۸۰
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>تمامی حقوق مادی و معنوی متعلق به مرکز مشاوره روانشناسی پیوند امن می‌باشد.</span>
          <span>شماره پروانه تخصصی سازمان نظام روانشناسی و مشاوره ایران: ۱۴۱۴۰۸۳</span>
        </div>
      </footer>
    </div>
  );
};
