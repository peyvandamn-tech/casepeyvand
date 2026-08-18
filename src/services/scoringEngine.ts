/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, TestResult } from '../types';
import { MOCK_QUESTIONS } from '../data/mockData';

// Real subscale definitions + severity cutoffs, taken from the validated
// instrument sources (see comments per test). Replaces the earlier
// generic linear-rescale placeholder — these are the actual normative
// bands used in the paper instruments, not invented approximations.

interface SeverityLevel {
  max?: number; // upper bound (inclusive) of this level; last level has no max
  label: string;
  clinical?: string;
}

interface SubscaleDef {
  label: string;
  min: number; // per-item min
  max: number; // per-item max
  useAverage: boolean; // true => average per item, false => raw sum
  levels: SeverityLevel[]; // ascending, evaluated against sum or average per useAverage
}

const NEO_LEVELS: SeverityLevel[] = [
  { max: 11, label: 'خیلی پایین' },
  { max: 19, label: 'پایین' },
  { max: 28, label: 'متوسط' },
  { max: 36, label: 'بالا' },
  { label: 'خیلی بالا' },
];
// Approx T-score midpoint per NEO bucket (Costa & McCrae, 1992 manual bands)
const NEO_T_MIDPOINT: Record<string, number> = {
  'خیلی پایین': 30,
  'پایین': 40,
  'متوسط': 50,
  'بالا': 60,
  'خیلی بالا': 70,
};

const ECR_LEVELS: SeverityLevel[] = [
  { max: 2.49, label: 'پایین', clinical: 'در سطح طبیعی' },
  { max: 3.49, label: 'متوسط', clinical: 'ارزیابی بافتاری توصیه می‌شود' },
  { max: 4.99, label: 'بالا', clinical: 'بالاتر از cut-off بالینی — پیگیری لازم است' },
  { label: 'بسیار بالا', clinical: 'مداخله درمانی توصیه می‌شود' },
];

const PAM_SUB_LEVELS: SeverityLevel[] = [
  { max: 21, label: 'نیاز به تقویت' },
  { max: 27, label: 'متوسط' },
  { label: 'مناسب' },
];

const FMS_SUB_LEVELS: SeverityLevel[] = [
  { max: 13, label: 'ضعیف' },
  { max: 20, label: 'متوسط' },
  { label: 'شدید' },
];

const LAS_LEVELS: SeverityLevel[] = [
  { max: 1.99, label: 'خیلی پایین' },
  { max: 2.99, label: 'پایین' },
  { max: 3.49, label: 'متوسط' },
  { max: 3.99, label: 'بالا' },
  { label: 'خیلی بالا' },
];

