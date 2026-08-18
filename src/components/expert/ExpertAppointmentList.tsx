/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Appointment, Case } from '../../types';
import { Calendar, Clock, Video, Plus, CheckCircle2, User, Building2 } from 'lucide-react';

interface ExpertAppointmentListProps {
  appointments: Appointment[];
  cases: Case[];
  onAddAppointment: (appointment: Partial<Appointment>) => void;
}

export const ExpertAppointmentList: React.FC<ExpertAppointmentListProps> = ({
  appointments,
  cases,
  onAddAppointment,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [clientName, setClientName] = useState('سارا محمدی');
  const [type, setType] = useState<Appointment['type']>('JOINT_SESSION');
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('16:00');
  const [notes, setNotes] = useState('جلسه مشاوره پیش از معرفی رسمی خانواده‌ها');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAppointment({
      caseId,
      clientName,
      expertId: 'user-mahnaz',
      expertName: 'خانم مهناز خوینی',
      type,
      scheduledAt: `${date}T${time}:00Z`,
      durationMinutes: 60,
      status: 'BOOKED',
      meetingUrl: `https://meet.peyvandamn.ir/room-${caseId}`,
      notes,
    });
    setShowForm(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex justify-between items-center">
        <div>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            برنامه‌ریزی و مدیریت جلسات مشاوره (خانم خوینی)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            تنظیم جلسات فردی، آنلاین و نشست‌های مشترک آشنایی زوجین
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>تنظیم جلسه جدید</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-sky-300 shadow-md rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">فرم ثبت وقت مشاوره جدید</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">پرونده مراجع:</label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.id}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">نام مراجع / طرفین:</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">نوع جلسه:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              >
                <option value="JOINT_SESSION">نشست مشترک آشنایی</option>
                <option value="INDIVIDUAL">مشاوره انفرادی</option>
                <option value="ONLINE">آنلاین تصویری</option>
                <option value="IN_PERSON">حضوری در مرکز</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">تاریخ:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">ساعت:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">یادداشت جلسه:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
            >
              ذخیره و ارسال پیامک
            </button>
          </div>
        </form>
      )}

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-xs">{apt.clientName} ({apt.caseId})</span>
              <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
                {apt.type === 'JOINT_SESSION' ? 'نشست مشترک' : 'مشاوره انفرادی'}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>زمان: <strong>{apt.scheduledAt.replace('T', ' ساعت ').replace(':00Z', '')}</strong> ({apt.durationMinutes} دقیقه)</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>اتاق آنلاین: <a href={apt.meetingUrl} target="_blank" rel="noreferrer" className="text-sky-600 font-mono underline">{apt.meetingUrl}</a></span>
              </div>
              {apt.notes && (
                <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700 mt-2 border border-slate-100">
                  {apt.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
