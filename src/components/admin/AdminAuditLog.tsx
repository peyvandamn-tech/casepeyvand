/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuditLog } from '../../types';
import { ShieldAlert, ShieldCheck, Clock, Terminal, Activity, FileText, Lock, Shield } from 'lucide-react';

interface AdminAuditLogProps {
  auditLogs: AuditLog[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ auditLogs }) => {
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-7 bg-slate-50/40">
      {/* Header Banner */}
      <div 
        id="admin-audit-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5" />
              <span>نظارت یکپارچه بر امنیت و پرونده‌ها</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              دفتر ثبت رویدادها و لاگ‌های امنیتی (Audit Trail)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              تمام اقدامات کاربران، دسترسی‌های خانم خوینی، ویرایش اطلاعات حساس و تغییرات وضعیت پرونده‌ها به صورت غیرقابل‌تغییر ثبت می‌شوند.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">کل رویدادهای ثبت‌شده</span>
              <span className="text-lg font-black text-rose-300 font-mono mt-0.5 block">
                {auditLogs.length} <span className="text-xs font-normal text-slate-400">رخداد</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">تاریخچه ثبت تغییرات بلادرنگ</h2>
              <p className="text-xs text-slate-400 font-normal">ردیابی دقیق تغییرات همراه با ثبت آدرس IP و نقش عامل</p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>غیرقابل حذف / رمزنگاری شده</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 text-[11px]">
              <tr>
                <th className="p-3.5">زمان ثبت</th>
                <th className="p-3.5">نقش و شناسه کاربر</th>
                <th className="p-3.5">عملیات انجام شده</th>
                <th className="p-3.5">منبع / شناسه هدف</th>
                <th className="p-3.5 text-center">آدرس IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {log.timestamp.replace('T', ' ').slice(0, 19)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-slate-200/70 ml-1.5 inline-block">
                      {log.actorRole}
                    </span>
                    <span className="font-mono text-slate-600">{log.actorId}</span>
                  </td>
                  <td className="p-3.5 font-bold text-sky-800">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-mono text-slate-800">
                    <span className="text-slate-500">{log.resource}:</span> {log.resourceId}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 text-center">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