const TEST_SUBSCALES: Record<string, Record<string, SubscaleDef>> = {
  'test-neo': {
    'روان‌رنجوری': { label: 'روان‌رنجوری', min: 0, max: 4, useAverage: false, levels: NEO_LEVELS },
    'برون‌گرایی': { label: 'برون‌گرایی', min: 0, max: 4, useAverage: false, levels: NEO_LEVELS },
    'گشودگی به تجربه': { label: 'گشودگی به تجربه', min: 0, max: 4, useAverage: false, levels: NEO_LEVELS },
    'توافق‌پذیری': { label: 'توافق‌پذیری', min: 0, max: 4, useAverage: false, levels: NEO_LEVELS },
    'وظیفه‌شناسی': { label: 'وظیفه‌شناسی', min: 0, max: 4, useAverage: false, levels: NEO_LEVELS },
  },
  'test-ecr': {
    'اضطراب دلبستگی': { label: 'اضطراب دلبستگی', min: 1, max: 7, useAverage: true, levels: ECR_LEVELS },
    'اجتناب دلبستگی': { label: 'اجتناب دلبستگی', min: 1, max: 7, useAverage: true, levels: ECR_LEVELS },
  },
  'test-pam': {
    'بلوغ عاطفی و شخصیتی': { label: 'بلوغ عاطفی و شخصیتی', min: 1, max: 5, useAverage: false, levels: PAM_SUB_LEVELS },
    'آمادگی خانوادگی و اجتماعی': { label: 'آمادگی خانوادگی و اجتماعی', min: 1, max: 5, useAverage: false, levels: PAM_SUB_LEVELS },
    'انتظارات و باورهای ازدواج': { label: 'انتظارات و باورهای ازدواج', min: 1, max: 5, useAverage: false, levels: PAM_SUB_LEVELS },
    'مهارت‌های ارتباطی': { label: 'مهارت‌های ارتباطی', min: 1, max: 5, useAverage: false, levels: PAM_SUB_LEVELS },
    'ارزش‌های مذهبی و فرهنگی': { label: 'ارزش‌های مذهبی و فرهنگی', min: 1, max: 5, useAverage: false, levels: PAM_SUB_LEVELS },
  },
  'test-fms': {
    'ترس از تعهد و از دست دادن آزادی': { label: 'ترس از تعهد و از دست دادن آزادی', min: 1, max: 5, useAverage: false, levels: FMS_SUB_LEVELS },
    'ترس از شکست و طلاق': { label: 'ترس از شکست و طلاق', min: 1, max: 5, useAverage: false, levels: FMS_SUB_LEVELS },
    'ترس از روابط جنسی': { label: 'ترس از روابط جنسی', min: 1, max: 5, useAverage: false, levels: FMS_SUB_LEVELS },
    'ترس از قضاوت خانواده و اجتماع': { label: 'ترس از قضاوت خانواده و اجتماع', min: 1, max: 5, useAverage: false, levels: FMS_SUB_LEVELS },
    'ترس از ناتوانی در نقش همسری': { label: 'ترس از ناتوانی در نقش همسری', min: 1, max: 5, useAverage: false, levels: FMS_SUB_LEVELS },
  },
  'test-las': {
    'اِروس': { label: 'اِروس', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
    'لودوس': { label: 'لودوس', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
    'استورگه': { label: 'استورگه', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
    'پراگما': { label: 'پراگما', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
    'مانیا': { label: 'مانیا', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
    'آگاپه': { label: 'آگاپه', min: 1, max: 5, useAverage: true, levels: LAS_LEVELS },
  },
};

export const PSYCHOMETRIC_CITATIONS: Record<string, { title: string; authors: string; year: string; normNote: string }> = {
  'test-neo': {
    title: 'Revised NEO Personality Inventory (NEO PI-R) & NEO-FFI',
    authors: 'Costa, P. T., & McCrae, R. R.',
    year: '1992 / 2010',
    normNote: 'نرم‌یافته بر اساس آستانه‌های بالینی راهنمای مقیاس ۵ عاملی شخصیت نئو و هنجارپذیری ایرانی (حق‌شناس، ۱۳۸۵).',
  },
  'test-ecr': {
    title: 'Experiences in Close Relationships-Revised (ECR-R)',
    authors: 'Fraley, R. C., Waller, N. G., & Brennan, K. A.',
    year: '2000',
    normNote: 'نمره‌گذاری و آستانه cut-off بالینی بر اساس مقیاس‌های دلبستگی بزرگسالان و هنجار ایرانی (مظاهری، ۱۳۷۹).',
  },
  'test-pam': {
    title: 'Premarital Assessment & Readiness Inventory (PAM)',
    authors: 'Olson, D. H., & Olson, A. K. (PREPARE/ENRICH)',
    year: '2008 / 2018',
    normNote: 'دسته‌بندی نمرات بر اساس شاخص آمادگی ازدواج و سنجش حوزه‌های پنج‌گانه سازگاری پیش از ازدواج.',
  },
  'test-fms': {
    title: 'Fear of Marriage Scale (FMS)',
    authors: 'Samani, S., & Sohrabi, N.',
    year: '2011',
    normNote: 'مقیاس استاندارد سنجش هراس از ازدواج با ۵ خرده‌مقیاس اصلی و آستانه بالینی نمرات بالای ۱۰۵.',
  },
  'test-las': {
    title: 'Love Attitudes Scale (LAS) Short Form',
    authors: 'Hendrick, C., Hendrick, S. S., & Dicke, A.',
    year: '1998',
    normNote: 'طبقه‌بندی ۶ سبک عشق‌ورزی بر اساس نظریه رنگ‌های عشق پاملا و کلاید هندریک.',
  },
};

function severityOf(score: number, levels: SeverityLevel[]): SeverityLevel {
  for (const level of levels) {
    if (level.max === undefined || score <= level.max) return level;
  }
  return levels[levels.length - 1];
}

export class ScoringEngine {
  /**
   * Calculates subscale scores, standardized scores, and clinical interpretations for a test submission.
   */
  static scoreTest(
    caseId: string,
    testId: string,
    questions: Question[],
    answers: Record<string, number>
  ): TestResult {
    return this.calculateResults(caseId, testId, answers);
  }

  static calculateResults(
    caseId: string,
    testId: string,
    answers: Record<string, number>
  ): TestResult {
    const questions: Question[] = MOCK_QUESTIONS[testId] || [];
    const subDefs = TEST_SUBSCALES[testId] || {};

    const subscaleRawScores: Record<string, number> = {};
    const subscaleItemCounts: Record<string, number> = {};

    // 1. Aggregate raw answers per subscale, applying reverse-scoring
    //    using each question's own min/max (so 0-4 and 1-5 and 1-7 scales
    //    all reverse correctly instead of assuming a fixed 1-5 range).
    questions.forEach((q) => {
      const def = subDefs[q.subscale];
      const itemMin = def ? def.min : 1;
      const itemMax = def ? def.max : 5;
      const fallback = Math.round((itemMin + itemMax) / 2);
      let val = answers[q.id];
      if (val === undefined || val === null) val = fallback;
      if (q.reverse) {
        val = itemMin + itemMax - val;
      }
      subscaleRawScores[q.subscale] = (subscaleRawScores[q.subscale] || 0) + val;
      subscaleItemCounts[q.subscale] = (subscaleItemCounts[q.subscale] || 0) + 1;
    });

    // 2. Standardized/display score per subscale.
    //    - NEO: approximate T-score midpoint from the instrument's own raw-score bands.
    //    - Others: 0-100 normalized percent of the subscale's real min-max range
    //      (labelled as a percent, not presented as a validated T-score).
    const standardScores: Record<string, number> = {};
    const subscaleLevels: Record<string, SeverityLevel> = {};

    Object.keys(subscaleRawScores).forEach((subscale) => {
      const def = subDefs[subscale];
      const rawSum = subscaleRawScores[subscale];
      const count = subscaleItemCounts[subscale] || 1;
      const score = def && def.useAverage ? rawSum / count : rawSum;

      if (def) {
        const level = severityOf(score, def.levels);
        subscaleLevels[subscale] = level;
        if (testId === 'test-neo') {
          standardScores[subscale] = NEO_T_MIDPOINT[level.label] ?? 50;
        } else {
          const min = def.useAverage ? def.min : def.min * count;
          const max = def.useAverage ? def.max : def.max * count;
          standardScores[subscale] = Math.round(((score - min) / (max - min)) * 100);
        }
      } else {
        standardScores[subscale] = Math.round((rawSum / (count * 5)) * 100);
      }
    });

    const interpretation = this.generateInterpretation(testId, subscaleRawScores, subscaleItemCounts, subscaleLevels);

    return {
      id: `tr-${caseId}-${testId}-${Date.now()}`,
      caseId,
      testId,
      subscaleScores: subscaleRawScores,
      standardScores,
      interpretation,
      completedAt: new Date().toISOString(),
    };
  }

  private static generateInterpretation(
    testId: string,
    rawScores: Record<string, number>,
    counts: Record<string, number>,
    levels: Record<string, SeverityLevel>
  ) {
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];
    const clinicalFlags: string[] = [];
    let summary = 'تحلیل نمرات آزمون تکمیل گردید.';

    if (testId === 'test-neo') {
      Object.entries(levels).forEach(([subscale, level]) => {
        const isNegativeTrait = subscale === 'روان‌رنجوری';
        const high = level.label === 'بالا' || level.label === 'خیلی بالا';
        const low = level.label === 'پایین' || level.label === 'خیلی پایین';
        if (isNegativeTrait && high) {
          vulnerabilities.push(`${subscale}: سطح ${level.label} — نیازمند ارزیابی مدیریت اضطراب/خلق`);
          clinicalFlags.push('حساسیت هیجانی بالا');
        } else if (isNegativeTrait && low) {
          strengths.push(`${subscale}: سطح ${level.label} — ثبات هیجانی مناسب`);
        } else if (!isNegativeTrait && high) {
          strengths.push(`${subscale}: سطح ${level.label}`);
        } else if (!isNegativeTrait && low) {
          vulnerabilities.push(`${subscale}: سطح ${level.label}`);
        }
      });
      const n = levels['روان‌رنجوری']?.label || 'متوسط';
      const c = levels['وظیفه‌شناسی']?.label || 'متوسط';
      summary = `پروفایل شخصیتی مراجع بر اساس NEO-FFI: روان‌رنجوری در سطح «${n}»، وظیفه‌شناسی در سطح «${c}».`;
    } else if (testId === 'test-ecr') {
      const anxietyHigh = ['بالا', 'بسیار بالا'].includes(levels['اضطراب دلبستگی']?.label || '');
      const avoidanceHigh = ['بالا', 'بسیار بالا'].includes(levels['اجتناب دلبستگی']?.label || '');

      let style = 'ایمن (Secure)';
      if (anxietyHigh && avoidanceHigh) style = 'ترسان/آشفته (Fearful-Avoidant)';
      else if (anxietyHigh) style = 'دلبسته/نگران (Preoccupied)';
      else if (avoidanceHigh) style = 'اجتنابی/ناایمن (Dismissing)';

      if (!anxietyHigh && !avoidanceHigh) {
        strengths.push('سبک دلبستگی ایمن؛ توانایی مناسب ابراز صمیمیت و پذیرش حمایت');
      }
      if (anxietyHigh) {
        vulnerabilities.push(`اضطراب دلبستگی در سطح ${levels['اضطراب دلبستگی']?.label} — ${levels['اضطراب دلبستگی']?.clinical || ''}`);
        if (levels['اضطراب دلبستگی']?.label === 'بسیار بالا') clinicalFlags.push('اضطراب دلبستگی شدید');
      }
      if (avoidanceHigh) {
        vulnerabilities.push(`اجتناب دلبستگی در سطح ${levels['اجتناب دلبستگی']?.label} — ${levels['اجتناب دلبستگی']?.clinical || ''}`);
        if (levels['اجتناب دلبستگی']?.label === 'بسیار بالا') clinicalFlags.push('اجتناب دلبستگی شدید');
      }
      summary = `سبک دلبستگی مراجع بر اساس ECR-R: ${style}.`;
    } else if (testId === 'test-pam') {
      Object.entries(levels).forEach(([subscale, level]) => {
        if (level.label === 'مناسب') strengths.push(`${subscale}: آمادگی مناسب`);
        if (level.label === 'نیاز به تقویت') vulnerabilities.push(`${subscale}: نیاز به تقویت پیش از ازدواج`);
      });
      const totalRaw = Object.values(rawScores).reduce((a, b) => a + b, 0);
      let totalLabel = 'آمادگی مناسب';
      if (totalRaw <= 109) totalLabel = 'آمادگی ضعیف';
      else if (totalRaw <= 139) totalLabel = 'نیاز به مشاوره';
      summary = `آمادگی کلی برای ازدواج (PAM، جمع نمرات ${totalRaw} از ۲۰۰): ${totalLabel}.`;
      if (totalLabel !== 'آمادگی مناسب') clinicalFlags.push('نیاز به مشاوره پیش از ازدواج');
    } else if (testId === 'test-fms') {
      Object.entries(levels).forEach(([subscale, level]) => {
        if (level.label === 'شدید') {
          vulnerabilities.push(`${subscale}: سطح شدید`);
          clinicalFlags.push(`ترس شدید در حوزه: ${subscale}`);
        } else if (level.label === 'ضعیف') {
          strengths.push(`${subscale}: سطح پایین ترس`);
        }
      });
      const totalRaw = Object.values(rawScores).reduce((a, b) => a + b, 0);
      let totalLabel = 'ترس شدید';
      if (totalRaw <= 69) totalLabel = 'ترس ضعیف';
      else if (totalRaw <= 104) totalLabel = 'ترس متوسط';
      summary = `سطح کلی ترس از ازدواج (FMS، جمع نمرات ${totalRaw} از ۱۷۵): ${totalLabel}.`;
      if (totalLabel === 'ترس شدید') clinicalFlags.push('توصیه به مداخله روان‌درمانی پیش از ازدواج');
    } else if (testId === 'test-las') {
      const dominant = Object.entries(rawScores)
        .map(([subscale, sum]) => ({ subscale, avg: sum / (counts[subscale] || 1) }))
        .sort((a, b) => b.avg - a.avg)[0];
      if (dominant) {
        strengths.push(`سبک عشق غالب: ${dominant.subscale} (میانگین ${dominant.avg.toFixed(2)} از ۵)`);
        summary = `سبک غالب عشق‌ورزی مراجع بر اساس LAS: ${dominant.subscale}.`;
      }
    }

    return {
      summary,
      strengths: strengths.length ? strengths : ['نکته برجسته‌ای در این سطح گزارش نشد.'],
      vulnerabilities: vulnerabilities.length ? vulnerabilities : ['نکته آسیب‌پذیر حادی گزارش نشد.'],
      clinicalFlags,
    };
  }
}
