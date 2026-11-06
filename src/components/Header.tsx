import React from 'react';
import { Crown, CheckCircle2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { LiveClockCalendar } from './LiveClockCalendar.tsx';

interface HeaderProps {
  lastSaved: Date | null;
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({ lastSaved }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm print:shadow-none print:border-b-2 print:border-slate-800">
      {/* Top micro-bar with enterprise accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0F172A] via-[#FF6B00] to-[#F59E0B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Top utility row with Live Clock & Calendar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Royal Wun&apos;zaligu POS &amp; Inventory System</span>
          </div>
          
          {/* Live Time and Calendar Component */}
          <div>
            <LiveClockCalendar />
          </div>
        </div>

        {/* Center Logo & Enterprise Branding */}
        <div className="flex flex-col items-center text-center pt-3">
          
          {/* Logo badge with Crown icon */}
          <div className="relative group mb-2.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border-2 border-amber-200/60 transform transition-transform group-hover:scale-105">
              <Crown className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.2} />
            </div>
            {/* Sparkle/dot accent */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF6B00] border-2 border-white"></span>
            </span>
          </div>

          {/* Company Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A]">
            ROYAL WUN&apos;ZALIGU ENTERPRISE
          </h1>

          {/* Subtitle with Orange Accent Tag */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-50 text-[#FF6B00] border border-orange-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              Official Inventory &amp; Stock Valuation
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Hardware, Building Materials &amp; Construction Supplies
            </span>
          </div>

          {/* Live system indicators */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 print:hidden">
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-saved to device</span>
              {lastSaved && (
                <span className="text-emerald-600/80 font-normal">
                  ({lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                </span>
              )}
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F172A]" />
              <span>Live Excel Engine (GHS Currency)</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Enterprise Ledger</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
