import {
  GeoLocation,
  HalachicMethod,
  RelativeHourItem,
  ShaahZmanitResult,
  SunTimes,
} from '../types';

/**
 * Format milliseconds into HH:MM (or MM:SS if less than an hour)
 */
export function formatDurationHHMM(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Format milliseconds into detailed Hebrew description (e.g. "64 דק' ו-15 שניות")
 */
export function formatDurationDetailed(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (seconds > 0) {
      return `${hours} שעות, ${remainingMinutes} דקות ו-${seconds} שניות`;
    }
    return `${hours} שעות ו-${remainingMinutes} דקות`;
  }

  if (seconds === 0) {
    return `${minutes} דקות`;
  }
  return `${minutes} דקות ו-${seconds} שניות`;
}

/**
 * Format a Date to local clock time HH:mm or HH:mm:ss
 */
export function formatClockTime(date: Date, includeSeconds: boolean = false): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  if (includeSeconds) {
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  return `${h}:${m}`;
}

/**
 * Format Hebrew Date using browser's Intl calendar
 */
export function formatHebrewAndGregorianDate(dateStr: string): {
  hebrewDate: string;
  gregorianFormatted: string;
  dayOfWeek: string;
} {
  const date = new Date(`${dateStr}T12:00:00`);

  let hebrewDate = '';
  try {
    const hebrewFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    hebrewDate = hebrewFormatter.format(date);
  } catch {
    hebrewDate = '';
  }

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayOfWeek = `יום ${daysOfWeek[date.getDay()]}`;

  const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const gregorianFormatted = gregorianFormatter.format(date);

  return {
    hebrewDate,
    gregorianFormatted,
    dayOfWeek,
  };
}

/**
 * Calculate the full Shaah Zmanit result
 */
export function calculateShaotZmaniyot(
  sunTimes: SunTimes,
  dateStr: string,
  location: GeoLocation,
  method: HalachicMethod = 'gra'
): ShaahZmanitResult {
  // Determine Day start and end based on method
  let dayStart = sunTimes.sunrise;
  let dayEnd = sunTimes.sunset;

  if (method === 'mga' && sunTimes.alotHashachar && sunTimes.tzetHakochavim) {
    dayStart = sunTimes.alotHashachar;
    dayEnd = sunTimes.tzetHakochavim;
  }

  // Day total duration & 1 relative hour duration
  const dayTotalMs = dayEnd.getTime() - dayStart.getTime();
  const dayHourMs = dayTotalMs / 12;

  // Night start is day end, night end is next day start
  let nightStart = dayEnd;
  let nightEnd = sunTimes.nextSunrise;

  if (method === 'mga' && sunTimes.tzetHakochavim) {
    nightStart = sunTimes.tzetHakochavim;
    // Next day alot
    nightEnd = new Date(sunTimes.nextSunrise.getTime() - 72 * 60 * 1000);
  }

  const nightTotalMs = nightEnd.getTime() - nightStart.getTime();
  const nightHourMs = nightTotalMs / 12;

  return {
    dateStr,
    location,
    method,
    sunTimes,
    dayTotalMs,
    nightTotalMs,
    dayHourMs,
    nightHourMs,
    dayHourFormatted: formatDurationHHMM(dayHourMs),
    nightHourFormatted: formatDurationHHMM(nightHourMs),
    dayHourDetailed: formatDurationDetailed(dayHourMs),
    nightHourDetailed: formatDurationDetailed(nightHourMs),
  };
}

/**
 * Convert relative hour & minute (e.g. 6:23) into real 24h clock time
 *
 * Example: שעה זמנית 6:23 ביום
 * relativeHour = 6, relativeMinute = 23
 * fraction = 6 + 23/60
 * Real time = dayStart + fraction * dayHourMs
 */
export function convertRelativeTimeToClock(
  result: ShaahZmanitResult,
  period: 'day' | 'night',
  relativeHour: number,
  relativeMinute: number
): {
  clockTime: Date;
  clockFormatted: string;
  clockFormattedWithSeconds: string;
  explanation: string;
} {
  const isDay = period === 'day';
  const start = isDay
    ? result.method === 'mga' && result.sunTimes.alotHashachar
      ? result.sunTimes.alotHashachar
      : result.sunTimes.sunrise
    : isDay
    ? result.sunTimes.sunset
    : result.method === 'mga' && result.sunTimes.tzetHakochavim
    ? result.sunTimes.tzetHakochavim
    : result.sunTimes.sunset;

  const hourDurationMs = isDay ? result.dayHourMs : result.nightHourMs;

  const fraction = relativeHour + relativeMinute / 60;
  const elapsedMs = fraction * hourDurationMs;
  const clockTime = new Date(start.getTime() + elapsedMs);

  const startName = isDay
    ? result.method === 'mga'
      ? 'עלות השחר'
      : 'זריחה'
    : result.method === 'mga'
    ? 'צאת הכוכבים'
    : 'שקיעה';

  const startFormatted = formatClockTime(start);
  const hourMinutes = (hourDurationMs / 60000).toFixed(1);

  const explanation = `${startName} (${startFormatted}) + ${fraction.toFixed(
    3
  )} שעות זמניות × ${hourMinutes} דקות = ${formatClockTime(clockTime)}`;

  return {
    clockTime,
    clockFormatted: formatClockTime(clockTime),
    clockFormattedWithSeconds: formatClockTime(clockTime, true),
    explanation,
  };
}

