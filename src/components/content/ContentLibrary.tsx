/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storage';
import { ContentArticle } from '../../types';
import { BookOpen, ChevronRight, Calendar } from 'lucide-react';

export const ContentLibrary: React.FC = () => {
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [selected, setSelected] = useState<ContentArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.getPublishedArticles().then((a) => {
      setArticles(a);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-xs text-slate-500">در حال بارگذاری...</div>;
  }

  if (selected) {
    return (
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-3xl mx-auto w-full">
        <button
          onClick={() => setSelected(null)}
          className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1 mb-4"
        >
          <ChevronRight className="w-4 h-4" />
          بازگشت به مجله
        </button>
        {selected.coverImageUrl && (
          <img src={selected.coverImageUrl} alt={selected.title} className="w-full rounded-2xl mb-4 object-cover max-h-64" />
        )}
        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded-full">
          {selected.category}
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 mt-3 mb-2">{selected.title}</h1>
        <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-6">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(selected.createdAt).toLocaleDateString('fa-IR')}
          {selected.authorName && <span> • {selected.authorName}</span>}
        </div>
        <div className="prose prose-sm max-w-none text-slate-700 leading-8 whitespace-pre-line text-sm">
          {selected.body}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 mb-6">
        <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          مجله آموزشی پیوند امن
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">مقالات و راهنمایی‌های تخصصی درباره‌ی انتخاب همسر و زندگی مشترک.</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-10">هنوز مقاله‌ای منتشر نشده است.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="text-right bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-teal-200 transition group"
            >
              {a.coverImageUrl ? (
                <img src={a.coverImageUrl} alt={a.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white/80" />
                </div>
              )}
              <div className="p-4">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                  {a.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-teal-700 line-clamp-2">
                  {a.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{a.body.slice(0, 100)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
