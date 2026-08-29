import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Heart, ShieldAlert, Compass, Sparkles, CheckCircle2, ChevronLeft, Award } from 'lucide-react';

interface Instrument {
  id: string;
  nameFa: string;
  nameEn: string;
  icon: any;
  tag: string;
  description: string;
  keyMetrics: string[];
  clinicalPurpose: string;
  sampleInsight: string;
}

const INSTRUMENTS: Instrument[] = [
  {
    id: 'neo',
    nameFa: 'پرسشنامه ۵ عاملی شخصیت نئو (NEO-PI-R)',
    nameEn: 'Big Five Personality Inventory',
    icon: Brain,
    tag: 'شخصیت و خلق‌وخو',
    description: 'معتبرترین آزمون ارزیابی ۵ بعد اصلی روان‌شناختی شامل ثبات هیجانی، برون‌گرایی، گشودگی به تجربه، توافق‌پذیری و وجدان‌گرایی.',
    keyMetrics: [
      'روان‌رنجورخویی (Neuroticism) و تاب‌آوری در برابر بحران‌ها',
      'توافق‌پذیری (Agreeableness) و میزان همدلی در ارتباط',
      'وجدان‌گرایی (Conscientiousness) و انضباط در اهداف مشترک',
    ],
    clinicalPurpose: 'پیش‌بینی میزان پایداری رفتاری، تطابق انرژی روانی و مدیریت هیجانات منفی در زیر یک سقف.',
    sampleInsight: 'تشابه در وجدان‌گرایی و مکمل بودن در برون‌گرایی، بالاترین نرخ رضایت زناشویی در ۱۰ سال اول را ثبت کرده است.',
  },
  {
    id: 'attachment',
    nameFa: 'آزمون سبک‌های دلبستگی هازان و شیور',
    nameEn: 'Adult Attachment Style Interview',
    icon: Heart,
    tag: 'امنیت عاطفی و صمیمیت',
    description: 'شناسایی الگوی ناخودآگاه ارتباطی در روابط عاشقانه (سبک امن، اضطرابی و اجتنابی) که ریشه در دوران رشد دارد.',
    keyMetrics: [
      'میزان اضطراب از طردشدگی یا رها شدن',
      'میزان اجتناب از صمیمیت عمیق و وابستگی سالم',
      'ظرفیت بازیابی آرامش در آغوش پارتنر',
    ],
    clinicalPurpose: 'جلوگیری از چرخه معیوب «تعقیب‌کننده - فاصله‌گیرنده» در سال‌های آغازین زندگی مشترک.',
    sampleInsight: 'افراد با سبک دلبستگی ایمن، تنش‌های ارتباطی را به فرصت تعمیق صمیمیت تبدیل می‌کنند.',
  },
  {
    id: 'gottman',
    nameFa: 'الگوی تعاملی و حل تعارض گاتمن',
    nameEn: 'Gottman Conflict Dynamics',
    icon: Compass,
    tag: 'مدیریت اختلاف و بحران',
    description: 'سنجش چهار سوار سرنوشت‌ساز رابطه (انتقاد، تحقیر، دفاعی‌بودن، دیوارکشی) و بررسی پادزهرهای رفتاری.',
    keyMetrics: [
      'نسبت تعاملات مثبت به منفی در شرایط اختلاف (حداقل ۵ به ۱)',
      'میزان پذیرش نفوذ و احترام به دیدگاه مقابل',
      'سرعت بازسازی پیوند پس از جروبحث',
    ],
    clinicalPurpose: 'تضمین اینکه تفاوت‌های طبیعی بین دو انسان، منجر به فرسایش روانی و طلاق عاطفی نشود.',
    sampleInsight: 'توانایی ترمیم سریع رابطه پس از اختلاف، بزرگ‌ترین عامل پایداری ازدواج است.',
  },
  {
    id: 'schwartz',
    nameFa: 'ماتریس ارزش‌های بنیادین شوارتز',
    nameEn: 'Schwartz Theory of Basic Values',
    icon: Sparkles,
    tag: 'معنا، اهداف و سبک زندگی',
    description: 'ترسیم ۱۰ جهت‌گیری ارزشی بنیادین انسان شامل سنت‌گرایی، پیشرفت، لذت‌گرایی، خودفراروی و امنیت.',
    keyMetrics: [
      'اولویت‌بندی اقتصاد، رفاه و رشد اجتماعی',
      'دیدگاه پیرامون آزادی فردی در برابر تعهدات خانوادگی',
      'همخوانی در تربیت نسل و نگرش‌های جهان‌شناختی',
    ],
    clinicalPurpose: 'تطبیق چشم‌انداز آینده زندگی دونفره، مدیریت دارایی‌ها و سبک تصمیم‌گیری‌های خانوادگی.',
    sampleInsight: 'هم‌راستایی در ۳ ارزش اول، تعارضات پیرامون هزینه‌کرد و سبک زندگی را تا ۷۰٪ کاهش می‌دهد.',
  },
  {
    id: 'hardmatrix',
    nameFa: 'فیلتر خطوط قرمز و شرایط ضروری (Hard Matrix)',
    nameEn: 'Hard Criteria Matrix',
    icon: ShieldAlert,
    tag: 'فیلتر قطعی پیش از معرفی',
    description: 'بررسی نظام‌مند عدم‌توافق‌های غیرقابل‌مذاکره نظیر تمایل قطعی به فرزندآوری، محل سکونت، مسائل حقوقی و سوابق ازدواج.',
    keyMetrics: [
      'تصمیم قطعی در خصوص داشتن فرزند و بازه زمانی آن',
      'محدودیت‌های جغرافیایی، شغلی و مهاجرتی',
      'چارچوب‌های اعتقادی و خانوادگی مشخص',
    ],
    clinicalPurpose: 'حذف هرگونه اتلاف وقت یا امید کاذب با شفاف‌سازی صادقانه پیش از اولین دیدار.',
    sampleInsight: '۹۵٪ از ازدواج‌های ناموفق در سنتی‌ترین فرم‌ها، ناشی از مسکوت گذاشتن همین خطوط قرمز اولیه بوده است.',
  },
];

