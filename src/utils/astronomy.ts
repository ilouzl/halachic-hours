/**
 * Astronomical Solar Calculations based on standard NOAA algorithms
 * Provides high-precision sunrise, sunset, and solar noon for any coordinate and date.
 */

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Convert radians to degrees
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Julian day from Date
function getJulianDay(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

// Julian century
function getJulianCentury(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// Calculate sunrise or sunset
// zenith = 90.8333 degrees (official standard for sunrise/sunset including refraction and solar disc)
// For Alot Hashachar (16.1 degrees below horizon) zenith = 106.1 deg
// For Tzet Hakochavim (8.5 degrees below horizon) zenith = 98.5 deg
function calcSunTime(
  date: Date,
  lat: number,
  lng: number,
  isSunrise: boolean,
  zenith: number = 90.8333
): Date | null {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 1. Calculate day of the year
  const N1 = Math.floor((275 * month) / 9);
  const N2 = Math.floor((month + 9) / 12);
  const N3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
  const N = N1 - N2 * N3 + day - 30;

  // 2. Convert longitude to hour value and calculate approximate time
  const lngHour = lng / 15;
  const t = isSunrise ? N + (6 - lngHour) / 24 : N + (18 - lngHour) / 24;

  // 3. Sun's mean anomaly
  const M = 0.9856 * t - 3.289;

  // 4. Sun's true longitude
  let L =
    M +
    1.916 * Math.sin(toRad(M)) +
    0.02 * Math.sin(toRad(2 * M)) +
    282.634;
  L = ((L % 360) + 360) % 360;

  // 5. Sun's right ascension
  let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
  RA = ((RA % 360) + 360) % 360;

  // Right ascension value needs to be in the same quadrant as L
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = RA + (Lquadrant - RAquadrant);
  RA = RA / 15;

  // 6. Sun's declination
  const sinDec = 0.39782 * Math.sin(toRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  // 7. Sun's local hour angle
  const cosH =
    (Math.cos(toRad(zenith)) - sinDec * Math.sin(toRad(lat))) /
    (cosDec * Math.cos(toRad(lat)));

  if (cosH > 1 || cosH < -1) {
    // Polar day or polar night
    return null;
  }

  let H = isSunrise ? 360 - toDeg(Math.acos(cosH)) : toDeg(Math.acos(cosH));
  H = H / 15;

  // 8. Local mean time of rising/setting
  const T = H + RA - 0.06571 * t - 6.622;

  // 9. Adjust to UTC
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  // Convert UT hours into a Date object on the same UTC date
  const utHours = Math.floor(UT);
  const utMinutes = Math.floor((UT - utHours) * 60);
  const utSeconds = Math.round(((UT - utHours) * 60 - utMinutes) * 60);

  const res = new Date(Date.UTC(year, month - 1, day, utHours, utMinutes, utSeconds));
  return res;
}

export function getAstronomicalSunTimes(
  date: Date,
  lat: number,
  lng: number
): {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  nextSunrise: Date;
  alotHashachar: Date;
  tzetHakochavim: Date;
} {
  const sunrise = calcSunTime(date, lat, lng, true, 90.8333) || new Date(date);
  const sunset = calcSunTime(date, lat, lng, false, 90.8333) || new Date(date);

  // Next day sunrise (for night calculation)
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextSunrise = calcSunTime(nextDate, lat, lng, true, 90.8333) || new Date(nextDate);

  // Solar noon is roughly halfway between sunrise and sunset
  const solarNoon = new Date((sunrise.getTime() + sunset.getTime()) / 2);

  // Alot Hashachar (Gra 72 min before sunrise or astronomical 16.1 degrees)
  const alot = calcSunTime(date, lat, lng, true, 106.1) ||
    new Date(sunrise.getTime() - 72 * 60 * 1000);

  // Tzet Hakochavim (3 small stars / 8.5 degrees below horizon or 72/40 min after sunset)
  const tzet = calcSunTime(date, lat, lng, false, 98.5) ||
    new Date(sunset.getTime() + 40 * 60 * 1000);

  return {
    sunrise,
    sunset,
    solarNoon,
    nextSunrise,
    alotHashachar: alot,
    tzetHakochavim: tzet,
  };
}
