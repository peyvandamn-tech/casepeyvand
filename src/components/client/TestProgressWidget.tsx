/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Brain, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Flame,
  Award
} from 'lucide-react';
import { TestAssignment, TestResult, TestCatalog } from '../../types';

interface TestProgressWidgetProps {
  testAssignments: TestAssignment[];
  testResults: TestResult[];
  testCatalog?: TestCatalog[];
  onOpenTestEngine: (testId: string) => void;
}

const TEST_NAME_MAP: Record<string, string> = {
  'test-neo': 'پنج عامل بزرگ شخصیت (NEO)',
  'test-ecr': 'سبک‌های دلبستگی بزرگسالان (ECR)',
  'test-pam': 'آمادگی روان‌شناختی ازدواج (PAM)',
  'test-fms': 'ترس از صمیمیت و ازدواج (FMS)',
  'test-las': 'سبک‌های عشق‌ورزی و تعهد (LAS)',
};

export const TestProgressWidget: React.FC<TestProgressWidgetProps> = ({
  testAssignments,
  testResults,
  testCatalog = [],
  onOpenTestEngine,
}) => {
  const totalAssigned = testAssignments.length || 4;
  const completedCount = testAssignments.filter((t) => t.status === 'COMPLETED').length;
  const pendingAssignments = testAssignments.filter((t) => t.status !== 'COMPLETED');
  const pendingCount = pendingAssignments.length;
  const percentage = Math.min(100, Math.round((completedCount / totalAssigned) * 100));

  const isAllDone = completedCount >= totalAssigned && totalAssigned > 0;
  const nextTest = pendingAssignments[0] || testAssignments[0];

  const getTestTitle = (testId?: string) => {
    if (!testId) return 'آزمون روان‌شناسی';
    const entry = testCatalog.find((t) => t.id === testId);
    return entry?.name || TEST_NAME_MAP[testId] || testId;
  };

  const nextTestTitle = getTestTitle(nextTest?.testId);

  return (
    <div className="bg-gradient-to-r from-teal-900 to-[#125452] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-800 text-right relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 -left-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left / Info Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-800/80 border border-teal-700 flex items-center justify-center text-teal-200">
              <Brain className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-200">وضعیت سنجش روان‌سنجی</span>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>تکمیل آزمون‌ها:</span>
                <span className="font-mono text-emerald-400 font-extrabold">{completedCount}</span>
                <span className="text-teal-300 font-normal">از</span>
                <span className="font-mono text-teal-100 font-extrabold">{totalAssigned}</span>
                <span className="text-xs text-teal-200 font-medium">آزمون استاندارد</span>
              </h3>
            </div>
          </div>

          <p className="text-xs text-teal-100/90 leading-relaxed max-w-xl">
            {isAllDone ? (
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                تمامی آزمون‌های ۵ بعدی شما با موفقیت تکمیل شد! پرونده شما در اولویت بالای مصاحبه و همسان‌گزینی قرار دارد.
              </span>
            ) : (
              <span>
                تکمیل هر آزمون، ضریب دقت الگوریتم همسان‌گزینی را تا <strong className="text-amber-300 font-bold">۲۵٪ افزایش</strong> می‌دهد. آزمون در انتظار: <strong className="text-white font-bold">{nextTestTitle}</strong>.
              </span>
            )}
          </p>

          {/* Progress Bar with Persian tabulations */}
          <div className="pt-1 max-w-md">
            <div className="flex justify-between items-center text-[11px] text-teal-200 mb-1">
              <span>پیشرفت کل سنجش روان‌شناسی:</span>
              <span className="font-mono font-bold text-emerald-300">{percentage}٪</span>
            </div>
            <div className="w-full bg-teal-950/70 h-2 rounded-full overflow-hidden border border-teal-800/60">
              <div 
                className="h-full bg-gradient-to-l from-emerald-400 to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right / Action Section */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-2 shrink-0">
          {!isAllDone && nextTest ? (
            <button
              type="button"
              onClick={() => onOpenTestEngine(nextTest.testId)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer min-h-[42px]"
            >
              <Flame className="w-4 h-4 text-amber-950" />
              <span>پاسخ به آزمون بعدی ({nextTestTitle.split('(')[0].trim()})</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenTestEngine(testAssignments[0]?.testId || 'test-neo')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-teal-100 font-bold text-xs border border-teal-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
            >
              <Award className="w-4 h-4 text-teal-300" />
              <span>مشاهده و بازبینی کارنامه آزمون‌ها</span>
            </button>
          )}

          {!isAllDone && (
            <span className="text-[11px] text-teal-300/80 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>تنها {pendingCount} آزمون تا تکمیل پرونده باقی مانده است</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
