import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, ArrowLeft, RotateCcw, HeartHandshake, ShieldCheck, HelpCircle } from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  options: {
    label: string;
    description: string;
    archetype: string;
    weight: number;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'attachment',
    category: 'سبک دلبستگی و امنیت عاطفی',
    question: 'در مواقع بروز استرس یا دغدغه فکری، ترجیح می‌دهید چگونه با شریک زندگی خود ارتباط برقرار کنید؟',
    options: [
      {
        label: 'گفتگوی شفاف و مستقیم در لحظه',
        description: 'نیازمند اطمینان‌بخشی کلامی و شنیده شدن احساسات بدون وقفه.',
        archetype: 'ارتباط‌گر شفاف (امن / ابرازگر)',
        weight: 95,
      },
      {
        label: 'فرصت کوتاه برای خلوت و سپس گفتگو',
        description: 'ابتدا نیاز به بازیابی آرامش فردی دارم تا بتوانم منطقی و آرام صحبت کنم.',
        archetype: 'متأمل و خودتنظیم‌گر (امن / خوداتکا)',
        weight: 90,
      },
      {
        label: 'همراهی عملی و حضور آرام بدون نیاز به کلمات زیاد',
        description: 'صرف حضور فیزیکی آرامش‌بخش و حمایت عملی برایم بالاتر از تحلیل کلامی است.',
        archetype: 'حامی صامت و عمل‌گرا',
        weight: 88,
      },
    ],
  },
  {
    id: 'conflict',
    category: 'مدیریت تفاوت‌ها و تعارضات (الگوی گاتمن)',
    question: 'هنگام بروز اختلاف نظر اساسی در برنامه‌ریزی زندگی یا مسائل مالی، روش ترجیحی شما چیست؟',
    options: [
      {
        label: 'مذاکره منطقی با یادداشت‌برداری و وزن‌دهی به گزینه‌ها',
        description: 'تمرکز بر راه‌حل مشترک بدون پیش‌داوری و خروج از دایره احترام.',
        archetype: 'همکاری‌محور سازنده',
        weight: 96,
      },
      {
        label: 'ارجاع به اصول و ارزش‌های مشترک توافق‌شده قبلی',
        description: 'پایبندی به توافقات بنیادی و تقسیم وظایف بر اساس نقاط قوت طرفین.',
        archetype: 'ساختارمند و پایبند به اصول',
        weight: 92,
      },
      {
        label: 'مشاوره با کارشناس متخصص در صورت گره‌های پیچیده',
        description: 'استفاده از نگاه بی‌طرفانه و ارزیابی تخصصی برای جلوگیری از فرسایش رابطه.',
        archetype: 'بینش‌ورز و کارشناس‌پذیر',
        weight: 98,
      },
    ],
  },
  {
    id: 'values',
    category: 'نظام ارزش‌های بنیادین و سبک زندگی (شوارتز)',
    question: 'کدام اولویت برای شما در ۳ سال اول زندگی مشترک، جایگاه محوری‌تری دارد؟',
    options: [
      {
        label: 'ایجاد ثبات عاطفی عمیق و فرزندآوری آگاهانه',
        description: 'اولویت دادن به آرامش کانون خانواده، پیوندهای پایدار و پرورش نسل.',
        archetype: 'خانواده‌محور و پایدار',
        weight: 94,
      },
      {
        label: 'هم‌افزایی در رشد تحصیلی/شغلی و استقلال اقتصادی',
        description: 'همراهی پایاپای در اهداف بلندمدت و توانمندسازی متقابل.',
        archetype: 'توسعه‌گرا و همگام',
        weight: 91,
      },
      {
        label: 'تعادل هماهنگ میان معنویت، آرامش ذهنی و اوقات باکیفیت',
        description: 'سفرهای دونفره، سلامت روان و تجربه زیست سرشار از رضایت درونی.',
        archetype: 'متوازن و کیفیت‌محور',
        weight: 93,
      },
    ],
  },
];

interface CompatibilityCompassProps {
  onStartRegistration: () => void;
}

export const CompatibilityCompass: React.FC<CompatibilityCompassProps> = ({ onStartRegistration }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleSelectOption = (index: number) => {
    const updated = [...selectedOptions];
    updated[currentStep] = index;
    setSelectedOptions(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCalculated(true);
    }
  };

  const resetCompass = () => {
    setSelectedOptions([]);
    setCurrentStep(0);
    setIsCalculated(false);
  };

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">قطب‌نمای سریع ارزیابی همسانی</h3>
            <p className="text-[11px] text-teal-200/90">شبیه‌ساز ۳ بعدی شاخص‌های دلبستگی، تعارض و ارزش‌ها</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
          {isCalculated ? 'نتیجه شبیه‌سازی' : `پرسش ${currentStep + 1} از ${QUESTIONS.length}`}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {!isCalculated ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Category & Question Title */}
              <div className="space-y-2">
                <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {currentQ.category}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptions[currentStep] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-right p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer text-sm ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'border-slate-300 text-slate-500 bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900">{opt.label}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{opt.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'w-8 bg-teal-600'
                          : i < currentStep
                          ? 'w-4 bg-teal-300'
                          : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    مرحله قبلی
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-teal-50 to-sky-50 p-6 rounded-2xl border border-teal-200/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-teal-800 font-extrabold text-sm sm:text-base">
                    <HeartHandshake className="w-5 h-5 text-teal-700" />
                    نمایه سازگاری تخمینی شما در سامانه پیوند امن
                  </div>
                  <span className="text-xs font-bold bg-teal-700 text-white px-3 py-1 rounded-full shadow-xs">
                    همسانی ارزیابی اولیه: ۹۴٪
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {selectedOptions.map((optIdx, qIdx) => {
                    const q = QUESTIONS[qIdx];
                    const opt = q.options[optIdx || 0];
                    return (
                      <div key={qIdx} className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{q.category}</span>
                        <div className="text-xs font-extrabold text-slate-800">{opt.archetype}</div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed pt-1">
                  طبق الگوریتم روان‌سنجی ۵ بعدی پیوند امن، ساختار روانی شما آمادگی بالایی برای برقراری
                  <strong className="text-teal-900 font-extrabold"> ارتباط ایمن و ساختارمند </strong>
                  دارد. در مرحله بعدی، آزمون‌های ۵۰ و ۲۴۰ سوالی NEO و ارزیابی حضوری سرکار خانم مهناز خوینی، دقیق‌ترین کیس‌های همخوان با ارزش‌های شما را مشخص خواهد کرد.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={onStartRegistration}
                  className="px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm transition-all shadow-lg shadow-teal-900/10 hover:shadow-xl cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  تشکیل پرونده و شرکت در آزمون‌های اصلی
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={resetCompass}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  تکرار شبیه‌سازی
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
