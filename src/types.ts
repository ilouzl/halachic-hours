export interface GeoLocation {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country?: string;
  timezone?: string;
}

export type HalachicMethod = 'gra' | 'mga';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  nextSunrise: Date;
  prevSunset?: Date;
  alotHashachar?: Date; // For Magen Avraham
  tzetHakochavim?: Date; // For Magen Avraham
}

export interface ShaahZmanitResult {
  dateStr: string;
  location: GeoLocation;
  method: HalachicMethod;
  sunTimes: SunTimes;
  // Durations in milliseconds
  dayTotalMs: number;
  nightTotalMs: number;
  dayHourMs: number; // 1/12 of day
  nightHourMs: number; // 1/12 of night
  // Formatted duration strings
  dayHourFormatted: string; // e.g. "01:04"
  nightHourFormatted: string; // e.g. "00:55"
  dayHourDetailed: string; // e.g. "64 דקות ו-20 שניות"
  nightHourDetailed: string; // e.g. "55 דקות ו-40 שניות"
}

export interface RelativeHourItem {
  index: number; // 1 to 12
  name: string; // e.g. "שעה 1", "שעה 3 (סוזק"ש)"
  period: 'day' | 'night';
  startTime: Date;
  endTime: Date;
  description?: string;
}
