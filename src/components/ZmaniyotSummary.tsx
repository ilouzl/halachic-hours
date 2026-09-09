import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock, Info } from 'lucide-react';
import { HalachicMethod, ShaahZmanitResult } from '../types';
import { formatClockTime, formatHebrewAndGregorianDate } from '../utils/zmanim';

interface ZmaniyotSummaryProps {
  result: ShaahZmanitResult;
  method: HalachicMethod;
  onChangeMethod: (m: HalachicMethod) => void;
}

export const ZmaniyotSummary: React.FC<ZmaniyotSummaryProps> = ({
  result,
  method,
  onChangeMethod,
}) => {
  const { hebrewDate, gregorianFormatted, dayOfWeek } = formatHebrewAndGregorianDate(result.dateStr);

  const sunriseFormatted = formatClockTime(result.sunTimes.sunrise);
  const sunsetFormatted = formatClockTime(result.sunTimes.sunset);
  const nextSunriseFormatted = formatClockTime(result.sunTimes.nextSunrise);

  const alotFormatted = result.sunTimes.alotHashachar
    ? formatClockTime(result.sunTimes.alotHashachar)
    : '';
  const tzetFormatted = result.sunTimes.tzetHakochavim
    ? formatClockTime(result.sunTimes.tzetHakochavim)
    : '';

  return (
    <div id="zmaniyot-summary" className="space-y-4">
      {/* Primary Display Header matching prompt specification */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              תאריך מחושב
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {dayOfWeek}, {gregorianFormatted}
              {hebrewDate && (
                <span className="mr-2 text-base font-hebrew-serif font-bold text-amber-800">
                  ({hebrewDate})
                </span>
              )}
            </div>
          </div>

          {/* Halachic Method selector */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 font-medium">שיטת חישוב:</span>
            <button
              id="method-gra"
              type="button"
              onClick={() => onChangeMethod('gra')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                method === 'gra'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              הגר״א ורמב״ם (זריחה עד שקיעה)
            </button>
            <button
              id="method-mga"
              type="button"
              onClick={() => onChangeMethod('mga')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                method === 'mga'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              מגן אברהם (עלות עד צאת)
            </button>
          </div>
        </div>

        {/* The Two Main Values Requested by User */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Day Relative Hour */}
          <div
            id="day-shaah-zmanit-card"
            className="rounded-xl p-5 border border-amber-200 bg-amber-50/60 transition-all hover:shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  יום
                </span>
                <h3 className="text-sm font-medium text-slate-700">
                  ערך שעה זמנית ביום
                </h3>
              </div>
              <div className="p-2 bg-amber-100/70 rounded-lg text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight font-mono inline-block" dir="ltr">
                {result.dayHourFormatted}
              </span>
              <span className="text-sm text-slate-500 font-medium inline-block font-mono" dir="ltr">
                (hh:mm)
              </span>
            </div>

            <p className="mt-1 text-xs text-amber-950/80 font-medium">
              שווה ל-{result.dayHourDetailed}
            </p>

            <div className="mt-4 pt-3 border-t border-amber-200/70 text-xs text-slate-600 flex items-center justify-between">
              <span>
                {method === 'gra' ? 'מזריחה עד שקיעה' : 'מעלות השחר עד צאת הכוכבים'}
              </span>
              <span className="font-mono text-slate-700 font-medium inline-block" dir="ltr">
                סך יום: {Math.round(result.dayTotalMs / 60000)} דקות
              </span>
            </div>
          </div>

          {/* Night Relative Hour */}
          <div
            id="night-shaah-zmanit-card"
            className="rounded-xl p-5 border border-indigo-200 bg-indigo-50/50 transition-all hover:shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 mb-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  לילה
                </span>
                <h3 className="text-sm font-medium text-slate-700">
                  ערך שעה זמנית בלילה
                </h3>
              </div>
              <div className="p-2 bg-indigo-100/70 rounded-lg text-indigo-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tight font-mono inline-block" dir="ltr">
                {result.nightHourFormatted}
              </span>
              <span className="text-sm text-slate-500 font-medium inline-block font-mono" dir="ltr">
                (hh:mm)
              </span>
            </div>

            <p className="mt-1 text-xs text-indigo-950/80 font-medium">
              שווה ל-{result.nightHourDetailed}
            </p>

            <div className="mt-4 pt-3 border-t border-indigo-200/70 text-xs text-slate-600 flex items-center justify-between">
              <span>
                {method === 'gra' ? 'משקיעה עד הנץ שלמחרת' : 'ממוצאי כוכבים עד עלות השחר'}
              </span>
              <span className="font-mono text-slate-700 font-medium inline-block" dir="ltr">
                סך לילה: {Math.round(result.nightTotalMs / 60000)} דקות
              </span>
            </div>
          </div>
        </div>

        {/* Solar Times Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-600" />
              <span>הנץ החמה (זריחה)</span>
            </div>
            <div className="text-base font-bold text-slate-800 font-mono mt-0.5 inline-block" dir="ltr">
              {sunriseFormatted}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>חצות היום</span>
            </div>
            <div className="text-base font-bold text-slate-800 font-mono mt-0.5 inline-block" dir="ltr">
              {formatClockTime(result.sunTimes.solarNoon)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-orange-600" />
              <span>שקיעת החמה</span>
            </div>
            <div className="text-base font-bold text-slate-800 font-mono mt-0.5 inline-block" dir="ltr">
              {sunsetFormatted}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-slate-500" />
              <span>זריחה למחרת</span>
            </div>
            <div className="text-base font-bold text-slate-800 font-mono mt-0.5 inline-block" dir="ltr">
              {nextSunriseFormatted}
            </div>
          </div>
        </div>

        {method === 'mga' && alotFormatted && tzetFormatted && (
          <div className="mt-3 bg-amber-50/50 border border-amber-200/70 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-around">
            <span><strong>עלות השחר:</strong> <span dir="ltr">{alotFormatted}</span></span>
            <span>•</span>
            <span><strong>צאת הכוכבים:</strong> <span dir="ltr">{tzetFormatted}</span></span>
          </div>
        )}
      </div>
    </div>
  );
};
