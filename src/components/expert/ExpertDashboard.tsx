/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Case, Profile, TestResult, ExpertNote, MatchCandidate, User, Introduction } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storage';
import { 
  Users, 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  FileEdit, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  Users2
} from 'lucide-react';

interface ExpertDashboardProps {
  cases: Case[];
  profiles: Profile[];
  testResults: TestResult[];
  expertNotes: ExpertNote[];
  matchCandidates: MatchCandidate[];
  introductions?: Introduction[];
  users: User[];
  onSelectCaseForMatching: (caseId: string) => void;
  onSaveExpertNote: (caseId: string, content: string, type: 'INTERNAL' | 'SHAREABLE') => void;
  onUpdateCaseStatus: (caseId: string, status: Case['status']) => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({
  cases,
  profiles,
  testResults,
  expertNotes,
  matchCandidates,
  introductions = [],
  users,
  onSelectCaseForMatching,
  onSaveExpertNote,
  onUpdateCaseStatus,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'CASE-2026-00128');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteType, setNoteType] = useState<'INTERNAL' | 'SHAREABLE'>('SHAREABLE');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [meetingLocation, setMeetingLocation] = useState<string>('');
  const [proposingMeeting, setProposingMeeting] = useState(false);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const selectedProfile = profiles.find((p) => p.caseId === selectedCaseId);
  const selectedUser = users.find((u) => u.id === selectedCase?.userId);
  const caseResults = testResults.filter((r) => r.caseId === selectedCaseId);
  const caseNotes = expertNotes.filter((n) => n.caseId === selectedCaseId);
  const caseIntroduction = introductions.find(
    (i) => i.caseAId === selectedCaseId || i.caseBId === selectedCaseId
  );

  const handleProposeMeeting = async () => {
    if (!caseIntroduction || !meetingDate) return;
    setProposingMeeting(true);
    try {
      await StorageService.proposeFamilyMeeting(
        caseIntroduction.id,
        new Date(meetingDate).toISOString(),
        meetingLocation
      );
      alert('پیشنهاد جلسه معارفه ثبت شد و برای هر دو طرف قابل مشاهده است.');
      setMeetingDate('');
      setMeetingLocation('');
    } catch (err) {
      console.error('Failed to propose family meeting:', err);
      alert('ثبت پیشنهاد با خطا مواجه شد.');
    } finally {
      setProposingMeeting(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'READY') return c.status === 'READY_FOR_MATCHING';
    if (filterStatus === 'REVIEW') return c.status === 'EXPERT_REVIEW';
    return true;
  });

