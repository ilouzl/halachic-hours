import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Clock, Calculator, Sparkles, Sun, Moon, ArrowDown } from 'lucide-react';
import { ShaahZmanitResult } from '../types';
import { convertRelativeTimeToClock, convertClockTimeToRelative, formatClockTime } from '../utils/zmanim';

interface ConverterWidgetProps {
  result: ShaahZmanitResult;
}

export const ConverterWidget: React.FC<ConverterWidgetProps> = ({ result }) => {
  // Mode: 'relativeToClock' (default per user prompt) or 'clockToRelative'
  const [mode, setMode] = useState<'relativeToClock' | 'clockToRelative'>('relativeToClock');

  // Relative to Clock inputs
  const [period, setPeriod] = useState<'day' | 'night'>('day');
  const [relHours, setRelHours] = useState<number>(6);
  const [relMinutes, setRelMinutes] = useState<number>(23);

  // Clock to Relative input
  const [clockInput, setClockInput] = useState<string>('12:00');

  // Fast presets for Relative to Clock
  const relativePresets = [
    { label: '6:23 ביום (דוגמת המשתמש)', period: 'day' as const, h: 6, m: 23 },
    { label: '3:00 (סוזק״ש)', period: 'day' as const, h: 3, m: 0 },
    { label: '4:00 (סו״ז תפילה)', period: 'day' as const, h: 4, m: 0 },
    { label: '6:00 (חצות)', period: 'day' as const, h: 6, m: 0 },
    { label: '6:30 (מנחה גדולה)', period: 'day' as const, h: 6, m: 30 },
    { label: '9:30 (מנחה קטנה)', period: 'day' as const, h: 9, m: 30 },
    { label: '10:45 (פלג המנחה)', period: 'day' as const, h: 10, m: 45 },
    { label: '12:00 (שקיעה)', period: 'day' as const, h: 12, m: 0 },
  ];

  // Calculate Real Clock Time from relative input
  const relativeToClockResult = useMemo(() => {
    return convertRelativeTimeToClock(result, period, relHours, relMinutes);
  }, [result, period, relHours, relMinutes]);

  // Calculate Relative Time from real clock input
  const clockToRelativeResult = useMemo(() => {
    const [hStr, mStr] = clockInput.split(':');
    const h = parseInt(hStr || '12', 10);
    const m = parseInt(mStr || '00', 10);
    const targetDate = new Date(`${result.dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    return convertClockTimeToRelative(result, targetDate);
  }, [result, clockInput]);

  return (
    <div id="converter-widget" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      {/* Header and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              מחשבון המרת שעה זמנית
            </h2>
            <p className="text-xs text-slate-500">
              המרת שעה זמנית לשעה רגילה בשעון (24 שעות) ולהפך
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            id="tab-rel-to-clock"
            type="button"
            onClick={() => setMode('relativeToClock')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              mode === 'relativeToClock'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            שעה זמנית ← שעה אמיתית
          </button>
          <button
            id="tab-clock-to-rel"
            type="button"
            onClick={() => setMode('clockToRelative')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              mode === 'clockToRelative'
                ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            שעה אמיתית ← שעה זמנית
          </button>
        </div>
      </div>

      {/* Mode 1: Relative Hour to Real Clock Time */}
      {mode === 'relativeToClock' && (
        <div className="mt-4 space-y-5">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Day / Night Toggle */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                תקופת היממה
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  id="btn-period-day"
                  onClick={() => setPeriod('day')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    period === 'day'
                      ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>ביום</span>
                </button>
                <button
                  type="button"
                  id="btn-period-night"
                  onClick={() => setPeriod('night')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    period === 'night'
                      ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>בלילה</span>
                </button>
              </div>
            </div>

            {/* Relative Hour & Minute Inputs */}
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                הזן שעה זמנית (שעות : דקות)
              </label>
              <div className="flex items-center gap-3">
                {/* Hours */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="input-rel-hour"
                      type="number"
                      min={0}
                      max={12}
                      value={relHours}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(12, parseInt(e.target.value || '0', 10)));
                        setRelHours(val);
                      }}
                      className="w-full text-center py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">
                      שעות (0-12)
                    </span>
                  </div>
                </div>

                <span className="text-2xl font-bold text-slate-400 pb-4">:</span>

                {/* Minutes */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="input-rel-minute"
                      type="number"
                      min={0}
                      max={59}
                      value={relMinutes}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10)));
                        setRelMinutes(val);
                      }}
                      className="w-full text-center py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">
                      דקות (0-59)
                    </span>
                  </div>
                </div>

                {/* Direct Slider to interactively adjust */}
                <div className="hidden lg:block flex-2">
                  <input
                    type="range"
                    min={0}
                    max={720}
                    value={relHours * 60 + relMinutes}
                    onChange={(e) => {
                      const totalMin = parseInt(e.target.value, 10);
                      setRelHours(Math.floor(totalMin / 60));
                      setRelMinutes(totalMin % 60);
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block text-center mt-1">
                    גרירה רציפה: שעה {relHours}:{String(relMinutes).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-slate-500 font-medium">זמנים נפוצים:</span>
            {relativePresets.map((p, idx) => {
              const active = period === p.period && relHours === p.h && relMinutes === p.m;
              return (
                <button
                  key={idx}
                  id={`preset-${p.h}-${p.m}`}
                  type="button"
                  onClick={() => {
                    setPeriod(p.period);
                    setRelHours(p.h);
                    setRelMinutes(p.m);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    active
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Result Banner */}
          <div
            id="conversion-result-box"
            className="p-5 rounded-xl border border-slate-200 bg-linear-to-r from-amber-50/70 via-white to-amber-50/30 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  תוצאת ההמרה
                </span>
                <div className="text-sm text-slate-600 mt-0.5">
                  שעה זמנית <strong className="text-slate-900 font-mono text-base inline-block" dir="ltr">{relHours}:{String(relMinutes).padStart(2, '0')}</strong> {period === 'day' ? 'ביום' : 'בלילה'} שווה לשעה:
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-4xl font-black text-amber-950 font-mono tracking-tight inline-block" dir="ltr">
                  {relativeToClockResult.clockFormatted}
                </div>
                <div className="text-xs text-slate-500 font-mono" dir="ltr">
                  דיוק בשניות: {relativeToClockResult.clockFormattedWithSeconds}
                </div>
              </div>
            </div>

            {/* Explanation formula */}
            <div className="mt-3 pt-3 border-t border-amber-100/80 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{relativeToClockResult.explanation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Real Clock Time to Relative Hour */}
      {mode === 'clockToRelative' && (
        <div className="mt-4 space-y-4">
          <div className="max-w-md">
            <label htmlFor="input-clock-time" className="block text-xs font-semibold text-slate-700 mb-1.5">
              הזן שעה רגילה בשעון (24 שעות)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-clock-time"
                type="time"
                value={clockInput}
                onChange={(e) => setClockInput(e.target.value)}
                dir="ltr"
                style={{ direction: 'ltr' }}
                className="text-xl font-bold font-mono px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-center"
              />
              <button
                type="button"
                id="btn-clock-now"
                onClick={() => {
                  const now = new Date();
                  setClockInput(formatClockTime(now));
                }}
                className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors"
              >
                שעה נוכחית
              </button>
            </div>
          </div>

          {/* Reverse Result Banner */}
          <div className="p-5 rounded-xl border border-slate-200 bg-linear-to-r from-indigo-50/70 via-white to-indigo-50/30 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                  תוצאת ההמרה
                </span>
                <div className="text-sm text-slate-600 mt-0.5">
                  השעה <strong className="text-slate-900 font-mono text-base inline-block" dir="ltr">{clockInput}</strong> בשעון שווה לשעה זמנית:
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-3xl font-black text-indigo-950 font-mono inline-block" dir="ltr">
                  {clockToRelativeResult.relativeFormatted}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  (שעה {clockToRelativeResult.relativeHour} ו-{clockToRelativeResult.relativeMinute} דקות זמניות)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
