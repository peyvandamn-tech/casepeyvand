/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { ContentArticle } from '../../types';
import { BookOpen, Plus, Save, Eye, EyeOff } from 'lucide-react';

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 60) || `article-${Date.now()}`;
}

export const AdminContentManager: React.FC = () => {
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [editing, setEditing] = useState<Partial<ContentArticle> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const a = await StorageService.getAllArticles();
    setArticles(a);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => setEditing({ title: '', category: 'GENERAL', body: '', published: false });

  const handleSave = async () => {
    if (!editing?.title?.trim() || !editing.body?.trim()) {
      alert('عنوان و متن مقاله الزامی است.');
      return;
    }
    await StorageService.saveArticle({
      id: editing.id,
      slug: editing.slug || slugify(editing.title),
      title: editing.title,
      category: editing.category || 'GENERAL',
      coverImageUrl: editing.coverImageUrl,
      body: editing.body,
      published: editing.published ?? false,
    });
    setEditing(null);
    await load();
  };

  const togglePublish = async (article: ContentArticle) => {
    await StorageService.saveArticle({ ...article, published: !article.published });
    await load();
  };

  if (loading) return <div className="p-6 text-xs text-slate-500">در حال بارگذاری...</div>;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            مدیریت مجله آموزشی
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">مقالاتی که منتشر می‌کنید در «مجله» برای همه (حتی بازدیدکنندگان بدون ورود) قابل مشاهده‌اند.</p>
        </div>
        <button
          onClick={startNew}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          مقاله جدید
        </button>
      </div>

      {editing && (
        <div className="bg-white border border-teal-200 shadow-xs rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="عنوان مقاله"
            value={editing.title || ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
          />
          <input
            type="text"
            placeholder="دسته‌بندی (مثال: پیش از ازدواج)"
            value={editing.category || ''}
            onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
          <input
            type="text"
            placeholder="لینک تصویر کاور (اختیاری)"
            value={editing.coverImageUrl || ''}
            onChange={(e) => setEditing({ ...editing, coverImageUrl: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs dir-ltr text-left"
          />
          <textarea
            placeholder="متن کامل مقاله..."
            value={editing.body || ''}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-7"
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={editing.published ?? false}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
            />
            منتشر شود (برای همه قابل مشاهده باشد)
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              ذخیره
            </button>
            <button
              onClick={() => setEditing(null)}
              className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-xs rounded-xl divide-y divide-slate-100">
        {articles.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">هنوز مقاله‌ای ثبت نشده.</p>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{a.title}</div>
                <div className="text-[11px] text-slate-400">{a.category}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(a)}
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${
                    a.published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {a.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {a.published ? 'منتشرشده' : 'پیش‌نویس'}
                </button>
                <button
                  onClick={() => setEditing(a)}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ویرایش
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
