import { GeoLocation, SunTimes } from '../types';
import { getAstronomicalSunTimes } from './astronomy';

// Default presets for popular cities
export const DEFAULT_LOCATIONS: GeoLocation[] = [
  {
    name: 'ירושלים',
    displayName: 'ירושלים, ישראל',
    latitude: 31.7767,
    longitude: 35.2345,
    country: 'ישראל',
    timezone: 'Asia/Jerusalem',
  },
  {
    name: 'תל אביב',
    displayName: 'תל אביב-יפו, ישראל',
    latitude: 32.0853,
    longitude: 34.7818,
    country: 'ישראל',
    timezone: 'Asia/Jerusalem',
  },
  {
    name: 'בני ברק',
    displayName: 'בני ברק, ישראל',
    latitude: 32.0833,
    longitude: 34.8333,
    country: 'ישראל',
    timezone: 'Asia/Jerusalem',
  },
  {
    name: 'חיפה',
    displayName: 'חיפה, ישראל',
    latitude: 32.794,
    longitude: 34.9896,
    country: 'ישראל',
    timezone: 'Asia/Jerusalem',
  },
  {
    name: 'באר שבע',
    displayName: 'באר שבע, ישראל',
    latitude: 31.2518,
    longitude: 34.7913,
    country: 'ישראל',
    timezone: 'Asia/Jerusalem',
  },
  {
    name: 'ניו יורק',
    displayName: 'ניו יורק, ארה״ב',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'ארצות הברית',
    timezone: 'America/New_York',
  },
  {
    name: 'לונדון',
    displayName: 'לונדון, בריטניה',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'בריטניה',
    timezone: 'Europe/London',
  },
  {
    name: 'פריז',
    displayName: 'פריז, צרפת',
    latitude: 48.8566,
    longitude: 2.3522,
    country: 'צרפת',
    timezone: 'Europe/Paris',
  },
];

/**
 * Search locations using free open geocoding APIs (Nominatim / Photon)
 */
export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  // Try Photon API first (CORS friendly, fast, OpenStreetMap data)
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&lang=he`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && Array.isArray(data.features) && data.features.length > 0) {
        return data.features.map((f: any) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = props.name || props.city || props.street || trimmed;
          const parts = [
            name,
            props.city && props.city !== name ? props.city : null,
            props.state,
            props.country,
          ].filter(Boolean);

          return {
            name,
            displayName: parts.join(', '),
            latitude: coords[1],
            longitude: coords[0],
            country: props.country,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Photon geocoding failed, trying Nominatim...', err);
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        trimmed
      )}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'he,en;q=0.8',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: item.address?.country,
        }));
      }
    }
  } catch (err) {
    console.error('Nominatim search failed:', err);
  }

  // Check in-memory default list matching
  return DEFAULT_LOCATIONS.filter(
    (loc) =>
      loc.name.includes(trimmed) ||
      loc.displayName.includes(trimmed) ||
      loc.country?.includes(trimmed)
  );
}

/**
 * Fetch sunrise, sunset, and solar times for a given coordinate and date
 * using free Open-Meteo or Sunrise-Sunset API with astronomical NOAA fallback.
 */
export async function fetchSunTimes(
  lat: number,
  lng: number,
  dateStr: string // YYYY-MM-DD
): Promise<SunTimes> {
  const targetDate = new Date(`${dateStr}T12:00:00`);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  // Try Open-Meteo free API (provides exact local sunrise/sunset)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&daily=sunrise,sunset&timezone=auto&start_date=${dateStr}&end_date=${nextDateStr}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.daily?.sunrise?.[0] && data.daily?.sunset?.[0]) {
        const sunrise = new Date(data.daily.sunrise[0]);
        const sunset = new Date(data.daily.sunset[0]);
        const nextSunrise = data.daily.sunrise[1]
          ? new Date(data.daily.sunrise[1])
          : new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

        const solarNoon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
        const alotHashachar = new Date(sunrise.getTime() - 72 * 60 * 1000);
        const tzetHakochavim = new Date(sunset.getTime() + 40 * 60 * 1000);

        return {
          sunrise,
          sunset,
          solarNoon,
          nextSunrise,
          alotHashachar,
          tzetHakochavim,
        };
      }
    }
  } catch (err) {
    console.warn('Open-Meteo sun times fetch failed, trying sunrise-sunset.org...', err);
  }

  // Fallback to Sunrise-Sunset.org free API
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'OK' && json.results) {
        const sunrise = new Date(json.results.sunrise);
        const sunset = new Date(json.results.sunset);
        const solarNoon = new Date(json.results.solar_noon);

        // Fetch next day sunrise for night length
        let nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
        try {
          const nextRes = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${nextDateStr}&formatted=0`
          );
          if (nextRes.ok) {
            const nextJson = await nextRes.json();
            if (nextJson.status === 'OK' && nextJson.results?.sunrise) {
              nextSunrise = new Date(nextJson.results.sunrise);
            }
          }
        } catch {
          // ignore
        }

        const alotHashachar = json.results.civil_twilight_begin
          ? new Date(json.results.civil_twilight_begin)
          : new Date(sunrise.getTime() - 72 * 60 * 1000);

        const tzetHakochavim = json.results.civil_twilight_end
          ? new Date(json.results.civil_twilight_end)
          : new Date(sunset.getTime() + 40 * 60 * 1000);

        return {
          sunrise,
          sunset,
          solarNoon,
          nextSunrise,
          alotHashachar,
          tzetHakochavim,
        };
      }
    }
  } catch (err) {
    console.warn('Sunrise-Sunset API failed, falling back to local NOAA calculations...', err);
  }

  // Guaranteed fallback: High-precision NOAA solar math locally calculated
  return getAstronomicalSunTimes(targetDate, lat, lng);
}
