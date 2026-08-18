/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TestCatalog, Question, TestAssignment } from '../../types';
import { MOCK_QUESTIONS } from '../../data/mockData';
import { StorageService } from '../../services/storage';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Save, AlertCircle } from 'lucide-react';

interface TestEngineProps {
  testId?: string;
  caseId?: string;
  testCatalog?: TestCatalog | TestCatalog[];
  assignment?: TestAssignment;
  questions?: Question[];
  onCompleteTest?: (testId: string, answers: Record<string, number>) => void;
  onCompleted?: () => void;
  onBack: () => void;
}

export const TestEngine: React.FC<TestEngineProps> = ({
  testId = 'test-neo',
  caseId,
  testCatalog,
  assignment,
  questions: propQuestions,
  onCompleteTest,
  onCompleted,
  onBack,
}) => {
  // Resolve test item from testCatalog prop, or fetch if not provided.
  const [fetchedCatalog, setFetchedCatalog] = useState<TestCatalog[]>([]);
  useEffect(() => {
    if (testCatalog) return;
    StorageService.getTestCatalog().then(setFetchedCatalog);
  }, [testCatalog]);

  let activeCatalogItem: TestCatalog | undefined;
  if (Array.isArray(testCatalog)) {
    activeCatalogItem = testCatalog.find((t) => t.id === testId) || testCatalog[0];
  } else if (testCatalog && typeof testCatalog === 'object') {
    activeCatalogItem = testCatalog;
  } else {
    activeCatalogItem = fetchedCatalog.find((t) => t.id === testId) || fetchedCatalog[0];
  }

  const activeTestId = activeCatalogItem?.id || testId || 'test-neo';
  const questions: Question[] = propQuestions || StorageService.getQuestionsForTest(activeTestId) || MOCK_QUESTIONS[activeTestId] || [];

  // Resolve active assignment if not explicitly passed.
  const [fetchedAssignment, setFetchedAssignment] = useState<TestAssignment | undefined>(undefined);
  useEffect(() => {
    if (assignment || !caseId) return;
    StorageService.getTestAssignmentsByCaseId(caseId).then((caseAssignments) => {
      setFetchedAssignment(caseAssignments.find((ta) => ta && ta.testId === activeTestId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, caseId, activeTestId]);

  const activeAssignment = assignment || fetchedAssignment;

  const [answers, setAnswers] = useState<Record<string, number>>(() => activeAssignment?.autosavedAnswers || {});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastAutosaved, setLastAutosaved] = useState<string | null>(null);

  const currentQ = questions[currentIndex];

  // Sync answers if activeAssignment changes or becomes available
  useEffect(() => {
    if (activeAssignment?.autosavedAnswers) {
      setAnswers(activeAssignment.autosavedAnswers);
    }
  }, [activeAssignment?.id]);

  // Autosave periodically
  useEffect(() => {
    if (Object.keys(answers).length > 0 && activeAssignment?.id) {
      StorageService.saveTestAnswers(activeAssignment.id, answers, false)
        .then(() => setLastAutosaved(new Date().toLocaleTimeString('fa-IR')))
        .catch((err) => console.error('Autosave failed:', err));
    }
  }, [answers, activeAssignment?.id]);

  const handleSelectOption = (value: number) => {
    if (!currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    // Auto advance if not last question
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 250);
    }
  };

  const handleFinish = () => {
    // Check if all questions answered
    const unanswered = questions.filter((q) => answers[q.id] === undefined || answers[q.id] === null);
    if (unanswered.length > 0) {
      if (!confirm(`تعداد ${unanswered.length} سؤال بدون پاسخ باقی مانده است. آیا مایل به ثبت نهایی آزمون هستید؟`)) {
        return;
      }
    }

    // Save final answers as completed
    if (activeAssignment?.id) {
      StorageService.saveTestAnswers(activeAssignment.id, answers, true).catch((err) =>
        console.error('Failed to save final test answers:', err)
      );
    }

    // Scoring + persisting the TestResult is the caller's job via
    // onCompleteTest (see App.tsx's handleCompleteTest) — doing it here too
    // used to duplicate that same write on every submission.
    if (onCompleteTest) {
      onCompleteTest(activeTestId, answers);
    }
    if (onCompleted) {
      onCompleted();
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-3xl mx-auto">
      {/* Test Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center space-x-1 space-x-reverse mb-1"
          >
            <ChevronRight className="w-4 h-4" />
            <span>بازگشت به فهرست آزمون‌ها</span>
          </button>
          <h2 className="text-lg font-bold text-slate-900">{activeCatalogItem?.name || 'آزمون روان‌شناختی'}</h2>
          <p className="text-xs text-slate-500">نسخه {activeCatalogItem?.version || '1.0'} • کد آزمون: {activeCatalogItem?.code || activeTestId}</p>
        </div>

        <div className="text-left dir-ltr">
          {lastAutosaved && (
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100 flex items-center space-x-1">
              <Save className="w-3 h-3 text-teal-600" />
              <span>پاسخ‌ها ذخیره شد: {lastAutosaved}</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>سؤال {questions.length > 0 ? currentIndex + 1 : 0} از {questions.length}</span>
          <span>{answeredCount} پاسخ داده شده ({progressPercent}٪)</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-teal-700 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Dot Navigator — lets you see & jump to unanswered
          questions at a glance instead of discovering them via a confirm
          dialog at the very end. */}
      {questions.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-6 pb-6 border-b border-slate-100">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`سؤال ${idx + 1}${isAnswered ? ' (پاسخ داده شده)' : ' (بدون پاسخ)'}`}
                className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition ${
                  isCurrent
                    ? 'bg-teal-700 text-white ring-2 ring-teal-300 ring-offset-1'
                    : isAnswered
                    ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question Card */}
      {currentQ ? (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 space-y-6">
          <div className="flex items-start space-x-3 space-x-reverse">
            <span className="bg-teal-600 text-white font-mono font-bold text-xs w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
              {currentIndex + 1}
            </span>
            <p className="text-base font-bold text-slate-900 leading-relaxed pt-0.5">
              {currentQ.text}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {(currentQ.options && currentQ.options.length > 0
              ? [...currentQ.options].sort((a, b) => b.value - a.value)
              : [
                  { value: 5, label: 'کاملاً موافقم' },
                  { value: 4, label: 'موافقم' },
                  { value: 3, label: 'نظری ندارم / نسبی' },
                  { value: 2, label: 'مخالفم' },
                  { value: 1, label: 'کاملاً مخالفم' },
                ]
            ).map((opt) => {
              const selected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full p-3.5 rounded-xl text-xs font-bold text-right flex items-center justify-between border transition ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selected ? 'border-white bg-white' : 'border-slate-300'
                    }`}
                  >
                    {selected && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs">
          سؤالی برای این آزمون یافت نشد.
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 font-semibold text-xs rounded-xl transition flex items-center space-x-1 space-x-reverse"
        >
          <ChevronRight className="w-4 h-4" />
          <span>سؤال قبلی</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-5 py-2 bg-teal-700 text-white hover:bg-teal-800 font-semibold text-xs rounded-xl transition flex items-center space-x-1 space-x-reverse"
          >
            <span>سؤال بعدی</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 space-x-reverse"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ثبت نهایی و تکمیل آزمون</span>
          </button>
        )}
      </div>
    </div>
  );
};
