/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { GroupSession, GroupSessionBooking, User } from '../../types';
import { Users, Plus, Save, ListChecks } from 'lucide-react';

interface AdminGroupSessionsProps {
  currentUser: User;
}

export const AdminGroupSessions: React.FC<AdminGroupSessionsProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [editing, setEditing] = useState<Partial<GroupSession> | null>(null);
  const [rosterFor, setRosterFor] = useState<string | null>(null);
  const [roster, setRoster] = useState<GroupSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setSessions(await StorageService.getGroupSessions());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () =>
    setEditing({
      title: '',
      description: '',
      scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      durationMinutes: 90,
      capacity: 12,
      price: 0,
      status: 'SCHEDULED',
    });

  const handleSave = async () => {
    if (!editing?.title?.trim() || !editing.scheduledAt) {
      alert('عنوان و زمان جلسه الزامی است.');
      return;
    }
    await StorageService.saveGroupSession({
      id: editing.id,
      title: editing.title,
      description: editing.description,
      facilitatorId: currentUser.id,
      facilitatorName: currentUser.fullName,
      scheduledAt: new Date(editing.scheduledAt).toISOString(),
      durationMinutes: editing.durationMinutes || 90,
      capacity: editing.capacity || 12,
      price: editing.price || 0,
      status: editing.status || 'SCHEDULED',
      meetingUrl: editing.meetingUrl,
    });
    setEditing(null);
    await load();
  };

  const viewRoster = async (sessionId: string) => {
    setRosterFor(sessionId);
    setRoster(await StorageService.getGroupSessionBookings(sessionId));
  };

  if (loading) return <div className="p-6 text-xs text-slate-500">در حال بارگذاری...</div>;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center justify-between">
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          مدیریت جلسات گروهی
        </h1>
        <button
          onClick={startNew}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          جلسه جدید
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-teal-200 shadow-xs rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="عنوان کارگاه"
            value={editing.title || ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
          />
          <textarea
            placeholder="توضیحات"
            value={editing.description || ''}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">زمان برگزاری</label>
              <input
                type="datetime-local"
                value={editing.scheduledAt ? String(editing.scheduledAt).slice(0, 16) : ''}
                onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1 dir-ltr"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">مدت (دقیقه)</label>
              <input
                type="number"
                value={editing.durationMinutes ?? 90}
                onChange={(e) => setEditing({ ...editing, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">ظرفیت</label>
              <input
                type="number"
                value={editing.capacity ?? 12}
                onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">هزینه (تومان، ۰=رایگان)</label>
              <input
                type="number"
                value={editing.price ?? 0}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-1"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="لینک جلسه (اختیاری)"
            value={editing.meetingUrl || ''}
            onChange={(e) => setEditing({ ...editing, meetingUrl: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs dir-ltr text-left"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              ذخیره
            </button>
            <button onClick={() => setEditing(null)} className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl">
              انصراف
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-xs rounded-xl divide-y divide-slate-100">
        {sessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">هنوز جلسه‌ای ثبت نشده.</p>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{s.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(s.scheduledAt).toLocaleDateString('fa-IR')} • ظرفیت {s.capacity} • {s.status}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => viewRoster(s.id)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    لیست ثبت‌نامی‌ها
                  </button>
                  <button
                    onClick={() => setEditing(s)}
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    ویرایش
                  </button>
                </div>
              </div>
              {rosterFor === s.id && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                  {roster.length === 0 ? (
                    <span className="text-slate-400">هنوز کسی ثبت‌نام نکرده.</span>
                  ) : (
                    roster.map((b) => (
                      <div key={b.id} className="flex justify-between">
                        <span>{b.userName}</span>
                        <span className="text-slate-400">{b.status}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
