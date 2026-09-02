import { Session, Lap } from '../types';
import { formatLapTime } from '../utils/formatters';

function generateLaps(
  baseLapTime: number,
  lapCount: number,
  bestLapIndex: number = 4
): Lap[] {
  const laps: Lap[] = [];
  let bestTime = Infinity;

  // First pass to determine lap times
  const rawTimes: number[] = [];
  for (let i = 0; i < lapCount; i++) {
    if (i === bestLapIndex) {
      rawTimes.push(baseLapTime);
    } else {
      // Small realistic variation: +0.2s to +1.8s
      const delta = 0.15 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 1.4;
      rawTimes.push(parseFloat((baseLapTime + delta).toFixed(3)));
    }
  }

  bestTime = Math.min(...rawTimes);

  for (let i = 0; i < lapCount; i++) {
    const lapNumber = i + 1;
    const lapTime = rawTimes[i];
    const isBest = lapTime === bestTime;
    const delta = parseFloat((lapTime - bestTime).toFixed(3));

    // Distribute lap time into 3 sectors
    const s1Ratio = 0.33;
    const s2Ratio = 0.37;
    const s3Ratio = 0.30;

    const s1 = parseFloat((lapTime * s1Ratio + (Math.cos(i) * 0.15)).toFixed(3));
    const s2 = parseFloat((lapTime * s2Ratio + (Math.sin(i) * 0.18)).toFixed(3));
    const s3 = parseFloat((lapTime - s1 - s2).toFixed(3));

    const topSpeed = Math.round(278 + (Math.sin(i * 2.1) * 6));
    const avgSpeed = Math.round(180 - (delta * 1.8));

    laps.push({
      id: `lap-${lapNumber}`,
      lapNumber,
      lapTime,
      formattedTime: formatLapTime(lapTime),
      delta: isBest ? 0 : delta,
      isValid: i !== 1, // Lap 2 has a track limit violation for realism
      isSessionBest: isBest,
      topSpeed,
      avgSpeed,
      sectors: [
        { sectorNumber: 1, time: s1, sessionBest: isBest },
        { sectorNumber: 2, time: s2, sessionBest: isBest },
        { sectorNumber: 3, time: s3, sessionBest: isBest },
      ],
    });
  }

  return laps;
}

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-sebring-ferrari-latest',
    trackId: 'sebring',
    carId: 'ferrari-296-gt3',
    driverId: 'driver-kevin',
    date: '2026-09-02T14:30:00Z',
    type: 'Practice',
    totalLaps: 12,
    bestLapTime: 104.102, // 1:44.102
    avgLapTime: 104.780,
    drivingTimeMinutes: 38,
    conditions: {
      airTemp: 27,
      trackTemp: 42,
      weather: 'Sunny',
      gripLevel: 98,
      windSpeed: 12,
      windDirection: 'NE',
    },
    notes: 'Dialed in brake bias to 54.2%. Found 3 tenths through Sunset Bend on Lap 7.',
    laps: generateLaps(104.102, 12, 6),
  },
  {
    id: 'session-sebring-ferrari-baseline',
    trackId: 'sebring',
    carId: 'ferrari-296-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-05T10:15:00Z',
    type: 'Testing',
    totalLaps: 15,
    bestLapTime: 109.821, // 1:49.821 (First session - baseline for progress comparison: -5.719s)
    avgLapTime: 111.450,
    drivingTimeMinutes: 45,
    conditions: {
      airTemp: 31,
      trackTemp: 48,
      weather: 'Sunny',
      gripLevel: 88,
      windSpeed: 18,
      windDirection: 'E',
    },
    notes: 'Initial shakedown of the Ferrari 296 GT3. Baseline aerodynamic balance test.',
    laps: generateLaps(109.821, 15, 8),
  },
  {
    id: 'session-sebring-ferrari-qualifying',
    trackId: 'sebring',
    carId: 'ferrari-296-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-28T16:00:00Z',
    type: 'Qualifying',
    totalLaps: 8,
    bestLapTime: 104.380,
    avgLapTime: 104.920,
    drivingTimeMinutes: 24,
    conditions: {
      airTemp: 25,
      trackTemp: 36,
      weather: 'Dry',
      gripLevel: 99,
      windSpeed: 8,
    },
    laps: generateLaps(104.380, 8, 4),
  },
  {
    id: 'session-imola-ferrari-race',
    trackId: 'imola',
    carId: 'ferrari-296-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-22T13:00:00Z',
    type: 'Race',
    totalLaps: 24,
    bestLapTime: 104.183, // 1:44.183
    avgLapTime: 105.120,
    drivingTimeMinutes: 52,
    conditions: {
      airTemp: 24,
      trackTemp: 38,
      weather: 'Dry',
      gripLevel: 97,
      windSpeed: 9,
    },
    notes: 'P3 podium finish. Incredible battle through Piratella.',
    laps: generateLaps(104.183, 24, 11),
  },
  {
    id: 'session-imola-porsche-practice',
    trackId: 'imola',
    carId: 'porsche-992-gt3-r',
    driverId: 'driver-kevin',
    date: '2026-08-19T09:30:00Z',
    type: 'Practice',
    totalLaps: 16,
    bestLapTime: 104.450,
    avgLapTime: 105.310,
    drivingTimeMinutes: 40,
    conditions: {
      airTemp: 21,
      trackTemp: 32,
      weather: 'Overcast',
      gripLevel: 94,
      windSpeed: 14,
    },
    laps: generateLaps(104.450, 16, 7),
  },
  {
    id: 'session-silverstone-bmw-hotlap',
    trackId: 'silverstone',
    carId: 'bmw-m4-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-25T15:45:00Z',
    type: 'Hotlap',
    totalLaps: 10,
    bestLapTime: 118.421, // 1:58.421
    avgLapTime: 119.200,
    drivingTimeMinutes: 28,
    conditions: {
      airTemp: 19,
      trackTemp: 28,
      weather: 'Dry',
      gripLevel: 96,
      windSpeed: 21,
      windDirection: 'W',
    },
    notes: 'Aggressive kerb riding through Becketts. Front splitter wear minimal.',
    laps: generateLaps(118.421, 10, 5),
  },
  {
    id: 'session-spa-ferrari-testing',
    trackId: 'spa',
    carId: 'ferrari-296-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-14T11:00:00Z',
    type: 'Testing',
    totalLaps: 14,
    bestLapTime: 138.421, // 2:18.421
    avgLapTime: 139.750,
    drivingTimeMinutes: 46,
    conditions: {
      airTemp: 18,
      trackTemp: 26,
      weather: 'Damp',
      gripLevel: 91,
      windSpeed: 15,
    },
    notes: 'Low downforce trim setup test. Achieved 282 km/h top speed down Kemmel Straight.',
    laps: generateLaps(138.421, 14, 8),
  },
  {
    id: 'session-monza-lambo-race',
    trackId: 'monza',
    carId: 'lamborghini-huracan-gt3',
    driverId: 'driver-kevin',
    date: '2026-08-10T14:00:00Z',
    type: 'Race',
    totalLaps: 20,
    bestLapTime: 105.890,
    avgLapTime: 106.650,
    drivingTimeMinutes: 44,
    conditions: {
      airTemp: 29,
      trackTemp: 46,
      weather: 'Sunny',
      gripLevel: 98,
      windSpeed: 7,
    },
    notes: 'Maximum top end speed setup. V10 sound down Prima Variante was spectacular.',
    laps: generateLaps(105.890, 20, 9),
  },
  {
    id: 'session-sebring-porsche-testing',
    trackId: 'sebring',
    carId: 'porsche-992-gt3-r',
    driverId: 'driver-kevin',
    date: '2026-07-29T10:00:00Z',
    type: 'Testing',
    totalLaps: 18,
    bestLapTime: 104.620,
    avgLapTime: 105.410,
    drivingTimeMinutes: 48,
    conditions: {
      airTemp: 28,
      trackTemp: 44,
      weather: 'Sunny',
      gripLevel: 95,
      windSpeed: 11,
    },
    laps: generateLaps(104.620, 18, 12),
  },
  {
    id: 'session-monza-bmw-qualifying',
    trackId: 'monza',
    carId: 'bmw-m4-gt3',
    driverId: 'driver-kevin',
    date: '2026-07-18T16:30:00Z',
    type: 'Qualifying',
    totalLaps: 7,
    bestLapTime: 106.210,
    avgLapTime: 106.900,
    drivingTimeMinutes: 20,
    conditions: {
      airTemp: 26,
      trackTemp: 40,
      weather: 'Dry',
      gripLevel: 97,
      windSpeed: 6,
    },
    laps: generateLaps(106.210, 7, 3),
  },
];
