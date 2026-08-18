/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Case, Appointment, User } from '../../types';
import { StorageService } from '../../services/storage';
import { Calendar, Clock, Video, Users, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppointmentBookingProps {
  activeCase?: Case;
  currentCase?: Case;
  currentUser?: User;
  userName?: string;
  appointments?: Appointment[];
  onBookAppointment?: (appointment: Partial<Appointment>) => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  activeCase,
  currentCase,
  currentUser,
  userName: propUserName,
  appointments: propAppointments,
  onBookAppointment,
}) => {
  const cCase = activeCase || currentCase;
  const userName = propUserName || currentUser?.fullName || 'مراجع';

  const [sessionType, setSessionType] = useState<'INDIVIDUAL' | 'JOINT_SESSION'>('INDIVIDUAL');
  const [sessionFormat, setSessionFormat] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE');
  const [selectedDate, setSelectedDate] = useState<string>('1405/05/25');
  const [selectedTime, setSelectedTime] = useState<string>('16:00');
  const [bookedSuccess, setBookedSuccess] = useState<boolean>(false);

  const caseId = cCase?.id || 'CASE-2026-00128';
  const [fetchedApts, setFetchedApts] = useState<Appointment[]>([]);

  useEffect(() => {
    if (propAppointments) return;
    StorageService.getAppointments().then(setFetchedApts);
  }, [propAppointments]);

  const allApts = propAppointments || fetchedApts;
  const existingApts = allApts.filter((a) => a.caseId === caseId);

  // Jalali slot dates (as shown in the picker) mapped to their real Gregorian
  // calendar dates, so the booked appointment lands on the day the client
  // actually picked instead of a hardcoded date.
  const SLOT_DATE_TO_GREGORIAN: Record<string, string> = {
    '1405/05/25': '2026-08-16',
    '1405/05/26': '2026-08-17',
    '1405/05/28': '2026-08-19',
  };

  const buildScheduledAt = () => {
    const gDate = SLOT_DATE_TO_GREGORIAN[selectedDate] || '2026-08-16';
    return `${gDate}T${selectedTime}:00Z`;
  };

  // All experts currently share one calendar (خانم خوینی), so a slot is
  // taken once ANY case has booked that exact date/time — not just this
  // one. (The DB's UNIQUE(expert_id, scheduled_at) constraint is the real
  // backstop; this is just an early, friendlier check before submitting.)
  const isSlotTaken = (scheduledAt: string) => {
    return allApts.some((a) => a.scheduledAt === scheduledAt && a.status !== 'CANCELLED');
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledAt = buildScheduledAt();
    if (isSlotTaken(scheduledAt)) {
      alert('این بازه زمانی قبلاً توسط مراجع دیگری رزرو شده است. لطفاً روز یا ساعت دیگری انتخاب کنید.');
      return;
    }

    const aptData: Partial<Appointment> = {
      caseId,
      clientName: userName,
      expertId: 'user-mahnaz',
      expertName: 'خانم مهناز خوینی',
      type: sessionType,
      scheduledAt,
      durationMinutes: 60,
      status: 'BOOKED',
      meetingUrl: sessionFormat === 'ONLINE' ? `https://meet.peyvandamn.ir/room-${caseId}` : undefined,
      notes: `جلسه ${sessionType === 'INDIVIDUAL' ? 'فردی' : 'مشترک'} ${sessionFormat === 'ONLINE' ? 'آنلاین' : 'حضوری'} با خانم مهناز خوینی`,
    };

    try {
      if (onBookAppointment) {
        await onBookAppointment(aptData);
      } else {
        const newApt: Appointment = {
          id: `apt-${Date.now()}`,
          caseId,
          clientName: userName,
          expertId: 'user-mahnaz',
          expertName: 'خانم مهناز خوینی',
          type: sessionType,
          scheduledAt,
          durationMinutes: 60,
          status: 'BOOKED',
          meetingUrl: sessionFormat === 'ONLINE' ? `https://meet.peyvandamn.ir/room-${caseId}` : undefined,
          notes: aptData.notes,
        };
        await StorageService.saveAppointment(newApt);
        setFetchedApts((prev) => [...prev, newApt]);
      }
      setBookedSuccess(true);
      setTimeout(() => setBookedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to book appointment:', err);
      alert('این بازه زمانی هم‌اکنون توسط شخص دیگری رزرو شد. لطفاً زمان دیگری انتخاب کنید.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-100 pb-4 mb-6">
          <div className="bg-teal-50 text-teal-700 p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">رزرو جلسه مشاوره با خانم مهناز خوینی</h2>
            <p className="text-xs text-slate-500">جلسات مشاوره فردی و مشترک پیش از ازدواج جهت بررسی عمیق و تسهیل آشنایی</p>
          </div>
        </div>

        <form onSubmit={handleBook} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">نوع جلسه مشاوره</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionType('INDIVIDUAL')}
                  className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-2 space-x-reverse ${
                    sessionType === 'INDIVIDUAL' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>مشاوره فردی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType('JOINT_SESSION')}
                  className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-2 space-x-reverse ${
                    sessionType === 'JOINT_SESSION' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>مشاوره مشترک</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">شیوه برگزاری جلسه</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionFormat('ONLINE')}
                  className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-2 space-x-reverse ${
                    sessionFormat === 'ONLINE' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>آنلاین (پلتفرم امن)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionFormat('IN_PERSON')}
                  className={`p-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-2 space-x-reverse ${
                    sessionFormat === 'IN_PERSON' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>حضوری (دفتر مرکز)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">انتخاب روز جلسه</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="1405/05/25">شنبه ۲۵ مرداد - ۱۴۰۵</option>
                <option value="1405/05/26">یکشنبه ۲۶ مرداد - ۱۴۰۵</option>
                <option value="1405/05/28">سه‌شنبه ۲۸ مرداد - ۱۴۰۵</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ساعت جلسه</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="15:00">۱۵:۰۰ تا ۱۶:۰۰</option>
                <option value="16:00">۱۶:۰۰ تا ۱۷:۰۰</option>
                <option value="17:30">۱۷:۳۰ تا ۱۸:۳۰</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {bookedSuccess ? (
              <div className="flex items-center space-x-1.5 space-x-reverse text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>نوبت جلسه با موفقیت رزرو گردید.</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">مدت هر جلسه: ۶۰ دقیقه تخصصی</span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              ثبت و قطعی کردن نوبت
            </button>
          </div>
        </form>
      </div>

      {/* Existing Booked Appointments */}
      {existingApts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">نوبت‌های فعال شما</h3>
          <div className="space-y-2">
            {existingApts.map((apt) => (
              <div key={apt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{apt.notes}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">زمان: {new Date(apt.scheduledAt).toLocaleDateString('fa-IR')} ساعت {new Date(apt.scheduledAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {apt.meetingUrl && (
                  <a
                    href={apt.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-teal-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-teal-700 transition"
                  >
                    ورود به اتاق جلسه
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
