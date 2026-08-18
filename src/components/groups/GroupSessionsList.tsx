/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { GroupSession, GroupSessionBooking, User } from '../../types';
import { Users, Calendar, Clock, Wallet, CheckCircle2 } from 'lucide-react';

interface GroupSessionsListProps {
  currentUser: User;
}

export const GroupSessionsList: React.FC<GroupSessionsListProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [bookingsBySession, setBookingsBySession] = useState<Record<string, GroupSessionBooking[]>>({});
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const load = async () => {
    const list = (await StorageService.getGroupSessions()).filter((s) => s.status === 'SCHEDULED');
    const bookingsEntries = await Promise.all(
      list.map(async (s) => [s.id, await StorageService.getGroupSessionBookings(s.id)] as const)
    );
    setSessions(list);
    setBookingsBySession(Object.fromEntries(bookingsEntries));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleBook = async (session: GroupSession) => {
    setBookingId(session.id);
    try {
      await StorageService.bookGroupSession(session.id, currentUser.id, currentUser.fullName);
      await load();
    } catch (err) {
      console.error('Booking failed:', err);
      alert('ثبت رزرو با خطا مواجه شد. ممکن است ظرفیت تکمیل شده باشد.');
    } finally {
      setBookingId(null);
    }
  };

  if (loading) return <div className="p-6 text-xs text-slate-500">در حال بارگذاری...</div>;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          کارگاه‌ها و جلسات گروهی
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">جلسات آموزشی گروهی پیش از ازدواج و مهارت‌های ارتباطی.</p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10">در حال حاضر جلسه‌ی گروهی برنامه‌ریزی‌شده‌ای وجود ندارد.</p>
      ) : (
        sessions.map((s) => {
          const booked = s.capacity - (bookingsBySession[s.id]?.filter((b) => b.status === 'BOOKED').length || 0);
          const alreadyBooked = bookingsBySession[s.id]?.some(
            (b) => b.userId === currentUser.id && b.status === 'BOOKED'
          );
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
              {s.description && <p className="text-xs text-slate-500 mt-1">{s.description}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(s.scheduledAt).toLocaleDateString('fa-IR')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {s.durationMinutes} دقیقه
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  {s.price > 0 ? `${s.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                </span>
                <span>ظرفیت باقی‌مانده: {Math.max(0, booked)}</span>
              </div>
              <button
                disabled={alreadyBooked || booked <= 0 || bookingId === s.id}
                onClick={() => handleBook(s)}
                className={`mt-3 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 ${
                  alreadyBooked
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50'
                }`}
              >
                {alreadyBooked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    رزرو شده
                  </>
                ) : booked <= 0 ? (
                  'ظرفیت تکمیل است'
                ) : bookingId === s.id ? (
                  'در حال ثبت...'
                ) : (
                  'رزرو جلسه'
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};
