/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuditLog } from '../../types';
import { ShieldAlert, ShieldCheck, Clock, Terminal } from 'lucide-react';

interface AdminAuditLogProps {
  auditLogs: AuditLog[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ auditLogs }) => {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          دفتر ثبت تغییرات و نظارت بر امنیت پرونده‌ها (Audit Trail)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          تمام اقدامات کاربران، دسترسی‌های خانم خوینی و تغییرات وضعیت پرونده‌ها ثبت غیرقابل‌تغییر می‌شوند.
        </p>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-800 text-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">زمان ثبت</th>
                <th className="p-3">نقش و کنش‌گر</th>
                <th className="p-3">اقدام صورت‌گرفته</th>
                <th className="p-3">منبع / پرونده</th>
                <th className="p-3">آدرس IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-500">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="p-3 font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700 border border-slate-200 ml-1">
                      {log.actorRole}
                    </span>
                    {log.actorId}
                  </td>
                  <td className="p-3 font-bold text-sky-700">{log.action}</td>
                  <td className="p-3 font-mono text-slate-800">{log.resource}: {log.resourceId}</td>
                  <td className="p-3 font-mono text-[10px] text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
