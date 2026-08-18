/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TestCatalog } from '../../types';
import { SlidersHorizontal, CheckCircle2, Shield, Plus, Lock } from 'lucide-react';

interface AdminTestCatalogProps {
  testCatalog: TestCatalog[];
  onToggleMatching: (testId: string) => void;
}

export const AdminTestCatalog: React.FC<AdminTestCatalogProps> = ({
  testCatalog,
  onToggleMatching,
}) => {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex justify-between items-center">
        <div>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-600" />
            مدیریت کاتالوگ آزمون‌های روان‌شناختی و الگوریتم تطبیق
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            پیکربندی نسخه آزمون‌ها، زیرمقیاس‌ها و فعال‌سازی اثرگذاری در موتور تطبیق هوشمند
          </p>
        </div>

        <button className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>افزودن آزمون جدید</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCatalog.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <span className="font-mono font-bold text-sky-700 text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {t.code} v{t.version}
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {t.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 text-xs mb-1">{t.name}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{t.description}</p>

              <div className="space-y-1 text-[10px] text-slate-500">
                <div>تعداد سوالات: <strong className="text-slate-800">{t.questionCount} سوال</strong></div>
                <div>مجوز: <strong className="text-slate-800">{t.licenseStatus}</strong></div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.subscales.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">مشارکت در Matching:</span>
              <button
                onClick={() => onToggleMatching(t.id)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                  t.matchingEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {t.matchingEnabled ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