  const handleGenerateAiClinicalSummary = async () => {
    if (!selectedCase || !selectedProfile) return;
    setIsAnalyzing(true);
    try {
      const summary = await GeminiService.generateCaseAnalysis(
        selectedCase.id,
        selectedProfile,
        caseResults,
        caseNotes
      );
      setAiAnalysis(summary);
    } catch (err) {
      setAiAnalysis('خطا در دریافت تحلیل بالینی هوش مصنوعی. لطفا مجددا تلاش کنید.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !selectedCaseId) return;
    onSaveExpertNote(selectedCaseId, noteContent, noteType);
    setNoteContent('');
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      {/* 1. Metric Summary Strip (High Density) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">پرونده‌های فعال</span>
            <strong className="text-lg font-extrabold text-slate-800">{cases.length} کیس</strong>
          </div>
          <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg border border-sky-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">آزمون‌های تکمیل‌شده</span>
            <strong className="text-lg font-extrabold text-slate-800">{testResults.length} آزمون</strong>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <BrainCircuit className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">آماده تطبیق اولیه</span>
            <strong className="text-lg font-extrabold text-emerald-700">
              {cases.filter((c) => c.status === 'READY_FOR_MATCHING').length} پرونده
            </strong>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">معرفی‌های فعال</span>
            <strong className="text-lg font-extrabold text-purple-700">{matchCandidates.length} معرفی</strong>
          </div>
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg border border-purple-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Expert Workbench: Case List & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cases Table List (4 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              فهرست پرونده‌های مراجعین
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                  filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setFilterStatus('READY')}
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                  filterStatus === 'READY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                آماده تطبیق
              </button>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredCases.map((c) => {
              const u = users.find((usr) => usr.id === c.userId);
              const isSelected = c.id === selectedCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-slate-900">{c.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.status === 'READY_FOR_MATCHING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status === 'READY_FOR_MATCHING' ? 'آماده معرفی' : 'در حال ارزیابی'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span className="font-bold">{u?.fullName || 'مراجع'} ({u?.gender === 'FEMALE' ? 'خانم' : 'آقا'})</span>
                    <span className="text-[10px] text-slate-400">{c.createdAt.slice(0, 10)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Clinical Workbench (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase && selectedProfile ? (
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-4">
              {/* Case Header Banner */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{selectedCase.id}</span>
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {selectedUser?.fullName} - {selectedProfile.age} ساله ({selectedProfile.city})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تحصیلات: {selectedProfile.education} ({selectedProfile.fieldOfStudy}) | شغل: {selectedProfile.jobTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCaseForMatching(selectedCase.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>ورود به میز تطبیق</span>
                  </button>
                </div>
              </div>

              {/* Family Introduction Meeting Proposal (only once matched/introduced) */}
              {caseIntroduction && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <Users2 className="w-3.5 h-3.5" />
                    پیشنهاد جلسه معارفه خانوادگی
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="datetime-local"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-teal-200 rounded-lg text-[11px] dir-ltr"
                    />
                    <input
                      type="text"
                      placeholder="مکان (اختیاری)"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-teal-200 rounded-lg text-[11px] sm:col-span-1"
                    />
                    <button
                      onClick={handleProposeMeeting}
                      disabled={!meetingDate || proposingMeeting}
                      className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg py-1.5"
                    >
                      {proposingMeeting ? 'در حال ثبت...' : 'ثبت پیشنهاد'}
                    </button>
                  </div>
                </div>
              )}

              {/* Hard Criteria & Key Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">معیارهای قطعی (Hard Criteria)</span>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {selectedProfile.criteria.hardCriteriaNotes || 'ساکن تهران، بازه سنی ۲۹ تا ۳۵، عدم مصرف سیگار، تمایل قطعی به فرزندآوری.'}
                  </p>
                </div>

                <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200 space-y-1">
                  <span className="text-[10px] text-sky-800 font-bold uppercase block">هدف از ازدواج و زمان‌بندی</span>
                  <p className="text-[11px] text-sky-950 font-medium leading-relaxed">
                    {selectedProfile.marriageGoal} (افق: {selectedProfile.expectedTimelineMonths} ماه)
                  </p>
                </div>
              </div>

              {/* Psychological Test Subscales Summary */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  نتایج سنجش روان‌شناختی مراجع
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {caseResults.map((tr) => (
                    <div key={tr.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <div className="font-bold text-slate-800 text-[11px] mb-1">آزمون {tr.testId.toUpperCase()}</div>
                      <p className="text-[10px] text-slate-600 line-clamp-2">{tr.interpretation.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Clinical Summary Generator (Powered by Gemini) */}
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200">تحلیل هوشمند بالینی (دستیار Gemini)</span>
                  </div>
                  <button
                    onClick={handleGenerateAiClinicalSummary}
                    disabled={isAnalyzing}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                  >
                    {isAnalyzing ? 'در حال تحلیل...' : 'تولید چکیده بالینی'}
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
                    {aiAnalysis}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    برای دریافت جمع‌بندی روان‌شناختی، نقاط قوت عاطفی و پیشنهادات معرفی هوشمند کلیک کنید.
                  </p>
                )}
              </div>

              {/* Add Expert Note Form */}
              <form onSubmit={handleSaveNoteSubmit} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <FileEdit className="w-3.5 h-3.5 text-sky-600" />
                    ثبت یادداشت و نظریه کارشناسی خانم خوینی
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="noteType"
                        value="SHAREABLE"
                        checked={noteType === 'SHAREABLE'}
                        onChange={() => setNoteType('SHAREABLE')}
                      />
                      <span>قابل مشاهده برای مراجع</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="noteType"
                        value="INTERNAL"
                        checked={noteType === 'INTERNAL'}
                        onChange={() => setNoteType('INTERNAL')}
                      />
                      <span>محرمانه داخلی</span>
                    </label>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="متن یادداشت تخصصی را وارد نمایید..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                ></textarea>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ثبت در پرونده</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              یک پرونده از لیست سمت راست انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
