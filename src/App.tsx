import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { GeoLocation, HalachicMethod, ShaahZmanitResult, SunTimes } from './types';
import { DEFAULT_LOCATIONS, fetchSunTimes } from './utils/api';
import { calculateShaotZmaniyot } from './utils/zmanim';
import { LocationSearch } from './components/LocationSearch';
import { DateSelector } from './components/DateSelector';
import { ZmaniyotSummary } from './components/ZmaniyotSummary';
import { ConverterWidget } from './components/ConverterWidget';
import { HoursTable } from './components/HoursTable';

export default function App() {
  // Default to today
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation>(DEFAULT_LOCATIONS[0]); // Jerusalem
  const [dateStr, setDateStr] = useState<string>(getTodayStr());
  const [method, setMethod] = useState<HalachicMethod>('gra');
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showHalachaInfo, setShowHalachaInfo] = useState<boolean>(false);

  // Fetch / Calculate Sun times whenever location or date changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const times = await fetchSunTimes(
          selectedLocation.latitude,
          selectedLocation.longitude,
          dateStr
        );
        if (!isCancelled) {
          setSunTimes(times);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load sun times', err);
          setError('חלה שגיאה בטעינת זמני השמש, נטען חישוב מקומי.');
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [selectedLocation, dateStr]);

  // Compute Shaah Zmanit result
  const result: ShaahZmanitResult | null = sunTimes
    ? calculateShaotZmaniyot(sunTimes, dateStr, selectedLocation, method)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12" dir="rtl">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                מחשבון שעות זמניות
              </h1>
              <p className="text-xs text-slate-500">
                חישוב שעה זמנית ביום ובלילה והמרה לשעון רגיל (24 שעות)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHalachaInfo(!showHalachaInfo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">מהי שעה זמנית?</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Halachic Explanation Collapsible Card */}
        {showHalachaInfo && (
          <section className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <BookOpen className="w-4 h-4 text-amber-700" />
                מושג השעה הזמנית בהלכה היהודית
              </span>
              <a
                href="https://he.wikipedia.org/wiki/%D7%A9%D7%A2%D7%95%D7%AA_%D7%96%D7%9E%D7%A0%D7%99%D7%95%D7%AA"
                target="_blank"
                rel="noreferrer"
                className="text-amber-800 hover:underline flex items-center gap-1 text-xs"
              >
                <span>ערך בוויקיפדיה</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p>
              בהלכה היהודית, היום והלילה נחלקים כל אחד ל-12 חלקים שווים הנקראים <strong>שעות זמניות</strong>.
              אורך שעה זמנית אינו קבוע על 60 דקות, אלא תלוי באורך שעות האור או החושך באותו מקום ויום בשנה:
            </p>
            <ul className="list-disc list-inside space-y-1 pr-2 text-slate-700">
              <li>
                <strong>בימות הקיץ:</strong> שעות האור ארוכות יותר, ולכן שעה זמנית ביום נמשכת יותר מ-60 דקות (ושעה זמנית בלילה קצרה מ-60 דקות).
              </li>
              <li>
                <strong>בימות החורף:</strong> שעות האור קצרות יותר, ולכן שעה זמנית ביום נמשכת פחות מ-60 דקות (ושעה זמנית בלילה ארוכה מ-60 דקות).
              </li>
              <li>
                <strong>השיטה המרכזית (הגר״א והרמב״ם):</strong> מחלקת את הזמן שבין זריחת החמה לשקיעת החמה ל-12 חלקים שווים.
              </li>
            </ul>
          </section>
        )}

        {/* Input Controls: Location and Date */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LocationSearch
            currentLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            isLoading={isLoading}
          />
          <DateSelector dateStr={dateStr} onChangeDate={setDateStr} />
        </section>

        {/* Error notification if any */}
        {error && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !result && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              מחשב זמני זריחה ושקיעה עבור {selectedLocation.name}...
            </p>
          </div>
        )}

        {/* Main Content when data ready */}
        {result && (
          <>
            {/* 1. Primary Output (Date, Day Shaah, Night Shaah) */}
            <ZmaniyotSummary
              result={result}
              method={method}
              onChangeMethod={setMethod}
            />

            {/* 2. Interactive Converter: Relative Hour to Clock Hour (e.g. 6:23 -> clock) */}
            <ConverterWidget result={result} />

            {/* 3. Full 24-Hour Relative Hours Schedule */}
            <HoursTable result={result} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>
          מחשבון שעות זמניות בהלכה • מבוסס מקורות מידע וחישובי זמנים פתוחים וחופשיים
        </p>
      </footer>
    </div>
  );
}
