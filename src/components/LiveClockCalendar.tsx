import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const LiveClockCalendar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close calendar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  // Format time and date
  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatted = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calendar calculations
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const monthName = calendarMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const isToday = (day: number) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Live Time & Date Pill Button */}
      <button
        onClick={() => setIsCalendarOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-sm hover:border-amber-400/60 hover:bg-slate-800 transition-all cursor-pointer group select-none"
        title="Click to view interactive calendar"
      >
        {/* Pulsing clock icon */}
        <div className="flex items-center gap-1.5 text-amber-400">
          <Clock className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
          <span className="font-mono text-xs font-bold tracking-wider text-amber-300">
            {timeFormatted}
          </span>
        </div>

        <span className="text-slate-600">|</span>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-200 text-xs font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>{dateFormatted}</span>
        </div>
      </button>

      {/* Interactive Calendar Dropdown */}
      {isCalendarOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#FF6B00]" />
              <span className="font-bold text-sm text-[#0F172A]">{monthName}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarMonth(new Date())}
                className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                title="Jump to Today"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mt-1 text-center text-xs">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <span key={`blank-${i}`} className="py-1.5 text-slate-200" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const today = isToday(day);

              return (
                <div
                  key={`day-${day}`}
                  className={`py-1.5 rounded-lg font-medium transition-colors cursor-default select-none ${
                    today
                      ? 'bg-gradient-to-br from-[#FF6B00] to-amber-500 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Footer with Live Clock */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Enterprise Business Hours</span>
            <span className="font-mono font-semibold text-[#0F172A]">{timeFormatted}</span>
          </div>

        </div>
      )}
    </div>
  );
};
