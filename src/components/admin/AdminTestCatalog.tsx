/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestCatalog } from '../../types';
import { 
  ClipboardList, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  HelpCircle,
  Layers,
  FileText,
  SlidersHorizontal,
  Info,
  ShieldCheck
} from 'lucide-react';

interface AdminTestCatalogProps {
  testCatalog: TestCatalog[];
  onToggleMatching: (testId: string) => void;
}

export const AdminTestCatalog: React.FC<AdminTestCatalogProps> = ({ testCatalog, onToggleMatching }) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredTests = testCatalog.filter((t) => {
    if (filterCategory === 'ACTIVE') return t.matchingEnabled;
    if (filterCategory === 'INACTIVE') return !t.matchingEnabled;
    return true;
  });

  const activeCount = testCatalog.filter(t => t.matchingEnabled).length;

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-7 bg-slate-50/40">
      {/* Header Banner */}
      <div 
        id="admin-test-catalog-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 backdrop-blur-md">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>پیکربندی و وزن‌دهی موتور روان‌سنجی</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              کاتالوگ آزمون‌های بالینی و روان‌شناختی
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              تعیین نقش و اثرگذاری هر آزمون در الگوریتم همسان‌گزینی و تعیین نیازمندی‌های ارزیابی پیش از معرفی مراجعین.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">آزمون‌های فعال در الگوریتم</span>
              <span className="text-lg font-black text-teal-300 font-mono mt-0.5 block">
                {activeCount} <span className="text-xs font-normal text-slate-400">از</span> {testCatalog.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Info */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            همه آزمون‌ها ({testCatalog.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'ACTIVE'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            فعال در تطابق ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('INACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'INACTIVE'
                ? 'bg-slate-100 text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            غیرفعال ({testCatalog.length - activeCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>تغییر وضعیت آزمون بلافاصله در محاسبه امتیاز سازگاری زوجین اعمال می‌شود.</span>
        </div>
      </div>

      {/* Test Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            id={`test-card-${test.id}`}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Soft Ambient Background Gradient */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${
                test.matchingEnabled 
                  ? 'from-teal-500/5 via-sky-500/5 to-transparent' 
                  : 'from-slate-100/40 to-transparent'
              } pointer-events-none`} 
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/80">
                    {test.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 pt-1">
                    {test.name}
                  </h3>
                </div>

                <div className={`p-2.5 rounded-xl shrink-0 ${
                  test.matchingEnabled 
                    ? 'bg-teal-50 text-teal-600 border border-teal-200/60 shadow-2xs' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                }`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                {test.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex items-center gap-1.5 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{test.questionCount} پرسش</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{Math.max(10, Math.round(test.questionCount * 0.5))} دقیقه</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${test.matchingEnabled ? 'bg-teal-500 ring-4 ring-teal-500/20' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-700">
                  {test.matchingEnabled ? 'فعال در هوش تطابق' : 'غیرفعال در الگوریتم'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleMatching(test.id)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  test.matchingEnabled 
                    ? 'text-teal-600 hover:bg-teal-50' 
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title={test.matchingEnabled ? 'غیرفعال‌سازی آزمون' : 'فعال‌سازی آزمون'}
              >
                {test.matchingEnabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

