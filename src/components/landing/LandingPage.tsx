import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import {
  Brain,
  Users,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Award,
  Shield,
  HelpCircle,
  MapPin,
  PhoneCall,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Send,
  Clock,
  Sparkles,
  Heart,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Activity,
  UserCheck,
  LockKeyhole,
  Zap,
  HeartHandshake,
  ArrowDown,
  Filter,
} from 'lucide-react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';
import { CounterCard } from '../common/CounterCard';
import { CompatibilityCompass } from './CompatibilityCompass';
import { InteractiveRadarSection } from './InteractiveRadarSection';
import { PinnedJourneySection } from './PinnedJourneySection';
import { ComparisonSection } from './ComparisonSection';
import { SuccessStories } from './SuccessStories';

interface LandingPageProps {
  onOpenOtpModal: () => void;
  onOpenContactModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenConsentModal?: () => void;
  onOpenPaymentModal?: () => void;
  onStartTest?: (testId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenOtpModal,
  onOpenContactModal,
  onNavigateTab,
  onOpenConsentModal,
  onOpenPaymentModal,
  onStartTest,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<'ALL' | 'PRIVACY' | 'SCIENTIFIC' | 'PROCESS' | 'PAYMENT'>('ALL');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Callback quick form
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useGsapContext(
    () => {
      // Hero Elements Staggered Reveal
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
      })
        .from(
          '.hero-heading',
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          '.hero-paragraph',
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
          },
          '-=0.4'
        )
        .from(
          '.hero-trust-card',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta',
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.6,
          },
          '-=0.3'
        )
        .from(
          '.hero-radar-card',
          {
            opacity: 0,
            x: 40,
            duration: 0.9,
            ease: 'power3.out',
          },
          '-=0.6'
        );
    },
    { scope: heroRef }
  );

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone) return;
    setCallbackSubmitted(true);
    setTimeout(() => {
      setCallbackSubmitted(false);
      setCallbackPhone('');
      setCallbackName('');
    }, 6000);
  };

  const allFaqs = [
    {
      category: 'PRIVACY',
      q: 'آیا تصویر چهره، شماره تماس یا نام خانوادگی من در سایت برای دیگران قابل مشاهده است؟',
      a: 'خیر، به هیچ عنوان. اصل بنیادین سامانه پیوند امن بر «حفظ ۱۰۰٪ محرمانگی و کرامت انسانی» استوار است. هیچ کاربری به عکس، نام خانوادگی، نشانی یا شماره تماس شما دسترسی ندارد. تبادل مشخصات و چهره تنها پس از احراز تطابق بالای روان‌شناختی، تأیید کتبی سرکار خانم خوینی و اعلام رضایت صریح دوطرفه، در جلسه مصاحبه رسمی کلینیک صورت می‌پذیرد.',
    },
    {
      category: 'SCIENTIFIC',
      q: 'سنجش و همسان‌گزینی بر اساس چه آزمون‌هایی انجام می‌شود؟',
      a: 'فرآیند ارزیابی شامل ۵ بعد استاندارد بالینی است: ۱) آزمون ۵ عاملی شخصیت نئو (NEO-PI-R)، ۲) سبک‌های دلبستگی عاطفی هازان و شیور، ۳) الگوی تعامل و حل تعارض گاتمن، ۴) نظام ارزش‌ها و سبک زندگی شوارتز و ۵) بررسی معیارهای اساسی و خطوط قرمز اخلاقی. پس از استخراج کارنامه تحلیلی، نتیجه شخصاً توسط مشاور ارشد بررسی و تحلیل می‌شود.',
    },
    {
      category: 'PROCESS',
      q: 'جلسات مشاوره و آشنایی به چه صورت برگزار می‌شوند؟',
      a: 'جلسات ارزیابی و آشنایی به سه صورت متناسب با شرایط مراجعین ارائه می‌گردد: ۱) جلسات حضوری در مطب (تهران، منطقه ۲)، ۲) جلسات آنلاین تصویری امن در بستر اختصاصی سامانه، ۳) جلسات مشاوره تلفنی. همچنین جلسات معرفی با حضور و راهنمایی تخصصی مشاور و هماهنگی کامل خانواده‌ها برگزار می‌شود.',
    },
    {
      category: 'PAYMENT',
      q: 'تعرفه تشکیل پرونده و پرداخت به چه صورت است؟',
      a: 'هزینه ارزیابی روان‌سنجی و تشکیل پرونده از طریق درگاه رسمی و امن شاپرک واریز می‌شود و فاکتور رسمی به همراه شناسه پیگیری صادر می‌گردد. پرونده پس از واریز بلافاصله در اولویت بررسی و تماس روانشناس قرار می‌گیرد.',
    },
    {
      category: 'PRIVACY',
      q: 'اگر در جلسه آشنایی با شخص معرفی‌شده به توافق نرسیم، چه می‌شود؟',
      a: 'عدم توافق در مراحل اولیه یک امر کاملاً طبیعی و بخش ضروری فرآیند انتخاب آگاهانه است. دلایل عدم توافق با مشاور بررسی شده و پرونده شما بدون نیاز به پرداخت مجدد، در نوبت معرفی گزینه‌های همسان بعدی فعال باقی خواهد ماند.',
    },
    {
      category: 'SCIENTIFIC',
      q: 'آیا مراجعین خارج از تهران یا خارج از کشور نیز امکان تشکیل پرونده دارند؟',
      a: 'بله. با توجه به سامانه آنلاین آزمون‌ها و امکان برگزاری جلسات تصویری تخصصی با خانم مهناز خوینی، هم‌وطنان عزیز از سراسر کشور و همچنین ایرانیان خارج از کشور می‌توانند با خیالی آسوده تشکیل پرونده دهند.',
    },
  ];

  const filteredFaqs = allFaqs.filter(
    (f) => faqFilter === 'ALL' || f.category === faqFilter
  );

  return (
    <div className="w-full bg-[#faf8f5] text-slate-900 pb-20 relative selection:bg-teal-700 selection:text-white">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 via-teal-800 to-amber-600 origin-right z-50 shadow-xs"
        style={{ scaleX }}
      />

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 pt-6 sm:pt-10">
        {/* =========================================================================
            1. HERO SECTION: Clinical Authority + Psychological Marriage Matching
            ========================================================================= */}
        <section ref={heroRef} className="relative">
          {/* Ambient light blooms */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-20 left-10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Main Hero Copy (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900 text-teal-100 text-xs font-black shadow-xs border border-teal-700/60">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  سامانه رسمی پیوند امن • peyvandamn.ir
                </span>
                <span className="hero-badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-950 text-xs font-bold border border-amber-300/80">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  تحت نظارت مهناز خوینی (کارشناس ارشد روانشناسی)
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="hero-heading text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-950 tracking-tight leading-[1.3]">
                  انتخاب همسر با سنجش علمی{' '}
                  <span className="bg-gradient-to-l from-teal-800 via-teal-700 to-teal-900 bg-clip-text text-transparent underline decoration-teal-300 decoration-wavy decoration-2">
                    شخصیت، دلبستگی و ارزش‌ها
                  </span>
                </h1>
                <p className="hero-paragraph text-base sm:text-lg text-slate-700 leading-[1.8] font-normal max-w-2xl">
                  پایان سردرگمی و آزمون‌وخطا در ازدواج. تلفیق ۵ آزمون معتبر روان‌سنجی، بررسی خطوط قرمز اخلاقی و جلسات مصاحبه بالینی زیر نظر کارشناس ارشد مشاوره خانواده با حفظ ۱۰۰٪ محرمانگی.
                </p>
              </div>

              {/* 3 Key Trust Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="hero-trust-card p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
                    <Brain className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>آزمون ۵ بعدی نئو</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">سنجش ثبات هیجان، وجدان و سازگاری</p>
                </div>

                <div className="hero-trust-card p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                    <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>سبک‌های دلبستگی</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">شناسایی تله‌های عاطفی و صمیمیت</p>
                </div>

                <div className="hero-trust-card p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                    <LockKeyhole className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>۱۰۰٪ محرمانه</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">عدم نمایش عکس و شماره در سایت</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hero-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-base shadow-lg shadow-teal-950/20 hover:shadow-xl transition-all duration-200 group cursor-pointer min-h-[48px]"
                >
                  <span>تشکیل پرونده و شروع ارزیابی</span>
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('compass-section')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-sm border-2 border-teal-200/90 transition-all cursor-pointer shadow-xs min-h-[48px]"
                >
                  <Compass className="w-4 h-4 text-teal-700" />
                  <span>تست سریع همسانی (۳ سوال)</span>
                </button>

                {onOpenContactModal && (
                  <button
                    type="button"
                    onClick={onOpenContactModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-slate-700 hover:text-teal-900 hover:bg-slate-200/60 font-semibold text-xs transition-colors cursor-pointer min-h-[48px]"
                    title="اطلاعات تماس و نشانی کلینیک"
                  >
                    <Phone className="w-4 h-4 text-teal-700" />
                    <span>تماس با کلینیک</span>
                  </button>
                )}
              </div>

              {/* Trust Footnote */}
              <div className="pt-3 border-t border-slate-200/90 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>پروانه تخصصی نظام روان‌شناسی ایران</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>جلسات حضوری در تهران و جلسات آنلاین</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>معرفی کنترل‌شده با نظارت مشاور</span>
                </div>
              </div>
            </div>

            {/* Visual Radar / Compatibility Showcase (5 cols) */}
            <div className="lg:col-span-5">
              <div className="hero-radar-card relative rounded-3xl bg-gradient-to-b from-slate-900 via-teal-950 to-slate-950 p-6 sm:p-7 text-white shadow-2xl border border-teal-500/30 overflow-hidden">
                <div className="absolute top-0 left-0 w-44 h-44 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Showcase Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>رادار انطباق ۵ بعدی</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </h3>
                      <p className="text-[11px] text-teal-200/80">نمونه کارنامه تحلیلی پرونده‌های همسان</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-xl border border-teal-500/30">
                    تطابق: ۹۶.۴٪
                  </span>
                </div>

                {/* Dimensions Progress */}
                <div className="py-6 space-y-3.5 relative z-10 text-xs">
                  {/* NEO Big 5 */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-teal-400" />
                        همسانی شخصیت ۵ عاملی (NEO)
                      </span>
                      <span className="font-mono text-teal-300 font-bold">۹۵٪ (بسیار بالا)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-400 to-teal-200 rounded-full w-[95%]" />
                    </div>
                  </div>

                  {/* Attachment Security */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        امنیت سبک دلبستگی عاطفی
                      </span>
                      <span className="font-mono text-rose-300 font-bold">۹۲٪ (سبک ایمن)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-400 to-pink-300 rounded-full w-[92%]" />
                    </div>
                  </div>

                  {/* Gottman Conflict */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        مدیریت تعارض و گفتگو (گاتمن)
                      </span>
                      <span className="font-mono text-amber-300 font-bold">۹۷٪ (سازنده)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-200 rounded-full w-[97%]" />
                    </div>
                  </div>

                  {/* Schwartz Values */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        نظام ارزش‌ها و سبک زندگی (شوارتز)
                      </span>
                      <span className="font-mono text-sky-300 font-bold">۹۴٪ (هم‌راستا)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-300 rounded-full w-[94%]" />
                    </div>
                  </div>

                  {/* Criteria Pass */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        معیارهای اساسی و خطوط قرمز
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">۱۰۰٪ تایید شده</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full w-[100%]" />
                    </div>
                  </div>
                </div>

                {/* Director Quote Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-teal-200 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      دیدگاه بالینی سرکار خانم خوینی:
                    </span>
                    <span className="text-slate-400 text-[10px]">تأیید نهایی جهت معارفه</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-light">
                    «پرونده دارای همخوانی عالی در وجدان‌گرایی و امنیت عاطفی است. تفاوت‌های جزئی با آموزش مهارت‌های ارتباطی، به پویایی و تکامل رابطه خواهد انجامید.»
                  </p>
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 relative z-10">
                  <button
                    type="button"
                    onClick={onOpenOtpModal}
                    className="w-full py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <span>درخواست سنجش و تحلیل پرونده شما</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. CLINICAL TRUST & CREDENTIALS STATS BAR (GSAP Animated Counters)
            ========================================================================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <CounterCard
            numericValue={1200}
            prefix="+"
            label="پرونده ارزیابی‌شده"
            description="سنجش ۵ بعدی و مصاحبه بالینی"
            icon={<Users className="w-4 h-4" />}
          />
          <CounterCard
            numericValue={98.4}
            suffix="٪"
            decimals={1}
            label="نرخ رضایت از همسانی"
            description="پایداری رابطه و رضایت زناشویی"
            icon={<Heart className="w-4 h-4" />}
          />
          <CounterCard
            numericValue={5}
            suffix=" ابزار"
            label="سنجش علمی استاندارد"
            description="NEO، دلبستگی، گاتمن، شوارتز"
            icon={<Brain className="w-4 h-4" />}
          />
          <CounterCard
            numericValue={100}
            suffix="٪"
            label="تضمین ۱۰۰٪ محرمانگی"
            description="عدم انتشار عکس و شماره تلفن"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </section>

        {/* =========================================================================
            3. INTERACTIVE RADAR & 5-DIMENSIONAL FRAMEWORK
            ========================================================================= */}
        <InteractiveRadarSection onStartRegistration={onOpenOtpModal} />

        {/* =========================================================================
            4. PINNED STORYTELLING 5-STAGE JOURNEY
            ========================================================================= */}
        <div id="journey-section">
          <PinnedJourneySection onStartRegistration={onOpenOtpModal} />
        </div>

        {/* =========================================================================
            5. INTERACTIVE COMPASS / MATCH SIMULATOR
            ========================================================================= */}
        <section id="compass-section" className="scroll-mt-24 space-y-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-extrabold border border-teal-200">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              شبیه‌ساز آنلاین همسانی
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              قطب‌نمای تشخیصی: سبک ارتباطی شما چیست؟
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              با پاسخ به ۳ پرسش کلیدی پیرامون سبک دلبستگی، مدیریت تعارض و ارزش‌ها، تیپ ارتباطی و نوع همسان مناسب خود را مشاهده کنید.
            </p>
          </div>

          <CompatibilityCompass onStartRegistration={onOpenOtpModal} />
        </section>

        {/* =========================================================================
            6. CLINICAL METHODOLOGY VS TRADITIONAL DATING COMPARISON
            ========================================================================= */}
        <ComparisonSection />

        {/* =========================================================================
            7. SUCCESS STORIES & VERIFIED CASES
            ========================================================================= */}
        <SuccessStories />

        {/* =========================================================================
            8. CLINICAL DIRECTOR PROFILE & SPOTLIGHT (MAHNAZ KHOEINI)
            ========================================================================= */}
        <section id="director" className="scroll-mt-24 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Main Info */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                <Award className="w-4 h-4 text-teal-400" />
                مدیریت بالینی و مسئولیت علمی پرونده‌ها • peyvandamn.ir
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-snug">
                  سرکار خانم مهناز خوینی
                </h2>
                <p className="text-xs sm:text-sm text-teal-300 font-semibold">
                  کارشناس ارشد روانشناسی بالینی و مشاوره خانواده • زوج‌درمانگر و مسئول فنی کلینیک پیوند امن
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
                درمانگر و مشاور باسابقه در حوزه زوج‌درمانی، ارزیابی‌های پیش از ازدواج، درمان تخصصی خیانت زناشویی و بازسازی پیوند عاطفی. رویکرد درمانی ایشان بر مبنای زوج‌درمانی هیجان‌مدار (EFT)، درمان شناختی-رفتاری (CBT)، مدل تعاملی گاتمن و نظام خانواده استوار است. تمامی فرآیندهای غربالگری، تحلیل تست‌های ۵ بعدی روان‌سنجی و تأیید نهایی موارد معرفی مستقیماً تحت نظارت ایشان در سامانه‌های پیوند امن و zoojdarman.ir انجام می‌گیرد.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>عضو رسمی سازمان نظام روان‌شناسی ایران (شماره پروانه تخصصی: ۱۴۱۴۰۸۳)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>بیش از ۱۵ سال سابقه بالینی در زوج‌درمانی، خیانت و مشاوره ازدواج</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>برگزاری جلسات حضوری در مطب تهران (منطقه ۲) و جلسات آنلاین سراسری</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>تحلیل تخصصی کارنامه ۵ بعدی، دلبستگی و هدایت جلسات معارفه</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm transition-all shadow-md cursor-pointer min-h-[44px]"
                >
                  <span>تشکیل پرونده و رزرو جلسه مشاوره</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {onOpenContactModal && (
                  <button
                    type="button"
                    onClick={onOpenContactModal}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 cursor-pointer min-h-[44px]"
                  >
                    <Phone className="w-4 h-4 text-teal-300" />
                    <span>راه‌های ارتباط با کلینیک</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Clinic Summary Card */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-4 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-400/40 mx-auto flex items-center justify-center text-teal-300">
                <Award className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-base text-white">کلینیک روانشناسی پیوند امن</h3>
                <p className="text-xs text-teal-200">مرکز تخصصی مشاوره و ازدواج آگاهانه</p>
              </div>

              <div className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-white/10 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">تلفن ثابت کلینیک:</span>
                  <a href="tel:02144600980" className="font-mono font-bold text-teal-300 hover:underline">۰۲۱-۴۴۶۰۰۹۸۰</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">همراه و واتساپ:</span>
                  <a href="tel:09199087264" className="font-mono font-bold text-teal-300 hover:underline">۰۹۱۹۹۰۸۷۲۶۴</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">نشانی مطب:</span>
                  <span className="text-white">تهران، منطقه ۲ (دسترسی مناسب)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed italic pt-1">
                «هدف ما همراهی شما در انتخابی آگاهانه، آرامش‌بخش و پایدار است.»
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. COMPLETE CLINIC CONTACT & CALLBACK REQUEST HUB
            ========================================================================= */}
        <section id="contact" className="scroll-mt-24 bg-gradient-to-br from-white via-teal-50/40 to-amber-50/20 rounded-3xl p-8 sm:p-12 border border-teal-100 shadow-sm space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black border border-teal-200">
              <Phone className="w-3.5 h-3.5 text-teal-700" />
              ارتباط مستقیم با مرکز
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              راه‌های ارتباطی و نشانی مطب
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              مشاوران و کادر درمان کلینیک در روزهای کاری از ساعت ۹ الی ۲۱ آماده پاسخگویی به سوالات شما در خصوص فرآیند تشکیل پرونده، زوج‌درمانی و تعیین وقت مشاوره هستند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Phone Contact */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">تماس تلفنی مستقیم</h3>
                <p className="text-xs text-slate-500">پاسخگویی سریع مشاوران کلینیک</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <a
                  href="tel:02144600980"
                  className="block py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-900 hover:text-teal-900 font-mono font-black text-sm border border-slate-200 transition"
                >
                  ۰۲۱-۴۴۶۰۰۹۸۰
                </a>
                <a
                  href="tel:09199087264"
                  className="block py-2 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-900 hover:text-teal-900 font-mono font-black text-sm border border-slate-200 transition"
                >
                  ۰۹۱۹۹۰۸۷۲۶۴
                </a>
              </div>
            </div>

            {/* Card 2: In-Person Address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">مراجعه حضوری</h3>
                <p className="text-xs text-slate-500">جلسات مصاحبه، زوج‌درمانی و معارفه</p>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-800">تهران، منطقه ۲</p>
                <p className="text-slate-500 text-[11px] pt-1">پذیرش حضوری با هماهنگی و تعیین وقت قبلی</p>
                <p className="text-teal-800 font-bold text-[11px] pt-2">شنبه تا پنجشنبه: ۹:۰۰ الی ۲۱:۰۰</p>
              </div>
            </div>

            {/* Card 3: Online Consultation */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">مشاوره آنلاین و سراسری</h3>
                <p className="text-xs text-slate-500">برای سراسر کشور و خارج از ایران</p>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 space-y-2">
                <p className="text-slate-600">برگزاری جلسات تصویری در محیطی کاملاً امن و اختصاصی</p>
                <button
                  type="button"
                  onClick={onOpenOtpModal}
                  className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-200 transition cursor-pointer min-h-[44px]"
                >
                  تشکیل پرونده آنلاین
                </button>
              </div>
            </div>
          </div>

          {/* Quick Callback Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-right w-full md:w-auto">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                درخواست تماس سریع کارشناس کلینیک با شما
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                شماره خود را وارد کنید تا مشاور کلینیک در کوتاه‌ترین زمان جهت راهنمایی با شما تماس بگیرد.
              </p>
            </div>

            {callbackSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>درخواست شما ثبت گردید. کارشناس کلینیک به زودی با شما تماس خواهد گرفت.</span>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                <input
                  type="text"
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  placeholder="نام شما (اختیاری)"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-36 min-h-[44px]"
                />
                <input
                  type="tel"
                  required
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="شماره تماس (مثلاً ۰۹۱۲۳۴۵۶۷۸۹)"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-52 dir-ltr text-right min-h-[44px]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs transition shadow-xs w-full sm:w-auto cursor-pointer min-h-[44px]"
                >
                  ثبت درخواست
                </button>
              </form>
            )}
          </div>
        </section>

        {/* =========================================================================
            10. FREQUENTLY ASKED QUESTIONS (FAQ)
            ========================================================================= */}
        <section id="faq" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              پاسخ به سوالات شما
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              پرسش‌های متداول مراجعین
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              شفافیت در ارائه خدمات و پاسخ دقیق به سوالات شما پیرامون حریم خصوصی، آزمون‌ها و روال جلسات
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { key: 'ALL', label: 'همه سوالات' },
              { key: 'PRIVACY', label: 'حریم خصوصی و عکس' },
              { key: 'SCIENTIFIC', label: 'آزمون‌ها و سنجش' },
              { key: 'PROCESS', label: 'جلسات و روال معارفه' },
              { key: 'PAYMENT', label: 'تعرفه‌ها و پرداخت' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFaqFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                  faqFilter === tab.key
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-right font-extrabold text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors min-h-[48px]"
                  >
                    <span className="leading-snug">{faq.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-[1.8] border-t border-slate-100 bg-slate-50/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            11. FINAL HIGH-CONVERTING CTA BANNER
            ========================================================================= */}
        <section className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-700/50 text-teal-200 text-xs font-bold border border-teal-500/40">
              <Sparkles className="w-4 h-4 text-teal-300" />
              همراهی امن و متخصصانه در مهم‌ترین تصمیم زندگی
            </div>

            <h2 className="text-2xl sm:text-4xl font-black leading-snug">
              آغاز تشکیل پرونده و سنجش هوشمند همسانی
            </h2>

            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-light">
              با تکمیل مشخصات و پاسخ به پرسشنامه‌های بالینی، گزارش جامع شخصیت و پرونده‌های منطبق با اولویت‌های خود را زیر نظر سرکار خانم مهناز خوینی دریافت کنید.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenOtpModal}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-teal-950 hover:bg-teal-50 font-black text-sm shadow-lg transition-all transform hover:scale-105 cursor-pointer min-h-[48px]"
              >
                تشکیل فوری پرونده و ورود
              </button>

              {onOpenContactModal && (
                <button
                  type="button"
                  onClick={onOpenContactModal}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-teal-900/60 hover:bg-teal-900 text-white font-bold text-xs border border-teal-400/40 transition cursor-pointer min-h-[48px]"
                >
                  مشاوره و راهنمایی تلفنی
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            12. FOOTER
            ========================================================================= */}
        <footer className="pt-12 border-t border-slate-200 text-slate-600 text-xs space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 p-1.5 flex items-center justify-center">
                  <img src="/logo-mark.png" alt="پیوند امن" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">سامانه تخصصی ازدواج پیوند امن</h4>
                  <p className="text-[11px] text-slate-500 font-mono">peyvandamn.ir</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                مرکز ارزیابی روان‌شناختی پیش از ازدواج، سنجش ۵ بعدی شخصیت و دلبستگی، و معرفی همسان تحت نظارت مستقیم سرکار خانم مهناز خوینی (کارشناس ارشد روانشناسی بالینی و زوج‌درمانگر، عضو سازمان نظام روان‌شناسی ایران شماره پروانه تخصصی ۱۴۱۴۰۸۳ • وب‌سایت همکار: zoojdarman.ir).
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 text-xs">دسترسی سریع</h5>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li>
                  <button type="button" onClick={() => scrollToSection('scientific-framework')} className="hover:text-teal-800 cursor-pointer">
                    آزمون‌های ۵ بعدی روان‌سنجی
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('compass-section')} className="hover:text-teal-800 cursor-pointer">
                    شبیه‌ساز آنلاین همسانی
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('journey-section')} className="hover:text-teal-800 cursor-pointer">
                    مسیر ۵ مرحله‌ای پرونده تا معارفه
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('director')} className="hover:text-teal-800 cursor-pointer">
                    رزومه و بیوگرافی خانم خوینی
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-slate-900 text-xs">اطلاعات کلینیک</h5>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div>تلفن: <a href="tel:02144600980" className="font-mono font-bold text-slate-700 hover:text-teal-800">۰۲۱-۴۴۶۰۰۹۸۰</a></div>
                <div>همراه: <a href="tel:09199087264" className="font-mono font-bold text-slate-700 hover:text-teal-800">۰۹۱۹۹۰۸۷۲۶۴</a></div>
                <div>نشانی: <span className="text-slate-700">تهران، منطقه ۲</span></div>
                <div>ساعات: <span className="text-slate-700">شنبه تا پنجشنبه ۹ الی ۲۱</span></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© تمامی حقوق مادی و معنوی متعلق به سامانه پیوند امن (peyvandamn.ir) است.</p>
            <p>طراحی شده با رعایت استانداردهای علمی و پروتکل‌های محرمانگی نظام روانشناسی ایران</p>
          </div>
        </footer>
      </div>

      {/* Floating Scroll-To-Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 p-3.5 rounded-2xl bg-teal-800 text-white shadow-xl hover:bg-teal-900 transition-all cursor-pointer flex items-center justify-center group min-h-[48px] min-w-[48px]"
          title="بازگشت به بالای صفحه"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </div>
  );
};
