/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Brain, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Profile, TestAssignment, TestResult, Appointment, Case } from '../../types';

interface CaseProgressChartProps {
  activeCase?: Case;
  profile?: Profile;
  testAssignments: TestAssignment[];
  testResults: TestResult[];
  appointments?: Appointment[];
  onOpenProfileForm?: () => void;
  onOpenTestEngine?: (testId: string) => void;
  onNavigateToAppointments?: () => void;
}

interface StageMetric {
  id: 'profile' | 'tests' | 'counseling';
  title: string;
  subtitle: string;
  percentage: number;
  completedText: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  items: { label: string; done: boolean }[];
}

export const CaseProgressChart: React.FC<CaseProgressChartProps> = ({
  activeCase,
  profile,
  testAssignments,
  testResults,
  appointments = [],
  onOpenProfileForm,
  onOpenTestEngine,
  onNavigateToAppointments,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<'all' | 'profile' | 'tests' | 'counseling'>('all');

  // 1. Calculate Profile Completion
  let profileFilledFields = 0;
  const totalProfileFields = 9;
  if (profile) {
    if (profile.age > 0) profileFilledFields++;
    if (profile.education) profileFilledFields++;
    if (profile.jobTitle) profileFilledFields++;
    if (profile.city) profileFilledFields++;
    if (profile.maritalStatus) profileFilledFields++;
    if (profile.marriageGoal) profileFilledFields++;
    if (profile.workingHoursPerDay > 0) profileFilledFields++;
    if (profile.criteria?.minAge && profile.criteria?.maxAge) profileFilledFields++;
    if (profile.criteria?.targetCities && profile.criteria.targetCities.length > 0) profileFilledFields++;
  }
  const profilePercentage = Math.min(100, Math.round((profileFilledFields / totalProfileFields) * 100));

  // 2. Calculate Psychological Tests Completion
  const totalAssignedTests = testAssignments.length || 4;
  const completedTestsCount = testAssignments.filter((ta) => ta.status === 'COMPLETED').length;
  const testsPercentage = Math.min(100, Math.round((completedTestsCount / totalAssignedTests) * 100));

  // Find next pending test if any
  const nextPendingTest = testAssignments.find((ta) => ta.status !== 'COMPLETED');

  // 3. Calculate Clinical Counseling / Interview Sessions
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length;
  const bookedAppointments = appointments.filter((a) => a.status === 'BOOKED').length;
  // A standard premarital protocol consists of at least 1 diagnostic session + 1 matching briefing
  const targetSessions = 2;
  let counselingPercentage = 0;
  if (completedAppointments >= targetSessions) {
    counselingPercentage = 100;
  } else if (completedAppointments > 0) {
    counselingPercentage = 60;
  } else if (bookedAppointments > 0) {
    counselingPercentage = 35;
  } else if (activeCase?.status === 'EXPERT_REVIEW' || activeCase?.status === 'INTRODUCED') {
    counselingPercentage = 75;
  } else {
    counselingPercentage = 10;
  }

  // 4. Weighted Total Case Readiness Percentage
  // Profile (25%) + Tests (45%) + Counseling/Review (30%)
  const overallPercentage = Math.round(
    profilePercentage * 0.25 + testsPercentage * 0.45 + counselingPercentage * 0.30
  );

  const stages: StageMetric[] = [
    {
      id: 'profile',
      title: 'شناسنامه و معیارهای همسرگزینی',
      subtitle: 'اطلاعات تحصیلی، شغلی، سبک زندگی و خطوط قرمز',
      percentage: profilePercentage,
      completedText: `${profilePercentage}٪ تکمیل شده`,
      color: '#156f6c',
      icon: UserCheck,
      actionLabel: profilePercentage < 100 ? 'ویرایش و تکمیل پروفایل' : 'مشاهده اطلاعات',
      onAction: onOpenProfileForm,
      items: [
        { label: 'اطلاعات فردی و تحصیلی', done: !!profile?.education && !!profile?.age },
        { label: 'وضعیت شغلی و اقتصادی', done: !!profile?.jobTitle },
        { label: 'سبک زندگی و اهداف ازدواج', done: !!profile?.marriageGoal },
        { label: 'تعیین محدوده سنی و خطوط قرمز', done: !!profile?.criteria?.minAge },
      ],
    },
    {
      id: 'tests',
      title: 'ارزیابی ۵ بعدی روان‌شناختی',
      subtitle: 'شخصیت نئو، سبک دلبستگی، گاتمن و شوارتز',
      percentage: testsPercentage,
      completedText: `${completedTestsCount} از ${totalAssignedTests} آزمون تکمیل شد`,
      color: '#0d9488',
      icon: Brain,
      actionLabel: nextPendingTest ? 'ادامه آزمون‌های روان‌سنجی' : 'مشاهده نتایج آزمون‌ها',
      onAction: () => {
        if (nextPendingTest && onOpenTestEngine) {
          onOpenTestEngine(nextPendingTest.testId);
        } else if (testAssignments[0] && onOpenTestEngine) {
          onOpenTestEngine(testAssignments[0].testId);
        }
      },
      items: [
        { label: 'آزمون پنج عاملی شخصیت (NEO-FFI)', done: testResults.some((r) => r.testId === 'test-neo') },
        { label: 'آزمون سبک‌های دلبستگی بزرگسالان (ECR)', done: testResults.some((r) => r.testId === 'test-ecr') },
        { label: 'پرسشنامه آمادگی برای ازدواج (PAM)', done: testResults.some((r) => r.testId === 'test-pam') },
        { label: 'مقیاس ارزش‌ها و حل تعارض', done: testResults.some((r) => r.testId === 'test-las' || r.testId === 'test-fms') },
      ],
    },
    {
      id: 'counseling',
      title: 'جلسات مشاوره و مصاحبه بالینی',
      subtitle: 'مصاحبه تشخیصی با سرکار خانم مهناز خوینی',
      percentage: counselingPercentage,
      completedText: completedAppointments > 0 ? `${completedAppointments} جلسه برگزار شد` : bookedAppointments > 0 ? 'نوبت رزرو شده' : 'نیازمند هماهنگی نوبت',
      color: '#d97706',
      icon: Calendar,
      actionLabel: bookedAppointments === 0 ? 'رزرو نوبت مشاوره' : 'مدیریت جلسات',
      onAction: onNavigateToAppointments,
      items: [
        { label: 'ارزیابی اولیه بالینی پرونده', done: activeCase?.status !== 'CONSENT_PENDING' },
        { label: 'رزرو جلسه مصاحبه تخصصی', done: bookedAppointments > 0 || completedAppointments > 0 },
        { label: 'برگزاری جلسه ارزیابی با مشاور', done: completedAppointments > 0 },
        { label: 'تایید صلاحیت نهایی برای معرفی', done: activeCase?.status === 'INTRODUCED' || activeCase?.status === 'READY_FOR_MATCHING' },
      ],
    },
  ];

  // -------------------------------------------------------------------
  // D3 Rendering: Radial Donut Gauge & Concentric Arcs
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 240;
    const height = 240;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Define gradients
    const defs = svg.append('defs');

    // Main Gradient
    const mainGradient = defs
      .append('linearGradient')
      .attr('id', 'caseProgressMainGrad')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    mainGradient.append('stop').attr('offset', '0%').attr('stop-color', '#156f6c');
    mainGradient.append('stop').attr('offset', '50%').attr('stop-color', '#0d9488');
    mainGradient.append('stop').attr('offset', '100%').attr('stop-color', '#34b2ae');

    // Multi-ring arc specs
    // Outer Ring: Profile (radius - 20)
    // Middle Ring: Tests (radius - 35)
    // Inner Ring: Counseling (radius - 50)
    const arcData = [
      {
        id: 'profile',
        innerRadius: radius - 16,
        outerRadius: radius,
        percentage: profilePercentage,
        color: '#156f6c',
      },
      {
        id: 'tests',
        innerRadius: radius - 34,
        outerRadius: radius - 20,
        percentage: testsPercentage,
        color: '#0d9488',
      },
      {
        id: 'counseling',
        innerRadius: radius - 52,
        outerRadius: radius - 38,
        percentage: counselingPercentage,
        color: '#d97706',
      },
    ];

    // Background track arcs
    arcData.forEach((d) => {
      const bgArc = d3
        .arc()
        .innerRadius(d.innerRadius)
        .outerRadius(d.outerRadius)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .cornerRadius(6);

      g.append('path')
        .attr('d', bgArc as any)
        .attr('fill', '#f1ebe1')
        .attr('opacity', 0.85);

      // Foreground animated progress arc
      const targetAngle = (d.percentage / 100) * 2 * Math.PI;

      const progressArc = d3
        .arc()
        .innerRadius(d.innerRadius)
        .outerRadius(d.outerRadius)
        .startAngle(0)
        .cornerRadius(6);

      const path = g
        .append('path')
        .datum({ endAngle: 0 })
        .attr('fill', d.color)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setActiveMetricId(d.id as any);
        });

      path
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attrTween('d', function (b: any) {
          const interpolate = d3.interpolate(b.endAngle, targetAngle);
          return function (t: number) {
            b.endAngle = interpolate(t);
            return (progressArc as any)(b);
          };
        });
    });

    // Central text badge
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('class', 'font-black tracking-tight')
      .attr('font-size', '28px')
      .attr('fill', '#156f6c')
      .text(`${overallPercentage}٪`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.4em')
      .attr('class', 'font-bold')
      .attr('font-size', '10px')
      .attr('fill', '#78716c')
      .text('پیشرفت پرونده');

  }, [profilePercentage, testsPercentage, counselingPercentage, overallPercentage]);

  return (
    <div className="bg-white border border-[#e4dacb] shadow-xs rounded-2xl p-5 mb-6 text-right">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              وضعیت تکمیل و ارزیابی پرونده ازدواج
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              نمودار بصری انطباق‌سنجی بر مبنای استانداردهای ۳ گانه مرکز پیوند امن
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">میزان آمادگی پرونده:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 text-xs font-black">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>{overallPercentage}٪ آماده معرفی</span>
          </span>
        </div>
      </div>

      {/* Main Grid: D3 Radial Chart on Right + 3 Detailed Bars on Left */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* D3 Chart Visual */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-[#faf7f2] rounded-2xl border border-[#ede3d4]">
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
            <svg ref={svgRef} className="w-full h-full overflow-visible" />
          </div>

          {/* Chart Legend with Color Indicators */}
          <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-[#e5dcce] text-[10px] text-center font-bold">
            <button
              type="button"
              onClick={() => setActiveMetricId('profile')}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                activeMetricId === 'profile' ? 'bg-teal-50 border-teal-300 text-teal-900' : 'bg-white border-transparent text-slate-600'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#156f6c] ml-1"></span>
              <span>پروفایل ({profilePercentage}٪)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricId('tests')}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                activeMetricId === 'tests' ? 'bg-teal-50 border-teal-300 text-teal-900' : 'bg-white border-transparent text-slate-600'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#0d9488] ml-1"></span>
              <span>آزمون‌ها ({testsPercentage}٪)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricId('counseling')}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                activeMetricId === 'counseling' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-transparent text-slate-600'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#d97706] ml-1"></span>
              <span>مشاوره ({counselingPercentage}٪)</span>
            </button>
          </div>
        </div>

        {/* Detailed 3 Progress Dimensions */}
        <div className="md:col-span-8 space-y-3.5">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isHighlight = activeMetricId === 'all' || activeMetricId === stage.id;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-xl border transition-all ${
                  isHighlight
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: stage.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {stage.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="font-mono font-extrabold text-xs text-slate-900 block">
                      {stage.percentage}٪
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {stage.completedText}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>

                {/* Checklist items in single row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-50 text-[11px]">
                  {stage.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                      {item.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className={`truncate ${item.done ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Action button if provided */}
                {stage.actionLabel && stage.onAction && (
                  <div className="mt-2.5 pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={stage.onAction}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer"
                    >
                      <span>{stage.actionLabel}</span>
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
