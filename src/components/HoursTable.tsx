import React, { useState } from 'react';
import { Clock, Sun, Moon, CheckCircle2, ChevronDown } from 'lucide-react';
import { ShaahZmanitResult } from '../types';
import { generateRelativeHoursSchedule, formatClockTime } from '../utils/zmanim';

interface HoursTableProps {
  result: ShaahZmanitResult;
}

export const HoursTable: React.FC<HoursTableProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');

  const { dayHours, nightHours } = generateRelativeHoursSchedule(result);
  const now = new Date();

  const currentList = activeTab === 'day' ? dayHours : nightHours;

  return (
    <div id="hours-schedule-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>לוח השעות הזמניות המסיימות בשעון (24 שעות)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            פירוט מדויק של שעת הסיום של כל אחת מ-12 השעות הזמניות ב{activeTab === 'day' ? 'יום' : 'לילה'}
          </p>
        </div>

        {/* Tab switch between Day and Night */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          <button
            id="tab-view-day-hours"
            type="button"
            onClick={() => setActiveTab('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'day'
                ? 'bg-white text-amber-950 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>12 שעות היום</span>
          </button>
          <button
            id="tab-view-night-hours"
            type="button"
            onClick={() => setActiveTab('night')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'night'
                ? 'bg-white text-indigo-950 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>12 שעות הלילה</span>
          </button>
        </div>
      </div>

      {/* Table list */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
              <th className="py-2.5 px-3">שעה זמנית</th>
              <th className="py-2.5 px-3">משמעות הלכתית / תיאור</th>
              <th className="py-2.5 px-3 text-center">התחלה</th>
              <th className="py-2.5 px-3 text-left font-bold text-slate-800">
                שעת סיום (השעה המסיימת)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentList.map((item) => {
              const startFormatted = formatClockTime(item.startTime);
              const endFormatted = formatClockTime(item.endTime);
              const endFormattedSeconds = formatClockTime(item.endTime, true);

              // Check if current time is inside this relative hour
              const isCurrent =
                now.getTime() >= item.startTime.getTime() &&
                now.getTime() < item.endTime.getTime();

              const isMilestone =
                (item.period === 'day' && [3, 4, 6, 7, 10, 12].includes(item.index)) ||
                (item.period === 'night' && [6, 12].includes(item.index));

              return (
                <tr
                  key={item.index}
                  className={`transition-colors hover:bg-slate-50 ${
                    isCurrent ? 'bg-amber-50/60 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-amber-600 text-white'
                            : item.period === 'day'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {item.index}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {item.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-200 text-amber-900 font-bold">
                          עכשיו
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-xs ${
                        isMilestone
                          ? 'font-semibold text-amber-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {item.description}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">
                    <span dir="ltr" className="inline-block">{startFormatted}</span>
                  </td>

                  <td className="py-3 px-3 text-left">
                    <div className="flex items-baseline justify-end gap-1.5" dir="ltr">
                      <span className="font-mono text-base font-bold text-slate-900 inline-block">
                        {endFormatted}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 inline-block">
                        ({endFormattedSeconds})
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          * מחושב לפי שיטת {result.method === 'gra' ? 'הגר״א (זריחה עד שקיעה)' : 'מגן אברהם (עלות השחר עד צאת הכוכבים)'}.
        </span>
        <span className="text-slate-400">
          אורך שעה זמנית ב{activeTab === 'day' ? 'יום' : 'לילה'}: {activeTab === 'day' ? result.dayHourFormatted : result.nightHourFormatted} ({activeTab === 'day' ? result.dayHourDetailed : result.nightHourDetailed})
        </span>
      </div>
    </div>
  );
};
