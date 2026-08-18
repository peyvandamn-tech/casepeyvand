/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MatchCandidate, Case, Profile, User } from '../../types';
import { MatchingEngine } from '../../services/matchingEngine';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRightLeft, 
  UserCheck, 
  Calendar,
  ChevronLeft
} from 'lucide-react';

interface ExpertMatchingTableProps {
  matchCandidates: MatchCandidate[];
  cases: Case[];
  profiles: Profile[];
  users: User[];
  onApproveMatch: (matchId: string) => void;
  onDeclineMatch: (matchId: string) => void;
  onGenerateNewMatches: () => void;
}

export const ExpertMatchingTable: React.FC<ExpertMatchingTableProps> = ({
  matchCandidates,
  cases,
  profiles,
  users,
  onApproveMatch,
  onDeclineMatch,
  onGenerateNewMatches,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    matchCandidates[0]?.id || 'match-sara-ali'
  );

  const selectedMatch = matchCandidates.find((m) => m.id === selectedCandidateId) || matchCandidates[0];

  const caseA = cases.find((c) => c.id === selectedMatch?.caseAId);
  const caseB = cases.find((c) => c.id === selectedMatch?.caseBId);
  const profileA = profiles.find((p) => p.caseId === selectedMatch?.caseAId);
  const profileB = profiles.find((p) => p.caseId === selectedMatch?.caseBId);
  const userA = users.find((u) => u.id === caseA?.userId);
  const userB = users.find((u) => u.id === caseB?.userId);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-sky-600" />
            میز تطبیق الگوریتمی و بررسی تخصصی (Level 1 تا Level 3)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            سیستم کاندیدها را بر اساس الگوریتم پیدا می‌کند (Level 1)، خانم خوینی ارزیابی تخصصی را انجام می‌دهد (Level 2)، و پس از تأیید معرفی صادر می‌شود (Level 3).
          </p>
        </div>

        <button
          onClick={onGenerateNewMatches}
          className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>ارزیابی مجدد الگوریتم تطبیق</span>
        </button>
      </div>

      {/* Main Grid: Candidates List & Detailed Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Candidates Selection Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              کاندیدهای پیشنهادی (Algorithmic Candidates)
            </span>
            <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded border border-sky-200">
              {matchCandidates.length} مورد
            </span>
          </div>

          <div className="space-y-2">
            {matchCandidates.map((m) => {
              const pA = profiles.find((p) => p.caseId === m.caseAId);
              const pB = profiles.find((p) => p.caseId === m.caseBId);
              const isSelected = m.id === selectedCandidateId;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedCandidateId(m.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {pA?.city} - {pB?.city}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {m.compatibilityScore}٪ همخوانی
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex justify-between items-center">
                    <span>{m.caseAId} ↔ {m.caseBId}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.expertDecision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.expertDecision === 'APPROVED' ? 'تأیید شده' : 'منتظر بررسی'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Match Deep Comparison (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedMatch && profileA && profileB ? (
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-4">
              {/* Top Compatibility Score Header */}
              <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                    درجه همخوانی روان‌شناختی و ساختاری
                  </span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {selectedMatch.compatibilityScore}٪ امتیاز تطبیق
                  </div>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>سطح ۲: ارزیابی خانم خوینی</span>
                </div>
              </div>

              {/* Side by Side Profile Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Person A */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-800">{userA?.fullName} ({selectedMatch.caseAId})</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                      {userA?.gender === 'MALE' ? 'آقا' : 'خانم'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div><strong>سن / شهر:</strong> {profileA.age} سال / {profileA.city}</div>
                    <div><strong>تحصیلات:</strong> {profileA.education} ({profileA.fieldOfStudy})</div>
                    <div><strong>شغل:</strong> {profileA.jobTitle}</div>
                    <div><strong>فرزندآوری:</strong> <span className="text-emerald-700 font-bold">تمایل قطعی</span></div>
                  </div>
                </div>

                {/* Person B */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-slate-800">{userB?.fullName} ({selectedMatch.caseBId})</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      {userB?.gender === 'MALE' ? 'آقا' : 'خانم'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div><strong>سن / شهر:</strong> {profileB.age} سال / {profileB.city}</div>
                    <div><strong>تحصیلات:</strong> {profileB.education} ({profileB.fieldOfStudy})</div>
                    <div><strong>شغل:</strong> {profileB.jobTitle}</div>
                    <div><strong>فرزندآوری:</strong> <span className="text-emerald-700 font-bold">تمایل قطعی</span></div>
                  </div>
                </div>
              </div>

              {/* Compatibility Breakdown Bars */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  تفکیک مولفه‌های همخوانی (Weight Matrix)
                </span>
                
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-0.5">
                      <span>اهداف و الزامات اصلی ازدواج (وزن ۲۵٪)</span>
                      <span className="font-bold">{selectedMatch.breakdown.marriageGoals}/۲۵</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(selectedMatch.breakdown.marriageGoals / 25) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-0.5">
                      <span>ارزش‌های اخلاقی و خانوادگی (وزن ۲۰٪)</span>
                      <span className="font-bold">{selectedMatch.breakdown.values}/۲۰</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${(selectedMatch.breakdown.values / 20) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-0.5">
                      <span>همخوانی دلبستگی و هیجانی (وزن ۱۵٪)</span>
                      <span className="font-bold">{selectedMatch.breakdown.attachment}/۱۵</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(selectedMatch.breakdown.attachment / 15) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hard Conflicts and Soft Differences Alerts */}
              <div className="space-y-2 text-xs">
                {selectedMatch.hardConflicts.length > 0 ? (
                  <div className="bg-red-50 border-r-4 border-red-500 p-3 rounded-lg text-red-800">
                    <strong className="block text-red-900 mb-1">تعارض قطعی (Hard Conflict):</strong>
                    <ul className="list-disc list-inside text-[11px]">
                      {selectedMatch.hardConflicts.map((hc, i) => (
                        <li key={i}>{hc}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border-r-4 border-emerald-500 p-3 rounded-lg text-emerald-800 text-[11px]">
                    <strong>بررسی خط قرمزها:</strong> هیچ عدم‌انطباق یا تعارض قطعی (Hard Conflict) در سن، شهر، اعتیاد و فرزندآوری یافت نشد.
                  </div>
                )}

                {selectedMatch.softDifferences.length > 0 && (
                  <div className="bg-amber-50 border-r-4 border-amber-500 p-3 rounded-lg text-amber-900 text-[11px]">
                    <strong>تفاوت‌های نرم (Soft Differences):</strong>
                    <p className="mt-0.5">{selectedMatch.softDifferences.join(' | ')}</p>
                  </div>
                )}
              </div>

              {/* Approval Actions */}
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => onDeclineMatch(selectedMatch.id)}
                  className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-300"
                >
                  رد یا بایگانی کاندید
                </button>
                <button
                  onClick={() => onApproveMatch(selectedMatch.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأیید و صدور معرفی اولیه (Level 3 - Approved Introduction)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              کاندید مورد نظر را از لیست سمت راست انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
