/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { GroupSession, GroupSessionBooking, User } from '../../types';
import { Users, Plus, Save, ListChecks, Calendar, Clock, DollarSign, UserCheck, Video, Sparkles } from 'lucide-react';

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
    if (rosterFor === sessionId) {
      setRosterFor(null);
      return;
    }
    setRosterFor(sessionId);
    setRoster(await StorageService.getGroupSessionBookings(sessionId));
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-500 font-medium">
      در حال بارگذاری کارگاه‌ها و جلسات گروهی...
    </div>
  );

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-7 bg-slate-50/40">
      {/* Header Banner */}
      <div 
        id="admin-sessions-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              <span>کارگاه‌های آموزشی و جلسات گروهی</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              مدیریت وبینارها و جلسات گروهی مراجعین
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              برنامه‌ریزی کارگاه‌های خودشناسی، بهبود ارتباط مؤثر، تعیین ظرفیت و بررسی اسامی ثبت‌نام‌کنندگان.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">کل جلسات تعریف‌شده</span>
              <span className="text-lg font-black text-indigo-300 font-mono mt-0.5 block">
                {sessions.length} <span className="text-xs font-normal text-slate-400">جلسه</span>
              </span>
            </div>

            <button
              onClick={startNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-3.5 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>جلسه جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Box */}
      {editing && (
        <div className="bg-white border border-indigo-200/80 shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{editing.id ? 'ویرایش اطلاعات جلسه' : 'ایجاد جلسه یا کارگاه جدید'}</span>
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان کارگاه / وبینار</label>
              <input
                type="text"
                placeholder="عنوان جلسه گروهی..."
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات و سرفصل‌ها</label>
              <textarea
                placeholder="توضیحات محتوایی کارگاه..."
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">زمان برگزاری</label>
                <input
                  type="datetime-local"
                  value={editing.scheduledAt ? String(editing.scheduledAt).slice(0, 16) : ''}
                  onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs dir-ltr font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">مدت (دقیقه)</label>
                <input
                  type="number"
                  value={editing.durationMinutes ?? 90}
                  onChange={(e) => setEditing({ ...editing, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ظرفیت شرکت‌کنندگان</label>
                <input
                  type="number"
                  value={editing.capacity ?? 12}
                  onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">هزینه (تومان، ۰=رایگان)</label>
                <input
                  type="number"
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">لینک اتصال مجازی به جلسه (Skyroom / Google Meet)</label>
              <input
                type="text"
                placeholder="https://skyroom.online/ch/..."
                value={editing.meetingUrl || ''}
                onChange={(e) => setEditing({ ...editing, meetingUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره جلسه</span>
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-white border border-slate-200/70 shadow-sm rounded-2xl overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">فهرست وبینارها و جلسات گروهی</span>
          <span className="text-[11px] text-slate-400 font-mono">تعداد: {sessions.length}</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">هنوز جلسه‌ای برنامه‌ریزی نشده است.</p>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="p-5 space-y-3 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-bold text-slate-900">{s.title}</div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-normal">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono font-medium text-slate-700">
                      {new Date(s.scheduledAt).toLocaleDateString('fa-IR')}
                    </span>
                    <span>•</span>
                    <span>{s.durationMinutes} دقیقه</span>
                    <span>•</span>
                    <span>ظرفیت: {s.capacity} نفر</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      s.status === 'SCHEDULED' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200/70' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => viewRoster(s.id)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      rosterFor === s.id
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                    <span>لیست ثبت‌نامی‌ها</span>
                  </button>

                  <button
                    onClick={() => setEditing(s)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                  >
                    ویرایش
                  </button>
                </div>
              </div>

              {rosterFor === s.id && (
                <div className="mt-3 bg-slate-50/90 rounded-xl p-4 border border-slate-200/80 text-xs space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200/60">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>اسامی متقاضیان ثبت‌نام کرده در این جلسه:</span>
                  </div>

                  {roster.length === 0 ? (
                    <span className="text-slate-400 block py-1">هنوز مراجعی برای این جلسه ثبت‌نام نکرده است.</span>
                  ) : (
                    <div className="space-y-1.5">
                      {roster.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                          <span className="font-bold text-slate-800">{b.userName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
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

