/**
 * Formats seconds (e.g. 104.102) into standard motorsport format: "1:44.102"
 */
export function formatLapTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  const paddedMillis = millis < 10 ? `00${millis}` : millis < 100 ? `0${millis}` : `${millis}`;

  return `${mins}:${paddedSecs}.${paddedMillis}`;
}

/**
 * Formats a delta in seconds with +/- sign: "+0.342" or "-0.150"
 */
export function formatDelta(delta: number | undefined | null): string {
  if (delta === undefined || delta === null || isNaN(delta)) {
    return '0.000s';
  }
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '±';
  const abs = Math.abs(delta).toFixed(3);
  return `${sign}${abs}s`;
}

/**
 * Formats a sector time: "34.521"
 */
export function formatSectorTime(seconds: number | undefined | null): string {
  if (!seconds || isNaN(seconds)) return '--.---';
  return seconds.toFixed(3);
}

/**
 * Formats speed: "264 km/h"
 */
export function formatSpeed(kmh: number | undefined | null, unit: 'kmh' | 'mph' = 'kmh'): string {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return '--';
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Formats date into readable motorsport session date (e.g. "Sep 2, 2026")
 */
export function formatSessionDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats driving time in minutes to hours and minutes (e.g. "1h 45m" or "42m")
 */
export function formatDrivingDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }
  return `${mins}m`;
}

/**
 * Parses "1:44.102" or "104.102" into total seconds
 */
export function parseLapTimeToSeconds(str: string): number {
  if (!str) return 0;
  const clean = str.trim();
  if (clean.includes(':')) {
    const [minsStr, rest] = clean.split(':');
    const mins = parseFloat(minsStr);
    const secs = parseFloat(rest);
    return mins * 60 + secs;
  }
  return parseFloat(clean) || 0;
}
