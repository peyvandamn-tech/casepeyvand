/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Profile } from '../../types';
import { StorageService } from '../../services/storage';
import { User, Save, CheckCircle2, Heart, Scale, Home, Briefcase, Users2 } from 'lucide-react';

interface ProfileFormProps {
  caseId: string;
  userId: string;
  existingProfile?: Profile;
  onSaved: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  caseId,
  userId,
  existingProfile,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'BASE' | 'LIFESTYLE' | 'GOALS' | 'CRITERIA'>('BASE');

  const [formData, setFormData] = useState<Partial<Profile>>(
    existingProfile || {
      userId,
      caseId,
      age: undefined,
      city: '',
      province: '',
      education: 'کارشناسی',
      fieldOfStudy: '',
      jobTitle: '',
      maritalStatus: 'SINGLE',
      hasChildren: false,
      childrenCount: 0,
      height: undefined,
      workingHoursPerDay: undefined,
      hobbies: [],
      livingArrangement: '',
      migrationIntention: 'NEVER',
      socialStyle: '',
      marriageGoal: '',
      expectedTimelineMonths: undefined,
      desireForChildren: 'OPEN_TO_DISCUSS',
      preferredLivingLocation: '',
      familyRelationshipStyle: '',
      familyDependencyLevel: 'MODERATE',
      familyExpectations: '',
      financialAttitude: '',
      monthlyIncomeRange: '',
      housingStatus: '',
      criteria: {
        minAge: 25,
        maxAge: 35,
        targetCities: [],
        educationRequired: '',
        acceptChildren: true,
        acceptPreviousMarriage: true,
        desireForChildrenRequirement: 'DONT_CARE',
        hardCriteriaNotes: '',
        softPreferences: [],
      },
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!formData.age || !formData.city?.trim() || !formData.education || !formData.jobTitle?.trim()) {
      setSaveError('لطفاً حداقل سن، شهر، تحصیلات و شغل را در «مشخصات پایه» تکمیل کنید.');
      setActiveTab('BASE');
      return;
    }

    setSaving(true);
    try {
      await StorageService.saveProfile(formData as Profile);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSaved();
      }, 1200);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError('ذخیره‌سازی با خطا مواجه شد. اتصال اینترنت خود را بررسی و دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">تکمیل اطلاعات فردی و معیارهای ازدواج</h2>
          <p className="text-xs text-slate-500">اطلاعات وارد شده جهت ارزیابی همخوانی اولیه در الگوریتم و بررسی متخصص استفاده می‌شود.</p>
        </div>
        <div className="flex space-x-2 space-x-reverse text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('BASE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'BASE' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            مشخصات پایه
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIFESTYLE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'LIFESTYLE' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            سبک زندگی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GOALS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'GOALS' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            اهداف ازدواج
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CRITERIA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'CRITERIA' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            معیارهای همسر (Hard & Soft)
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: BASE INFO */}
        {activeTab === 'BASE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">سن (سال)</label>
              <input
                type="number"
                value={formData.age ?? ''}
                placeholder="مثال: ۲۹"
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">شهر محل سکونت</label>
              <input
                type="text"
                value={formData.city || ''}
                placeholder="مثال: تهران"
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">میزان تحصیلات</label>
              <select
                value={formData.education || ''}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="دیپلم">دیپلم</option>
                <option value="کاردانی">کاردانی</option>
                <option value="کارشناسی">کارشناسی</option>
                <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                <option value="دکتری">دکتری</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رشته تحصیلی</label>
              <input
                type="text"
                value={formData.fieldOfStudy || ''}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">عنوان شغلی</label>
              <input
                type="text"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">وضعیت تأهل قبلی</label>
              <select
                value={formData.maritalStatus || 'SINGLE'}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="SINGLE">مجرد (بدون سابقه ازدواج)</option>
                <option value="DIVORCED">مطلقه (جداشده)</option>
                <option value="WIDOWED">همسر فوت‌شده</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">قد (سانتی‌متر)</label>
              <input
                type="number"
                value={formData.height ?? ''}
                placeholder="مثال: ۱۷۵"
                onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: LIFESTYLE & FAMILY */}
        {activeTab === 'LIFESTYLE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ساعات کاری روزانه</label>
              <input
                type="number"
                value={formData.workingHoursPerDay ?? ''}
                placeholder="مثال: ۸"
                onChange={(e) => setFormData({ ...formData, workingHoursPerDay: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">تصمیم/برنامه مهاجرت به خارج</label>
              <select
                value={formData.migrationIntention || 'NEVER'}
                onChange={(e) => setFormData({ ...formData, migrationIntention: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="NEVER">اصلاً قصد مهاجرت ندارم</option>
                <option value="CONSIDERING">در صورت فراهم شدن شرایط بررسی می‌کنم</option>
                <option value="DEFINITE_PLAN">برنامه قطعی مهاجرت دارم</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">وضعیت فعلی محل سکونت</label>
              <input
                type="text"
                value={formData.livingArrangement || ''}
                onChange={(e) => setFormData({ ...formData, livingArrangement: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">سبک ارتباط با خانواده</label>
              <input
                type="text"
                value={formData.familyRelationshipStyle || ''}
                onChange={(e) => setFormData({ ...formData, familyRelationshipStyle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">علایق و تفریحات اصلی</label>
              <input
                type="text"
                value={(formData.hobbies || []).join('، ')}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value.split('،') })}
                placeholder="با کاما جدا کنید (مثال: مطالعه، کوهنوردی، سفرهای داخلی)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: MARRIAGE GOALS */}
        {activeTab === 'GOALS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">نگرش و تمایل به فرزندآوری</label>
              <select
                value={formData.desireForChildren || 'DEFINITE_YES'}
                onChange={(e) => setFormData({ ...formData, desireForChildren: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-800"
              >
                <option value="DEFINITE_YES">تمایل قطعی به فرزندآوری دارم</option>
                <option value="OPEN_TO_DISCUSS">قابل گفتگو در آینده با همسر</option>
                <option value="DEFINITE_NO">اصلاً تمایلی به فرزندآوری ندارم (مخالف قطعی)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">افق زمانی مورد انتظار تا ازدواج (ماه)</label>
              <input
                type="number"
                value={formData.expectedTimelineMonths ?? ''}
                placeholder="مثال: ۶"
                onChange={(e) => setFormData({ ...formData, expectedTimelineMonths: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">هدف اصلی شما از ازدواج</label>
              <textarea
                rows={3}
                value={formData.marriageGoal || ''}
                placeholder="در چند جمله بنویسید هدف و انتظار اصلی‌تان از ازدواج چیست..."
                onChange={(e) => setFormData({ ...formData, marriageGoal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* TAB 4: SPOUSE CRITERIA (HARD & SOFT) */}
        {activeTab === 'CRITERIA' && (
          <div className="space-y-4 text-xs">
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-3">
              <h4 className="font-bold text-rose-900 text-sm flex items-center space-x-1.5 space-x-reverse">
                <Scale className="w-4 h-4 text-rose-700" />
                <span>معیارهای سخت و غیرقابل تعارض (Hard Criteria)</span>
              </h4>
              <p className="text-[11px] text-rose-700">تطبیق نیافتن این معیارها منجر به عدم پیشنهاد معرفی (Hard Conflict) در الگوریتم خواهد شد.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الزام فرزندآوری طرف مقابل</label>
                  <select
                    value={formData.criteria?.desireForChildrenRequirement || 'MUST_WANT'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criteria: { ...formData.criteria!, desireForChildrenRequirement: e.target.value as any },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-900"
                  >
                    <option value="MUST_WANT">حتماً باید تمایل به فرزندآوری داشته باشد</option>
                    <option value="DONT_CARE">فرقی نمی‌کند / قابل گفتگو است</option>
                    <option value="MUST_NOT_WANT">حتماً نباید تمایل به فرزندآوری داشته باشد</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">پذیرش سابقه ازدواج قبلی طرف مقابل</label>
                  <select
                    value={formData.criteria?.acceptPreviousMarriage ? 'YES' : 'NO'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criteria: { ...formData.criteria!, acceptPreviousMarriage: e.target.value === 'YES' },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="NO">خیر، سابقه ازدواج قبلی را نمی‌پذیرم</option>
                    <option value="YES">بله، سابقه ازدواج قبلی قابل بررسی است</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">حداقل و حداکثر سن مدنظر همسر</label>
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="number"
                      placeholder="از"
                      value={formData.criteria?.minAge || 24}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          criteria: { ...formData.criteria!, minAge: Number(e.target.value) },
                        })
                      }
                      className="w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="تا"
                      value={formData.criteria?.maxAge || 35}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          criteria: { ...formData.criteria!, maxAge: Number(e.target.value) },
                        })
                      }
                      className="w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">سایر خطوط قرمز غیرقابل تعامل</label>
                  <input
                    type="text"
                    value={formData.criteria?.hardCriteriaNotes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        criteria: { ...formData.criteria!, hardCriteriaNotes: e.target.value },
                      })
                    }
                    placeholder="مثال: عدم سیگار و اعتیاد به صورت قطعی"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess ? (
            <div className="flex items-center space-x-1.5 space-x-reverse text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>پروفایل با موفقیت در پرونده ذخیره شد.</span>
            </div>
          ) : saveError ? (
            <div className="flex items-center space-x-1.5 space-x-reverse text-rose-600 font-bold text-xs">
              <span>{saveError}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">آخرین بروزرسانی پرونده: امروز</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-2 space-x-reverse"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات پرونده'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
