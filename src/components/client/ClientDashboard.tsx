/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Case, Profile, TestAssignment, TestResult, ExpertNote, Introduction, MatchCandidate, TestCatalog } from '../../types';
import { 
  CheckCircle2, 
  UserCheck2, 
  Brain, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  AlertCircle,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';

interface ClientDashboardProps {
  currentUser: User;
  activeCase?: Case;
  profile?: Profile;
  testAssignments: TestAssignment[];
  testResults: TestResult[];
  expertNotes: ExpertNote[];
  introductions: Introduction[];
  matchCandidates: MatchCandidate[];
  testCatalog?: TestCatalog[];
  onOpenProfileForm: () => void;
  onOpenTestEngine: (testId: string) => void;
  onOpenConsentModal: () => void;
  onOpenPaymentModal: () => void;
  onNavigateToIntroductions: () => void;
}

// Ordered so a case's current status can be compared against each step —
// "done" if the case has moved past it, "current" if it's sitting there.
const STATUS_ORDER: Case['status'][] = [
  'CONSENT_PENDING', 'PAYMENT_PENDING', 'PROFILE_PENDING', 'TEST_PENDING',
  'TEST_COMPLETED', 'EXPERT_REVIEW', 'INTRODUCED',
];

const STAGE_LABELS: Record<string, string> = {
  CONSENT_PENDING: 'در انتظار پذیرش رضایت‌نامه',
  PAYMENT_PENDING: 'در انتظار پرداخت هزینه',
  PROFILE_PENDING: 'در انتظار تکمیل اطلاعات فردی',
  TEST_PENDING: 'در حال انجام آزمون‌های روان‌شناختی',
  TEST_COMPLETED: 'آزمون‌ها تکمیل شد — در صف بررسی',
  EXPERT_REVIEW: 'در حال بررسی توسط کارشناس',
  INTRODUCED: 'معرفی فعال در جریان است',
  CLOSED: 'پرونده بسته شده است',
};

const DESIRE_LABELS: Record<string, string> = {
  DEFINITE_YES: 'تمایل قطعی (بله)',
  OPEN_TO_DISCUSS: 'قابل گفتگو',
  DEFINITE_NO: 'تمایل ندارد',
};

const TEST_NAME_FALLBACK: Record<string, string> = {
  'test-neo': 'پنج عامل شخصیت (NEO-FFI)',
  'test-ecr': 'دلبستگی روابط نزدیک (ECR-R)',
  'test-pam': 'آمادگی برای ازدواج (PAM)',
  'test-fms': 'ترس از ازدواج (FMS)',
  'test-las': 'سبک‌های عشق‌ورزی (LAS)',
};

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  activeCase,
  profile,
  testAssignments,
  testResults,
  expertNotes,
  introductions,
  matchCandidates,
  testCatalog = [],
  onOpenProfileForm,
  onOpenTestEngine,
  onOpenConsentModal,
  onOpenPaymentModal,
  onNavigateToIntroductions,
}) => {
  const currentIndex = activeCase ? STATUS_ORDER.indexOf(activeCase.status) : -1;
  const isConsentDone = currentIndex >= 1;
  const isPaymentDone = currentIndex >= 2;
  const isProfileDone = !!profile;
  const totalAssigned = testAssignments.length;
  const completedTestsCount = testAssignments.filter((ta) => ta.status === 'COMPLETED').length;
  const isTestsDone = totalAssigned > 0 && completedTestsCount >= totalAssigned;
  const isExpertApproved = activeCase?.status === 'INTRODUCED';

  const shareableNote = expertNotes.find((n) => n.type === 'SHAREABLE') || expertNotes[0];
  const activeIntro = introductions.find((i) => i.status === 'ACTIVE' || i.status === 'A_PENDING' || i.status === 'B_PENDING');
  const activeMatch = activeIntro ? matchCandidates.find((m) => m.id === activeIntro.matchCandidateId) : undefined;
  const isIntroCaseA = activeIntro && activeCase ? activeIntro.caseAId === activeCase.id : true;
  const partnerPreview = activeIntro ? (isIntroCaseA ? activeIntro.anonymousPreviewB : activeIntro.anonymousPreviewA) : undefined;

  const stageLabel = activeCase ? STAGE_LABELS[activeCase.status] || activeCase.status : 'در انتظار تشکیل پرونده';

  const steps = [
    { n: 1, label: 'ثبت پرونده', done: !!activeCase, sub: activeCase ? 'تکمیل شد' : '—' },
    { n: 2, label: 'رضایت‌نامه', done: isConsentDone, sub: isConsentDone ? 'امضا شد' : 'در انتظار' },
    { n: 3, label: 'پرداخت هزینه', done: isPaymentDone, sub: isPaymentDone ? 'تأیید شد' : 'در انتظار' },
    { n: 4, label: 'تکمیل اطلاعات', done: isProfileDone, sub: isProfileDone ? '۱۰۰٪ تکمیل' : 'نیازمند تکمیل' },
    { n: 5, label: 'آزمون‌ها', done: isTestsDone, sub: `${completedTestsCount} از ${totalAssigned || '—'} تکمیل` },
    { n: 6, label: 'تأیید متخصص', done: isExpertApproved, sub: 'خانم خوینی' },
    { n: 7, label: 'معرفی اولیه', done: !!activeIntro, sub: activeIntro ? 'فعال' : 'در انتظار' },
  ];

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      {/* 1. Process Stepper Timeline */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              مسیر پرونده تخصصی شما (کیس: {activeCase?.id || 'در حال تشکیل'})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            مرحله فعلی: <strong className="text-teal-700 font-bold">{stageLabel}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center pt-2">
          {steps.map((step) => {
            const isCurrentStep = !step.done && steps.findIndex((s) => !s.done) === steps.indexOf(step);
            return (
              <div key={step.n} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1 ${
                    step.done
                      ? 'bg-teal-600 text-white'
                      : isCurrentStep
                      ? 'bg-sky-100 text-sky-700 border border-sky-300 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.done ? '✓' : ['۱','۲','۳','۴','۵','۶','۷'][step.n - 1]}
                </div>
                <span className="text-[11px] font-bold text-slate-800">{step.label}</span>
                <span className={`text-[9px] ${step.done ? 'text-teal-600 font-bold' : 'text-slate-400'}`}>{step.sub}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMN 1: Profile & Hard Criteria */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck2 className="w-4 h-4 text-teal-600" />
                شناسنامه فردی و معیارها
              </h3>
              <button
                onClick={onOpenProfileForm}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                <span>ویرایش</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            {profile ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">سن و شهر</span>
                    <strong className="text-slate-800">{profile.age} سال - {profile.city}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">تحصیلات و شغل</span>
                    <strong className="text-slate-800">{profile.education} ({profile.jobTitle})</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">وضعیت تاهل</span>
                    <strong className="text-slate-800">{profile.maritalStatus === 'SINGLE' ? 'مجرد (سابقه ندارد)' : 'دارای سابقه ازدواج'}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">انگیزه فرزندآوری</span>
                    <strong className="text-teal-700 font-bold">
                      {DESIRE_LABELS[profile.desireForChildren] || profile.desireForChildren}
                    </strong>
                  </div>
                </div>

                {/* Hard Criteria Alert Box */}
                <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-red-800 font-bold">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      خط قرمزهای قطعی (Hard Criteria)
                    </span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    {profile.criteria.hardCriteriaNotes || 'موردی ثبت نشده — می‌توانید از طریق ویرایش پروفایل اضافه کنید.'}
                  </p>
                </div>

                {/* Preferred Living Location */}
                <div className="bg-teal-50 border-r-4 border-teal-500 p-3 rounded-lg text-xs space-y-1">
                  <span className="text-[10px] text-teal-800 font-bold uppercase block">محل سکونت ترجیحی</span>
                  <p className="text-[11px] text-teal-900 font-medium">
                    {profile.preferredLivingLocation || 'ثبت نشده'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">اطلاعات فردی و معیارهای همسرخواهی هنوز تکمیل نشده است.</p>
                <button
                  onClick={onOpenProfileForm}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs"
                >
                  تکمیل پرسشنامه فردی
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Test Results & Psychological Profile — rendered from
            the client's actual TestResult rows, never fabricated numbers. */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-teal-600" />
                کارنامه آزمون‌های روان‌شناختی
              </h3>
              <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold border border-teal-200">
                {testResults.length} آزمون تکمیل شده
              </span>
            </div>

            {testResults.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">هنوز نتیجه‌ای برای نمایش وجود ندارد.</p>
                <button
                  onClick={() => onOpenTestEngine(testAssignments[0]?.testId || 'test-neo')}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs"
                >
                  شروع آزمون‌ها
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result) => {
                  const catalogEntry = testCatalog.find((t) => t.id === result.testId);
                  const displayName = catalogEntry?.name || TEST_NAME_FALLBACK[result.testId] || result.testId;
                  const scoreEntries = Object.entries(result.standardScores).slice(0, 3);
                  const barColors = ['bg-teal-500', 'bg-sky-500', 'bg-emerald-500'];
                  return (
                    <div key={result.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">{displayName}</span>
                        <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">ارزیابی شد</span>
                      </div>
                      {scoreEntries.length > 0 && (
                        <div className="space-y-1.5 text-[11px] mb-2">
                          {scoreEntries.map(([subscale, score], idx) => (
                            <div key={subscale}>
                              <div className="flex justify-between text-slate-600 mb-0.5">
                                <span>{subscale}</span>
                                <span className="font-bold text-slate-800">{Math.round(score)}/۱۰۰</span>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${barColors[idx % barColors.length]}`}
                                  style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.interpretation?.summary && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">{result.interpretation.summary}</p>
                      )}
                    </div>
                  );
                })}

                {!isTestsDone && (
                  <button
                    onClick={() => {
                      const nextPending = testAssignments.find((ta) => ta.status !== 'COMPLETED');
                      onOpenTestEngine(nextPending?.testId || 'test-neo');
                    }}
                    className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition"
                  >
                    ادامه آزمون‌های باقی‌مانده
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Expert Review Note & Active Introductions */}
        <div className="space-y-4">
          {/* Expert Note Box */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                نظریه تخصصی خانم مهناز خوینی
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic mb-3">
              "{shareableNote
                ? shareableNote.content
                : activeCase?.status === 'EXPERT_REVIEW'
                ? 'پرونده شما در حال بررسی توسط کارشناس است؛ نظریه تخصصی به‌زودی اینجا نمایش داده می‌شود.'
                : 'پس از تکمیل ارزیابی‌های روان‌شناختی، نظریه تخصصی کارشناس اینجا نمایش داده خواهد شد.'}"
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="font-bold text-sky-400">خانم مهناز خوینی</span>
              <span>مشاور خانواده و ازدواج</span>
            </div>
          </div>

          {/* Active Introductions Card */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                معرفی فعال تحت نظارت
              </h3>
              {activeIntro && (
                <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-200">
                  {activeIntro.status === 'ACTIVE' ? 'در حال گفتگو' : 'در انتظار پاسخ'}
                </span>
              )}
            </div>

            {activeIntro && partnerPreview ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      مورد پیشنهادی: {partnerPreview.firstName} ({partnerPreview.age} ساله)
                    </span>
                    {activeMatch && (
                      <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                        {activeMatch.compatibilityScore}٪ همخوانی اولیه
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    {partnerPreview.shortBio}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {partnerPreview.keyValues.map((kv, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                        {kv}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={onNavigateToIntroductions}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>ورود به گفتگوی کنترل‌شده / بررسی پروفایل</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                در حال حاضر معرفی فعال جدیدی آماده پاسخگویی نیست.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