export const ScientificFramework: React.FC = () => {
  const [selectedId, setSelectedId] = useState('neo');
  const activeInstrument = INSTRUMENTS.find((i) => i.id === selectedId) || INSTRUMENTS[0];

  return (
    <section className="space-y-8 scroll-mt-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
          <Award className="w-3.5 h-3.5" />
          متدولوژی ۵ ابزاری روان‌سنجی
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          علمی، ساختارمند و مبتنی بر داده
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          در پیوند امن، هیچ معرفی بر پایه تصادف یا ظاهر صرف انجام نمی‌گیرد. هر پرونده از ۵ فیلتر استاندارد بین‌المللی عبور می‌کند:
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {INSTRUMENTS.map((inst) => {
          const isSelected = inst.id === selectedId;
          const Icon = inst.icon;
          return (
            <button
              key={inst.id}
              type="button"
              onClick={() => setSelectedId(inst.id)}
              className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
              <span>{inst.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Active Instrument Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeInstrument.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {activeInstrument.nameEn}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {activeInstrument.nameFa}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {activeInstrument.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-extrabold text-slate-900">شاخص‌های مورد ارزیابی:</div>
              <div className="space-y-2">
                {activeInstrument.keyMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <strong className="text-slate-900 font-bold">کارکرد کلینیکی:</strong>
              <span>{activeInstrument.clinicalPurpose}</span>
            </div>
          </div>

          {/* Sample Insight Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-inner space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                بینش آماری و بالینی
              </div>
              <span className="text-[10px] text-slate-400 font-mono">CONFIDENTIAL</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              «{activeInstrument.sampleInsight}»
            </p>

            <div className="text-[11px] text-teal-200/80 pt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>تحلیل تخصصی با نظارت سرکار خانم مهناز خوینی</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
