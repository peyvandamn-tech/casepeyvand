import React, { useRef } from 'react';
import { useGsapContext } from '../../hooks/useGsapScrollTrigger';
import { gsap } from '../../lib/gsap';

interface CounterCardProps {
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  description: string;
  className?: string;
  icon?: React.ReactNode;
}

export const CounterCard: React.FC<CounterCardProps> = ({
  numericValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  description,
  className = '',
  icon,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGsapContext(
    () => {
      if (!numberRef.current || !containerRef.current) return;

      const obj = { val: 0 };

      gsap.to(obj, {
        val: numericValue,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 88%',
          once: true,
        },
        onUpdate: () => {
          if (numberRef.current) {
            const formatted = obj.val.toLocaleString('fa-IR', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
            numberRef.current.innerText = formatted;
          }
        },
      });

      // Subtle card rise
      gsap.from(containerRef.current, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 92%',
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl sm:text-3xl font-black text-teal-900 tracking-tight font-sans flex items-baseline gap-1">
          {prefix && <span className="text-teal-700 text-xl">{prefix}</span>}
          <span ref={numberRef} className="font-mono">
            ۰
          </span>
          {suffix && <span className="text-teal-700 text-lg font-bold">{suffix}</span>}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="text-xs font-extrabold text-slate-900 leading-snug">{label}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
