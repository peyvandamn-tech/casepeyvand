/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { ContentArticle } from '../../types';
import { BookOpen, Plus, Save, Eye, EyeOff, Sparkles, FileText, Image as ImageIcon, CheckCircle2, Tag } from 'lucide-react';

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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-500 font-medium">
      در حال بارگذاری مجله آموزشی...
    </div>
  );

  const publishedCount = articles.filter(a => a.published).length;

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-7 bg-slate-50/40">
      {/* Header Banner */}
      <div 
        id="admin-content-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-lg shadow-slate-900/10 border border-slate-700/60"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 backdrop-blur-md">
              <BookOpen className="w-3.5 h-3.5" />
              <span>مرکز انتشارات و مقالات روان‌شناختی</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              مدیریت مجله آموزشی و راهنماهای بالینی
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              مقالاتی که در این بخش منتشر می‌کنید در «مجله علمی پیوند امن» برای عموم مراجعین و بازدیدکنندگان نمایش داده می‌شود.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shadow-xs">
              <span className="block text-[11px] text-slate-300 font-medium">مقاله‌های منتشرشده</span>
              <span className="text-lg font-black text-teal-300 font-mono mt-0.5 block">
                {publishedCount} <span className="text-xs font-normal text-slate-400">از</span> {articles.length}
              </span>
            </div>

            <button
              onClick={startNew}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-3.5 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>مقاله جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modal / Inline Box */}
      {editing && (
        <div className="bg-white border border-teal-200/80 shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{editing.id ? 'ویرایش مقاله' : 'ثبت مقاله جدید در مجله'}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان مقاله</label>
              <input
                type="text"
                placeholder="عنوان جذاب و علمی مقاله..."
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">دسته‌بندی موضوعی</label>
              <input
                type="text"
                placeholder="مثال: پیش از ازدواج، روان‌شناسی زوجین"
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">لینک تصویر کاور (اختیاری)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={editing.coverImageUrl || ''}
              onChange={(e) => setEditing({ ...editing, coverImageUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">متن کامل مقاله</label>
            <textarea
              placeholder="متن محتوای مقاله آموزشی و توضیحات..."
              value={editing.body || ''}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.published ?? false}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 rounded-md border-slate-300"
              />
              <span>انتشار عمومی (در دسترس عموم مراجعین)</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره مقاله</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles List Table / Cards */}
      <div className="bg-white border border-slate-200/70 shadow-sm rounded-2xl overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">فهرست مقالات بارگذاری شده</span>
          <span className="text-[11px] text-slate-400 font-mono">تعداد کل: {articles.length}</span>
        </div>

        {articles.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">هنوز مقاله‌ای در مجله ثبت نشده است.</p>
        ) : (
          articles.map((a) => (
            <div key={a.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-bold text-slate-900 truncate">{a.title}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    {a.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">/{a.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(a)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    a.published 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                  }`}
                >
                  {a.published ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{a.published ? 'منتشرشده' : 'پیش‌نویس'}</span>
                </button>

                <button
                  onClick={() => setEditing(a)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
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

