/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Phone, UserCheck, ChevronLeft, Menu, X, ShieldCheck } from 'lucide-react';

interface LandingHeaderProps {
  currentUser?: User;
  onOpenOtpModal: () => void;
  onOpenContactModal: () => void;
  onNavigateTab: (tab: string) => void;
}

const NAV_LINKS = [
  { id: 'scientific-framework', label: 'چارچوب ۵ بعدی علمی' },
  { id: 'journey-section', label: 'فرآیند ۴ مرحله‌ای' },
  { id: 'confidentiality-charter', label: 'منشور رازداری' },
  { id: 'quick-assessment', label: 'خودارزیابی سریع' },
  { id: 'supervisor-info', label: 'درباره مشاور و مرکز' },
  { id: 'faq-section', label: 'پرسش‌های متداول' },
];

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  currentUser,
  onOpenOtpModal,
  onOpenContactModal,
  onNavigateTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-[#fcfaf6]/95 backdrop-blur-md border-b border-[#e7decb] shadow-xs'
          : 'bg-[#fcfaf6] border-b border-[#ece4d6]'
      }`}
    >
      {/* Top Clinical Reassurance Bar */}
      <div className="bg-[#124d4a] text-teal-100 text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span className="hidden sm:inline">
            سامانه تخصصی مشاوره پیش از ازدواج و همسان‌گزینی پیوند امن
          </span>
          <span className="sm:hidden">پیوند امن • peyvandamn.ir</span>
          <span className="text-teal-300/40 hidden md:inline">|</span>
          <span className="text-teal-200 hidden md:inline">
            نظارت مستقیم سرکار خانم مهناز خوینی (عضو سازمان نظام روان‌شناسی • پروانه تخصصی ۱۴۱۴۰۸۳)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:02144600980"
            className="flex items-center gap-1.5 text-teal-200 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-teal-300" />
            <span className="dir-ltr font-bold text-xs tracking-wider">۰۲۱-۴۴۶۰۰۹۸۰</span>
          </a>
          <button
            type="button"
            onClick={onOpenContactModal}
            className="text-[11px] text-teal-300 hover:text-white underline cursor-pointer hidden sm:inline"
          >
            نشانی کلینیک (تهران)
          </button>
        </div>
      </div>

      {/* Main 3-Zone Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 text-right group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 p-1 flex items-center justify-center shadow-xs">
              <img src="/logo-mark.png" alt="پیوند امن" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block">
                سامانه پیوند امن
              </span>
              <span className="text-[11px] text-slate-500 font-normal block">
                مرکز ارزیابی و همسان‌گزینی علمی
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
          {NAV_LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-slate-600 hover:text-teal-800 transition-colors cursor-pointer py-1.5"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 Primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                if (currentUser.role !== 'CLIENT') {
                  onNavigateTab('expert-dashboard');
                } else {
                  onNavigateTab('client-dashboard');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[40px]"
            >
              <UserCheck className="w-4 h-4 text-teal-200" />
              <span>ورود به داشبورد</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOtpModal}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer min-h-[40px]"
            >
              <span>ورود و تشکیل پرونده</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="منوی سامانه"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {NAV_LINKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="w-full text-right px-3 py-2.5 rounded-lg hover:bg-slate-50 font-semibold text-xs text-slate-800 flex items-center justify-between cursor-pointer"
            >
              <span>{item.label}</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContactModal();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-teal-700" />
              <span>تماس با مشاور: ۰۲۱-۴۴۶۰۰۹۸۰</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