/**
 * Convert real clock time back into relative hour and minute
 */
export function convertClockTimeToRelative(
  result: ShaahZmanitResult,
  clockTime: Date
): {
  period: 'day' | 'night';
  relativeHour: number;
  relativeMinute: number;
  relativeFormatted: string;
} {
  const dayStart =
    result.method === 'mga' && result.sunTimes.alotHashachar
      ? result.sunTimes.alotHashachar
      : result.sunTimes.sunrise;
  const dayEnd =
    result.method === 'mga' && result.sunTimes.tzetHakochavim
      ? result.sunTimes.tzetHakochavim
      : result.sunTimes.sunset;

  const time = clockTime.getTime();

  if (time >= dayStart.getTime() && time < dayEnd.getTime()) {
    // Day time
    const elapsed = time - dayStart.getTime();
    const hoursExact = elapsed / result.dayHourMs;
    const hour = Math.floor(hoursExact);
    const min = Math.floor((hoursExact - hour) * 60);
    return {
      period: 'day',
      relativeHour: hour,
      relativeMinute: min,
      relativeFormatted: `${hour}:${String(min).padStart(2, '0')} ביום`,
    };
  } else {
    // Night time
    const nightStart = dayEnd;
    let elapsed = 0;
    if (time >= nightStart.getTime()) {
      elapsed = time - nightStart.getTime();
    } else {
      // Prior to sunrise today, belonging to the night that started yesterday sunset
      const prevSunset =
        result.sunTimes.prevSunset ||
        new Date(result.sunTimes.sunrise.getTime() - 12 * result.nightHourMs);
      elapsed = time - prevSunset.getTime();
    }

    const hoursExact = Math.max(0, elapsed / result.nightHourMs);
    const hour = Math.floor(hoursExact);
    const min = Math.floor((hoursExact - hour) * 60);
    return {
      period: 'night',
      relativeHour: hour,
      relativeMinute: min,
      relativeFormatted: `${hour}:${String(min).padStart(2, '0')} בלילה`,
    };
  }
}

/**
 * Generate table of all 12 hours of the day and 12 hours of the night
 */
export function generateRelativeHoursSchedule(
  result: ShaahZmanitResult
): {
  dayHours: RelativeHourItem[];
  nightHours: RelativeHourItem[];
} {
  const dayStart =
    result.method === 'mga' && result.sunTimes.alotHashachar
      ? result.sunTimes.alotHashachar
      : result.sunTimes.sunrise;

  const nightStart =
    result.method === 'mga' && result.sunTimes.tzetHakochavim
      ? result.sunTimes.tzetHakochavim
      : result.sunTimes.sunset;

  const dayDescriptions: Record<number, string> = {
    1: 'תחילת היום וזריחת השמש',
    2: 'שעה שניה של היום',
    3: 'סוף זמן קריאת שמע (סוזק"ש)',
    4: 'סוף זמן תפילה (סו"ז תפילה)',
    5: 'שעה חמישית של היום',
    6: 'חצות היום (זמן שיא השמש)',
    7: 'תחילת זמן מנחה גדולה (6:30 זמנית)',
    8: 'שעה שמינית של היום',
    9: 'שעה תשיעית',
    10: 'מנחה קטנה (9:30) ופלג המנחה (10:45)',
    11: 'שעה אחת עשרה לקראת שקיעה',
    12: 'סיום שעה 12 ושקיעת החמה',
  };

  const nightDescriptions: Record<number, string> = {
    1: 'תחילת הלילה וצאת הכוכבים',
    2: 'שעה שניה של הלילה',
    3: 'משמרת ראשונה',
    4: 'שעה רביעית של הלילה',
    5: 'שעה חמישית של הלילה',
    6: 'חצות הלילה',
    7: 'תחילת אשמורת בוקר',
    8: 'שעה שמינית של הלילה',
    9: 'שעה תשיעית של הלילה',
    10: 'שעה עשירית של הלילה',
    11: 'עלות השחר (לפי שיטות מסוימות)',
    12: 'סיום שעה 12 וזריחת השמש למחרת',
  };

  const dayHours: RelativeHourItem[] = [];
  for (let i = 1; i <= 12; i++) {
    const startTime = new Date(dayStart.getTime() + (i - 1) * result.dayHourMs);
    const endTime = new Date(dayStart.getTime() + i * result.dayHourMs);
    dayHours.push({
      index: i,
      name: `שעה ${i}`,
      period: 'day',
      startTime,
      endTime,
      description: dayDescriptions[i],
    });
  }

  const nightHours: RelativeHourItem[] = [];
  for (let i = 1; i <= 12; i++) {
    const startTime = new Date(nightStart.getTime() + (i - 1) * result.nightHourMs);
    const endTime = new Date(nightStart.getTime() + i * result.nightHourMs);
    nightHours.push({
      index: i,
      name: `שעה ${i}`,
      period: 'night',
      startTime,
      endTime,
      description: nightDescriptions[i],
    });
  }

  return { dayHours, nightHours };
}
