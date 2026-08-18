/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Introduction, Message, Case, User, FamilyMeeting, VideoCallInvite, IntroductionFeedback } from '../../types';
import { StorageService } from '../../services/storage';
import { Heart, MessageSquare, PhoneCall, ShieldAlert, CheckCircle2, Send, Lock, UserCheck, ChevronLeft, Video, Users2, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface IntroductionsViewProps {
  activeCase?: Case;
  currentCase?: Case;
  currentUser?: User;
  userId?: string;
  introductions?: Introduction[];
  onConsentIntroduction?: (introId: string) => void;
  onSendMessage?: (introId: string, text: string) => void;
}

export const IntroductionsView: React.FC<IntroductionsViewProps> = ({
  activeCase,
  currentCase,
  currentUser,
  userId: propUserId,
  introductions: propIntros,
  onConsentIntroduction,
  onSendMessage,
}) => {
  const cCase = activeCase || currentCase;
  const userId = propUserId || currentUser?.id || 'user-sara';

  const [fetchedIntros, setFetchedIntros] = useState<Introduction[]>([]);
  useEffect(() => {
    if (propIntros) return;
    (cCase ? StorageService.getIntroductionsForCase(cCase.id) : StorageService.getIntroductions()).then(
      setFetchedIntros
    );
  }, [propIntros, cCase?.id]);

  const intros = propIntros || fetchedIntros;
  const [selectedIntroId, setSelectedIntroId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<string>('');

  useEffect(() => {
    if (selectedIntroId === null && intros.length > 0) {
      setSelectedIntroId(intros[0].id);
    }
  }, [intros, selectedIntroId]);

  const selectedIntro = intros.find((i) => i.id === selectedIntroId) || intros[0];

  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (!selectedIntro) {
      setMessages([]);
      return;
    }
    StorageService.getMessagesByIntroId(selectedIntro.id).then(setMessages);
  }, [selectedIntro?.id]);

  // Family meeting, video call, and post-introduction feedback — all scoped
  // to the currently selected introduction.
  const [familyMeetings, setFamilyMeetings] = useState<FamilyMeeting[]>([]);
  const [videoCalls, setVideoCalls] = useState<VideoCallInvite[]>([]);
  const [myFeedback, setMyFeedback] = useState<IntroductionFeedback | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<{ metInPerson: boolean; wantsToContinue: boolean | null; rating: number; comments: string }>({
    metInPerson: false,
    wantsToContinue: null,
    rating: 0,
    comments: '',
  });

  useEffect(() => {
    if (!selectedIntro) {
      setFamilyMeetings([]);
      setVideoCalls([]);
      setMyFeedback(null);
      return;
    }
    StorageService.getFamilyMeetingsForIntroduction(selectedIntro.id).then(setFamilyMeetings);
    StorageService.getVideoCallInvitesForIntroduction(selectedIntro.id).then(setVideoCalls);
    StorageService.getFeedbackForIntroduction(selectedIntro.id).then((all) => {
      const mine = all.find((f) => f.caseId === cCase?.id) || null;
      setMyFeedback(mine);
      if (mine) {
        setFeedbackDraft({
          metInPerson: mine.metInPerson,
          wantsToContinue: mine.wantsToContinue ?? null,
          rating: mine.rating || 0,
          comments: mine.comments || '',
        });
      }
    });
  }, [selectedIntro?.id, cCase?.id]);

  // Determine if current case is Case A or Case B
  const isCaseA = cCase ? selectedIntro?.caseAId === cCase.id : true;
  const myPreview = isCaseA ? selectedIntro?.anonymousPreviewA : selectedIntro?.anonymousPreviewB;
  const partnerPreview = isCaseA ? selectedIntro?.anonymousPreviewB : selectedIntro?.anonymousPreviewA;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedIntro) return;

    if (onSendMessage) {
      await onSendMessage(selectedIntro.id, messageText.trim());
    } else {
      const msg = await StorageService.addMessage(
        selectedIntro.id,
        userId,
        myPreview?.firstName || 'مراجع',
        messageText.trim()
      );
      setMessages((prev) => [...prev, msg]);
    }
    setMessageText('');
  };

  const handleRequestContactExchange = async () => {
    if (!selectedIntro) return;
    const updated = { ...selectedIntro };
    if (isCaseA) {
      updated.contactExchangeRequestedByA = true;
    } else {
      updated.contactExchangeRequestedByB = true;
    }

    if (updated.contactExchangeRequestedByA && updated.contactExchangeRequestedByB) {
      updated.contactExchangeApprovedAt = new Date().toISOString();
      alert('رضایت دوطرفه جهت تبادل اطلاعات تماس ثبت گردید. شماره تماس از طریق پیامک ارسال می‌شود.');
    } else {
      alert('درخواست تبادل شماره تماس شما ثبت گردید. پس از اعلام موافقت طرف مقابل، اطلاعات تماس منتقل می‌شود.');
    }

    await StorageService.saveIntroduction(updated);
    setFetchedIntros((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleRequestVideoCall = async () => {
    if (!selectedIntro || !cCase) return;
    const invite = await StorageService.requestVideoCall(selectedIntro.id, cCase.id);
    setVideoCalls((prev) => [...prev, invite]);
  };

  const handleRespondVideoCall = async (invite: VideoCallInvite, status: VideoCallInvite['status']) => {
    await StorageService.updateVideoCallStatus(invite.id, status);
    setVideoCalls((prev) => prev.map((v) => (v.id === invite.id ? { ...v, status } : v)));
  };

  const handleConfirmFamilyMeeting = async (meeting: FamilyMeeting) => {
    await StorageService.updateFamilyMeetingStatus(meeting.id, 'CONFIRMED');
    setFamilyMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: 'CONFIRMED' } : m)));
  };

  const handleSubmitFeedback = async () => {
    if (!selectedIntro || !cCase) return;
    await StorageService.submitIntroductionFeedback({
      introductionId: selectedIntro.id,
      caseId: cCase.id,
      metInPerson: feedbackDraft.metInPerson,
      wantsToContinue: feedbackDraft.wantsToContinue ?? undefined,
      rating: feedbackDraft.rating || undefined,
      comments: feedbackDraft.comments || undefined,
    });
    setMyFeedback({
      id: myFeedback?.id || '',
      introductionId: selectedIntro.id,
      caseId: cCase.id,
      metInPerson: feedbackDraft.metInPerson,
      wantsToContinue: feedbackDraft.wantsToContinue ?? undefined,
      rating: feedbackDraft.rating || undefined,
      comments: feedbackDraft.comments || undefined,
      submittedAt: new Date().toISOString(),
    });
    alert('بازخورد شما ثبت شد. سپاسگزاریم.');
  };

  if (intros.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl inline-flex">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-slate-900">در حال حاضر معرفی فعالی برای شما ثبت نشده است</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          پس از تکمیل آزمون‌ها و تایید متخصص (خانم مهناز خوینی)، موارد دارای همخوانی بالایی برای شما پیشنهاد شده و پس از تایید دوطرفه در این صفحه نمایش داده می‌شوند.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 p-4 md:p-6 overflow-y-auto">
      {/* Top Banner Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3 space-x-reverse">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">حریم خصوصی و نحوه آشنایی اولیه:</span>
          <p className="text-[11px] text-amber-800 mt-0.5">
            اطلاعات نمایش‌داده‌شده تنها شامل خلاصه‌ای از معیارهای فردی و ارزش‌های مورد تایید متخصص می‌باشد. جزییات آزمون‌های روانشناختی و شماره تلفن شخصی تا زمان موافقت صریح طرفین کاملاً محفوظ می‌ماند.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intro Cards List */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 px-1">لیست معرفی‌های تاییدشده</h3>
          {intros.map((intro) => {
            const partner = cCase ? (intro.caseAId === cCase.id ? intro.anonymousPreviewB : intro.anonymousPreviewA) : intro.anonymousPreviewB;
            const isSelected = intro.id === selectedIntroId;
            return (
              <div
                key={intro.id}
                onClick={() => setSelectedIntroId(intro.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                      {partner?.firstName?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{partner?.firstName || 'کاندید'} ({partner?.age || 28} ساله)</h4>
                      <p className="text-[10px] text-slate-500">{partner?.city || 'تهران'} • {partner?.educationLevel || 'کارشناسی'}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    تایید متخصص
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{partner?.shortBio}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Card & Chat */}
        {selectedIntro && partnerPreview && (
          <div className="lg:col-span-2 space-y-6">
            {/* Anonymized Profile Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl font-bold text-sm">
                    {partnerPreview.firstName}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{partnerPreview.firstName} ({partnerPreview.age} ساله)</h3>
                    <p className="text-xs text-slate-500">{partnerPreview.city} • رده شغلی: {partnerPreview.occupationCategory}</p>
                  </div>
                </div>

                <button
                  onClick={handleRequestContactExchange}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 space-x-reverse"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    {selectedIntro.contactExchangeApprovedAt
                      ? 'اطلاعات تماس منتقل شد'
                      : (isCaseA ? selectedIntro.contactExchangeRequestedByA : selectedIntro.contactExchangeRequestedByB)
                      ? 'درخواست تبادل شماره ثبت شد'
                      : 'درخواست تبادل شماره تماس'}
                  </span>
                </button>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-700 mb-1">معرفی کوتاه:</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {partnerPreview.shortBio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-700 mb-2">ارزش‌ها و محورهای کلیدی مورد تایید متخصص:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {partnerPreview.keyValues?.map((val, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-teal-100">
                      ✓ {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Internal Messaging System */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-xs text-slate-900">گفتگو و آشنایی اولیه درون‌سامانه‌ای</h4>
                </div>
                <span className="text-[10px] text-slate-400">نظارت مدیریت بر موازین اخلاقی</span>
              </div>

              {/* Message List */}
              <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-slate-50/70 rounded-xl border border-slate-100">
                {messages.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-6">پیامی جهت شروع گفتگو ارسال نشده است. اولین پیام را ارسال کنید.</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderUserId === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-teal-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span className={`block text-[9px] ${isMe ? 'text-teal-200' : 'text-slate-400'} text-left dir-ltr`}>
                            {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex space-x-2 space-x-reverse pt-2">
                <input
                  type="text"
                  placeholder="پیام خود را بنویسید..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold p-2.5 rounded-xl transition shadow-xs"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              </form>
            </div>

            {/* Secure In-App Video Call */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Video className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-xs text-slate-900">تماس تصویری امن (بدون افشای شماره تماس)</h4>
              </div>
              {videoCalls.length === 0 ? (
                <button
                  onClick={handleRequestVideoCall}
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  درخواست تماس تصویری
                </button>
              ) : (
                videoCalls.map((vc) => {
                  const requestedByMe = vc.requestedByCaseId === cCase?.id;
                  return (
                    <div key={vc.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs flex items-center justify-between gap-3">
                      <span className="text-slate-600">
                        {vc.status === 'REQUESTED' && (requestedByMe ? 'در انتظار پاسخ طرف مقابل' : 'درخواست تماس تصویری از طرف مقابل')}
                        {vc.status === 'ACCEPTED' && 'تماس تایید شده — می‌توانید وارد شوید'}
                        {vc.status === 'DECLINED' && 'درخواست تماس رد شد'}
                        {vc.status === 'COMPLETED' && 'تماس برگزار شد'}
                      </span>
                      {vc.status === 'REQUESTED' && !requestedByMe && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleRespondVideoCall(vc, 'ACCEPTED')}
                            className="bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-lg"
                          >
                            پذیرش
                          </button>
                          <button
                            onClick={() => handleRespondVideoCall(vc, 'DECLINED')}
                            className="bg-slate-200 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg"
                          >
                            رد
                          </button>
                        </div>
                      )}
                      {vc.status === 'ACCEPTED' && (
                        <a
                          href={`https://meet.jit.si/${vc.roomSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-teal-600 text-white font-bold px-3 py-1.5 rounded-lg shrink-0"
                        >
                          ورود به تماس
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Family Introduction Meeting */}
            {familyMeetings.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users2 className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-xs text-slate-900">جلسه معارفه خانوادگی</h4>
                </div>
                {familyMeetings.map((m) => (
                  <div key={m.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">
                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('fa-IR') : 'زمان هنوز مشخص نشده'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status === 'PROPOSED' ? 'پیشنهادشده' : m.status === 'CONFIRMED' ? 'تایید شده' : m.status}
                      </span>
                    </div>
                    {m.location && <p className="text-slate-500">مکان: {m.location}</p>}
                    {m.status === 'PROPOSED' && (
                      <button
                        onClick={() => handleConfirmFamilyMeeting(m)}
                        className="mt-1 text-[11px] font-bold bg-teal-600 text-white px-3 py-1.5 rounded-lg"
                      >
                        تایید حضور
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post-Introduction Feedback */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs text-slate-900">بازخورد شما به این آشنایی</h4>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={feedbackDraft.metInPerson}
                  onChange={(e) => setFeedbackDraft({ ...feedbackDraft, metInPerson: e.target.checked })}
                />
                حضوری یا تصویری ملاقات داشته‌ایم
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedbackDraft({ ...feedbackDraft, wantsToContinue: true })}
                  className={`flex-1 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    feedbackDraft.wantsToContinue === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  مایل به ادامه هستم
                </button>
                <button
                  onClick={() => setFeedbackDraft({ ...feedbackDraft, wantsToContinue: false })}
                  className={`flex-1 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    feedbackDraft.wantsToContinue === false ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  مایل به ادامه نیستم
                </button>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFeedbackDraft({ ...feedbackDraft, rating: n })}
                    className={n <= feedbackDraft.rating ? 'text-amber-500' : 'text-slate-300'}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="توضیح تکمیلی (اختیاری)..."
                value={feedbackDraft.comments}
                onChange={(e) => setFeedbackDraft({ ...feedbackDraft, comments: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                onClick={handleSubmitFeedback}
                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl"
              >
                {myFeedback ? 'به‌روزرسانی بازخورد' : 'ثبت بازخورد'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
