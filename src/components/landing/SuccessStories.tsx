import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, Heart, Quote, Users, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';

interface Story {
  id: string;
  coupleCode: string;
  date: string;
  matchingScore: number;
  durationMonths: number;
  tags: string[];
  quote: string;
  details: string;
  psychologistNote: string;
}

const STORIES: Story[] = [
  {
    id: '1',
    coupleCode: 'پرونده زوج م.خ و س.ر',
    date: 'اردیبهشت ۱۴۰۴',
    matchingScore: 96,
    durationMonths: 4,
    tags: ['همسانی بالای وجدان‌گرایی', 'سبک دلبستگی ایمن', 'توافق در فرزندآوری'],
    quote:
      'بزرگ‌ترین مزیت پیوند امن برای ما این بود که قبل از اولین دیدار، تمام خطوط قرمز و انتظارات مالی و خانوادگی سنجیده شده بود و گفتگوی ما در جلسه حضوری روی اهداف واقعی متمرکز شد.',
    details:
      'هر دو دارای تحصیلات تکمیلی مهندسی با تطابق بالای ارزش‌های شوارتز در بعد پیشرفت و امنیت خانوادگی.',
    psychologistNote:
      'همخوانی در شاخص وظیفه‌شناسی و توافق در خطوط قرمز فرزندآوری، بستر پیوندی پایدار و آرام را رقم زد.',
  },
  {
    id: '2',
    coupleCode: 'پرونده زوج پ.ن و ع.ک',
    date: 'شهریور ۱۴۰۴',
    matchingScore: 92,
    durationMonths: 6,
    tags: ['تطابق گاتمن در حل تعارض', 'سازگاری فرهنگی', 'نظارت تخصصی خانم خوینی'],
    quote:
      'آزمون‌های روان‌سنجی و گزارش تحلیلی خانم خوینی باعث شد نقاط قوت و چالش‌های احتمالی‌مان را بشناسیم و با دید کاملاً باز و بدون ابهام عقد کنیم.',
    details:
      'تطابق کامل در معیارهای دلبستگی و تفاوت کنترل‌شده در برون‌گرایی که منجر به پویایی بهینه رابطه گردیده است.',
    psychologistNote:
      'در جلسات مشاوره، الگوی حل تعارض آموزش داده شد و تفاوت‌های شخصیتی به عامل غنای رابطه تبدیل گردید.',
  },
  {
    id: '3',
    coupleCode: 'پرونده زوج ن.ف و م.ب',
    date: 'آذر ۱۴۰۴',
    matchingScore: 94,
    durationMonths: 3,
    tags: ['ازدواج آگاهانه', 'پیش‌نمایش ناشناس', 'همگامی در سبک زندگی'],
    quote:
      'حفظ محرمانگی برای من که شاغل در موقعیت مدیریتی هستم بسیار حیاتی بود. پیوند امن بدون ایجاد هیچ‌گونه حساسیت، ارتباطی اصیل و باوقار را شکل داد.',
    details:
      'همسانی در نظام ارزشی رشد فردی و استقلال اقتصادی، با نمره بالای توافق‌پذیری در آزمون NEO.',
    psychologistNote:
      'حفظ کامل حریم خصوصی و عدم انتشار تصویر تا زمان رضایت دوطرفه، اعتماد کامل مراجعین را جلب کرد.',
  },
];

export const SuccessStories: React.FC = () => {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStory = STORIES[activeStoryIdx];

  useGsapContext(
    () => {
      gsap.from('.stories-header', {
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
    <section ref={containerRef} className="space-y-8">
      {/* Header */}
      <div className="stories-header text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-black border border-teal-200 shadow-2xs">
          <Heart className="w-3.5 h-3.5 text-rose-600" />
          تجربه‌های زیسته و پیوندهای ثبت‌شده
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          روایت مراجعین از ازدواج آگاهانه و پایدار
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          خلاصه‌ای از پرونده‌های موفقی که با همراهی و ارزیابی کلینیکی مرکز پیوند امن به سرانجام رسیده‌اند.
        </p>
      </div>

      {/* Story Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STORIES.map((story, idx) => {
          const isSelected = idx === activeStoryIdx;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveStoryIdx(idx)}
              className={`p-5 rounded-3xl border text-right transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-white border-teal-700 ring-2 ring-teal-700/20 shadow-md'
                  : 'bg-slate-50/70 border-slate-200/90 hover:border-teal-400 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">{story.coupleCode}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{story.date}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {story.matchingScore}٪ همسانی
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 italic">
                «{story.quote}»
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {story.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Featured Story Detailed View */}
      <div className="bg-gradient-to-br from-white via-teal-50/30 to-amber-50/20 rounded-3xl border border-teal-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black shadow-xs">
              <Quote className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-800">بررسی تحلیلی پرونده</span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {activeStory.coupleCode} (تطابق {activeStory.matchingScore}٪)
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
            <span>مدت زمان از ارزیابی تا عقد: {activeStory.durationMonths} ماه</span>
          </div>
        </div>

        <blockquote className="text-sm sm:text-base text-slate-800 leading-[1.9] font-medium italic">
          «{activeStory.quote}»
        </blockquote>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ویژگی‌های تحلیلی پرونده:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {activeStory.details}
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-700" />
              <span>یادداشت سرکار خانم خوینی:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              {activeStory.psychologistNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
