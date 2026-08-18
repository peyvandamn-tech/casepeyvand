import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Brain, 
  Users, 
  Heart, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  ChevronLeft, 
  ChevronDown,
  Sparkles, 
  Calendar, 
  FileCheck, 
  Award, 
  UserCheck, 
  ArrowRight,
  Shield,
  HelpCircle,
  MapPin,
  PhoneCall
} from 'lucide-react';

interface LandingPageProps {
  onOpenOtpModal: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenConsentModal?: () => void;
  onOpenPaymentModal?: () => void;
  onStartTest?: (testId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenOtpModal,
  onNavigateTab,
  onOpenConsentModal,
  onOpenPaymentModal,
  onStartTest,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'آیا عکس و اطلاعات هویت من برای سایر کاربران قابل مشاهده است؟',
      a: 'خیر، به هیچ وجه. در پیوند امن تمام پیش‌نمایش‌ها به صورت کاملاً ناشناس (Anonymous Preview) و بدون نمایش عکس یا نام خانوادگی مستقیم انجام می‌شود. اطلاعات کامل تنها پس از ارزیابی روانشناختی و رضایت دوطرفه بررسی می‌گردد.',
    },
    {
      q: 'فرایند انطباق‌سنجی (Matching) چگونه عمل می‌کند؟',
      a: 'سیستم ابتدا خطوط قرمز (Hard Criteria) از جمله تمایل به فرزندآوری، محل سکونت، سابقه ازدواج قبلی و تحصیلات را چک می‌کند. سپس نمرات ۵ آزمون روان‌سنجی (شخصیت NEO، دلبستگی ECR-R، ارزش‌ها و...) وزن‌دهی شده و تنها موارد با درصد همسانی بالا به کارشناس پیشنهاد می‌شوند.',
    },
    {
      q: 'آیا جلسات مشاوره به صورت حضوری برگزار می‌شوند یا آنلاین؟',
      a: 'هر دو امکان فراهم است. مراجعه‌کنندگان محترم می‌توانند پس از تکمیل پرونده و آزمون‌ها، نوبت جلسه ارزیابی با سرکار خانم خوینی را به صورت حضوری یا آنلاین رزرو نمایند.',
    },
    {
      q: 'هزینه تشکیل پرونده و پرداخت درگاه چگونه است؟',
      a: 'پرداخت هزینه‌ها از طریق درگاه رسمی شتاب (زرین‌پال) انجام می‌شود و رسید پرداخت به صورت آنی در پرونده کاربر ثبت می‌گردد.',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 gereh-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold border border-teal-700/60 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-300" />
            سامانه تخصصی ارزیابی و آشنایی آگاهانه ازدواج
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            پیوند امن؛ معرفی‌های تخصصی، محرمانه و مبتنی بر روان‌سنجی علمی
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl font-normal">
            تحت نظارت و ارزیابی <strong className="text-white font-bold">سرکار خانم مهناز خوینی</strong> (کارشناس ارشد مشاوره خانواده). 
            ارزیابی ویژگی‌های شخصیتی، سبک‌های دلبستگی و ارزش‌های فردی با ۵ آزمون استاندارد روان‌شناسی پیش از معرفی.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenOtpModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              شروع و تشکیل پرونده (ورود با پیامک)
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            فرایند تشکیل پرونده
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            مراحل ورود و تشکیل پرونده در پیوند امن
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            از ثبت‌نام اولیه تا معرفی‌های علمی و همسان، گام‌به‌گام با شما همراه هستیم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              step: '۱',
              title: 'ورود با پیامک',
              desc: 'ثبت‌نام سریع با شماره همراه و احراز هویت امن',
              icon: Smartphone,
              action: onOpenOtpModal,
            },
            {
              step: '۲',
              title: 'تکمیل فرم و رضایت‌نامه',
              desc: 'ثبت اطلاعات فردی، ترجیحات و امضای پرونده',
              icon: FileCheck,
              action: onOpenConsentModal || onOpenOtpModal,
            },
            {
              step: '۳',
              title: 'آزمون‌های ۵‌گانه',
              desc: 'سنجش شخصیت NEO، دلبستگی ECR-R و ارزش‌ها',
              icon: Brain,
              action: () => onStartTest ? onStartTest('test-neo') : onOpenOtpModal(),
            },
            {
              step: '۴',
              title: 'رزرو جلسه مشاوره',
              desc: 'پرداخت امن و تنظیم زمان مصاحبه با کارشناس',
              icon: Calendar,
              action: onOpenPaymentModal || onOpenOtpModal,
            },
            {
              step: '۵',
              title: 'معرفی همسان',
              desc: 'تحلیل خطوط قرمز و معرفی‌های ناشناس و دقیق',
              icon: Users,
              action: () => onNavigateTab ? onNavigateTab('client-introductions') : onOpenOtpModal(),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer hover:border-teal-400 active:scale-98"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-300 group-hover:text-teal-600 transition-colors">
                    گام {item.step}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values & Security */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-400 text-xs font-semibold border border-teal-800">
              <Lock className="w-3.5 h-3.5" />
              حفظ حریم خصوصی و استانداردهای تخصصی
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              چرا مرکز پیوند امن متفاوتی را تجربه خواهید کرد؟
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">ارزیابی علمی روانشناختی</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    استفاده از آزمون‌های استاندارد روان‌سنجی جهانی جهت تحلیل دقیق سازگاری زوجین.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">معرفی‌های کاملاً محرمانه (Anonymous Preview)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    هیچ عکس یا اطلاعات هویت مستقیم در دسترس عموم قرار نمی‌گیرد و همه چیز تحت نظارت کارشناس انجام می‌شود.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-100">تحلیل خطوط قرمز و همسانی (Hard & Soft Criteria)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ارزیابی تعارضات بنیادین (مانند فرزندآوری و اهداف ازدواج) پیش از هرگونه آشنایی.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenOtpModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                شروع و تشکیل پرونده جدید
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-950/80 to-slate-800 p-6 sm:p-8 rounded-2xl border border-teal-900/50 space-y-6">
            <div className="flex items-center gap-4 border-b border-teal-900/60 pb-4">
              <div className="w-14 h-14 rounded-full bg-teal-800/50 flex items-center justify-center text-teal-200 border border-teal-600/40 shrink-0">
                <Award className="w-7 h-7 text-teal-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">سرکار خانم مهناز خوینی</h3>
                <p className="text-xs text-teal-300">مدیر و کارشناس ارشد مشاوره خانواده و ازدواج</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              «ازدواج آگاهانه و پایدار مستلزم خودشناسی دقیق و ارزیابی علمی ابعاد شخصیتی، دلبستگی و ارزش‌های طرفین است. در پیوند امن، هدف ما ایجاد فضایی امن و کارشناسی برای آشنایی‌های اصیل و خودآگاهانه است.»
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-teal-400 font-medium">
              <span>مرکز مشاوره پیوند امن</span>
              <span>دارای مجوز رسمی مشاوره ازدواج</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
            <HelpCircle className="w-3.5 h-3.5" />
            پرسش‌های متداول
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            سوالات متداول مراجعه‌کنندگان
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-right font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact & Footer Section */}
      <footer className="border-t border-slate-200 pt-8 pb-12 text-slate-600 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Shield className="w-5 h-5 text-teal-700" />
              سامانه کیس ازدواج پیوند امن
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              مرکز تخصصی ارزیابی روانشناختی، تشکیل پرونده و معرفی‌های کنترل‌شده تحت نظارت سرکار خانم مهناز خوینی.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">راه ارتباطی</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>پشتیبانی: ۰۲۱-۸۸۸۸۹۹۰۰</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>تهران، مرکز تخصصی مشاوره پیوند امن</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">امنیت و نمادها</div>
            <p className="text-slate-500">
              تمامی اطلاعات پرونده‌ها کاملاً رمزشده و محرمانه نگه داشته شده و در اختیار هیچ شخص ثالثی قرار نمی‌گیرد.
            </p>
            <div className="text-[11px] text-teal-700 font-semibold pt-1">
              درگاه رسمی پرداخت زرین‌پال و نماد اعتماد
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/60 pt-4 text-center text-xs text-slate-400">
          © ۱۴۰۵ تمامی حقوق برای سامانه تخصصی پیوند امن محفوظ است.
        </div>
      </footer>
    </div>
  );
};
