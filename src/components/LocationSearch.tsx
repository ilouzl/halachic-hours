import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation, Loader2, Check } from 'lucide-react';
import { GeoLocation } from '../types';
import { DEFAULT_LOCATIONS, searchLocations } from '../utils/api';

interface LocationSearchProps {
  currentLocation: GeoLocation;
  onSelectLocation: (loc: GeoLocation) => void;
  isLoading: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  currentLocation,
  onSelectLocation,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await searchLocations(query);
        setResults(found);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('Error searching locations', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('הדפדפן אינו תומך בזיהוי מיקום');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const loc: GeoLocation = {
          name: 'מיקום נוכחי',
          displayName: `נ״צ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          latitude: lat,
          longitude: lng,
        };
        onSelectLocation(loc);
        setQuery('');
        setIsDropdownOpen(false);
        setIsSearching(false);
      },
      (err) => {
        setIsSearching(false);
        setGeoError('לא ניתן לגשת למיקום (יש לאשר הרשאת מיקום בדפדפן)');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div id="location-selector" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <label htmlFor="location-input" className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>מיקום גיאוגרפי לחישוב</span>
        </label>
        <span className="text-xs text-slate-500">
          נבחר: <strong className="text-slate-800 font-medium">{currentLocation.displayName}</strong>
        </span>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="location-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="חפש עיר או כתובת בעולם (לדוגמה: ירושלים, בני ברק, London, New York)..."
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
          </div>

          <button
            id="btn-use-current-location"
            type="button"
            onClick={handleUseCurrentLocation}
            title="השתמש במיקום הנוכחי שלי"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium border border-slate-300 transition-colors whitespace-nowrap"
          >
            <Navigation className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">מיקום נוכחי</span>
          </button>
        </div>

        {geoError && (
          <p className="text-xs text-rose-600 mt-1.5 font-medium">{geoError}</p>
        )}

        {/* Search Results Dropdown */}
        {isDropdownOpen && results.length > 0 && (
          <div className="absolute z-50 right-0 left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            <div className="p-1.5">
              {results.map((item, idx) => (
                <button
                  key={`${item.latitude}-${item.longitude}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectLocation(item);
                    setQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-amber-50 rounded-md transition-colors flex items-center justify-between text-slate-700 hover:text-amber-950"
                >
                  <span className="truncate">{item.displayName}</span>
                  <span className="text-xs text-slate-400 dir-ltr font-mono">
                    {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick City Presets */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">ערים נפוצות:</span>
        {DEFAULT_LOCATIONS.map((loc) => {
          const isSelected =
            currentLocation.name === loc.name ||
            (Math.abs(currentLocation.latitude - loc.latitude) < 0.05 &&
              Math.abs(currentLocation.longitude - loc.longitude) < 0.05);

          return (
            <button
              key={loc.name}
              id={`preset-city-${loc.name}`}
              type="button"
              onClick={() => onSelectLocation(loc)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                isSelected
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {loc.name}
              {isSelected && <Check className="w-3 h-3 inline mr-1 text-amber-700" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
