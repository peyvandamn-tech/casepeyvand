import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import {
  Phone,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  Award,
  LockKeyhole,
  Compass,
} from 'lucide-react';

interface LandingHeaderProps {
  currentUser?: User;
  onOpenOtpModal: () => void;
  onOpenContactModal: () => void;
  onNavigateTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'scientific-framework', label: 'سنجش ۵ بعدی علمی' },
  { id: 'journey-section', label: 'مسیر ۵ مرحله‌ای' },
  { id: 'compass-section', label: 'تست آنلاین همسانی' },
  { id: 'comparison-section', label: 'تفاوت با سنتی' },
  { id: 'director', label: 'درباره خانم خوینی' },
  { id: 'faq', label: 'پرسش‌های متداول' },
  { id: 'contact', label: 'تماس و نشانی' },
];

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  currentUser,
  onOpenOtpModal,
  onOpenContactModal,
  onNavigateTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const sectionIds = NAV_ITEMS.map((item) => item.id);
  const activeSectionId = useScrollSpy(sectionIds, 150);

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
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm'
          : 'bg-white/90 backdrop-blur-xs border-b border-slate-200/60'
      }`}
    >
      {/* Top micro-bar with clinic trust indicators */}
      <div className="bg-teal-950 text-teal-100 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="hidden sm:inline">سامانه رسمی ارزیابی و مشاوره پیش از ازدواج پیوند امن</span>
          <span className="sm:hidden">سامانه پیوند امن • peyvandamn.ir</span>
          <span className="text-teal-400/60 hidden md:inline">|</span>
          <span className="text-teal-300 hidden md:inline">
            تحت نظارت مستقیم سرکار خانم مهناز خوینی (عضو سازمان نظام روان‌شناسی • پروانه ۱۴۱۴۰۸۳)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="tel:02144600980"
            className="flex items-center gap-1 text-teal-300 hover:text-white font-mono transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span className="dir-ltr font-bold">۰۲۱-۴۴۶۰۰۹۸۰</span>
          </a>
          <button
            type="button"
            onClick={onOpenContactModal}
            className="text-[10px] text-teal-200 hover:text-white underline cursor-pointer hidden sm:inline"
          >
            نشانی کلینیک (تهران)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-right group cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img src="/logo-mark.png" alt="پیوند امن" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">پیوند امن</span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                  تخصصی ازدواج
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                مرکز ارزیابی روان‌شناختی و معرفی همسان
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSectionId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-teal-900 bg-teal-100/70 font-black'
                    : 'text-slate-700 hover:text-teal-800 hover:bg-teal-50/50'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-teal-800 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions (Login / Portal / Contact) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenContactModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200 font-bold text-xs transition cursor-pointer min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 text-teal-700" />
            <span>مشاوره تلفنی</span>
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                if (currentUser.role !== 'CLIENT') {
                  onNavigateTab('admin-overview');
                } else {
                  onNavigateTab('client-dashboard');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-xs transition cursor-pointer min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>ورود به پنل کاربری</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOtpModal}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <span>تشکیل پرونده / ورود</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="منوی سایت"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="w-full text-right px-4 py-3 rounded-xl hover:bg-slate-50 font-bold text-xs text-slate-800 flex items-center justify-between min-h-[44px]"
            >
              <span>{item.label}</span>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContactModal();
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Phone className="w-4 h-4 text-teal-700" />
              <span>تماس مستقیم با کلینیک: ۰۲۱-۴۴۶۰۰۹۸۰</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
