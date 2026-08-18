/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../../services/supabaseClient';
import { Database, CheckCircle2, AlertCircle, Copy, Code2, ExternalLink } from 'lucide-react';

export const SupabaseStatusBanner: React.FC = () => {
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-emerald-400" />
        <span className="font-bold">پشتیبانی از دیتابیس Supabase PostgreSQL:</span>
        {isSupabaseConfigured ? (
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> متصل به Supabase
          </span>
        ) : (
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 font-bold">
            <AlertCircle className="w-3 h-3" /> حالت ذخیره‌سازی محلی (Local Sync Active)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSqlModal(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 text-[11px] font-bold transition flex items-center gap-1"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span>اسکریپت SQL جداول</span>
        </button>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1"
        >
          <span>داشبورد Supabase</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* SQL Schema Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl w-full text-right space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                کد ساخت جداول (SQL Schema) در Supabase
              </h3>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              این کدهای SQL را کپی کنید و در قسمت <strong className="text-emerald-400">SQL Editor</strong> داشبورد پروژه Supabase خود (در <code className="bg-slate-800 px-1 rounded text-sky-300">supabase.com/dashboard</code>) اجرا نمائید تا جداول دیتابیس ساخته شوند:
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto dir-ltr max-h-60">
              <pre>{SUPABASE_SQL_SCHEMA.trim()}</pre>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                کلیدهای <code className="text-amber-300">VITE_SUPABASE_URL</code> و <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code> در منوی Settings لایه اجرا تنظیم می‌شوند.
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handleCopySql}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'کپی شد!' : 'کپی کد SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
