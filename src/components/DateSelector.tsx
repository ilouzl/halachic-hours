import React from 'react';
import { Calendar, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { formatHebrewAndGregorianDate } from '../utils/zmanim';

interface DateSelectorProps {
  dateStr: string; // YYYY-MM-DD
  onChangeDate: (newDateStr: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ dateStr, onChangeDate }) => {
  const { hebrewDate, gregorianFormatted, dayOfWeek } = formatHebrewAndGregorianDate(dateStr);

  const getTodayStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const handleStepDay = (delta: number) => {
    const current = new Date(`${dateStr}T12:00:00`);
    current.setDate(current.getDate() + delta);
    onChangeDate(current.toISOString().split('T')[0]);
  };

  const isToday = dateStr === getTodayStr();

  return (
    <div id="date-selector" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-base">{dayOfWeek}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-800 text-sm font-medium">{gregorianFormatted}</span>
            </div>
            {hebrewDate && (
              <p className="text-sm font-hebrew-serif font-bold text-amber-900 mt-0.5">
                {hebrewDate}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            id="btn-prev-day"
            type="button"
            onClick={() => handleStepDay(-1)}
            title="יום קודם"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <input
            id="date-input"
            type="date"
            value={dateStr}
            onChange={(e) => {
              if (e.target.value) onChangeDate(e.target.value);
            }}
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />

          <button
            id="btn-next-day"
            type="button"
            onClick={() => handleStepDay(1)}
            title="יום הבא"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              id="btn-go-today"
              type="button"
              onClick={() => onChangeDate(getTodayStr())}
              className="text-xs px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>היום</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
