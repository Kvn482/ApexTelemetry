import { Track } from '../types';
import { MOCK_TRACKS } from '../data/mockTracks';
import { SessionService } from './sessionService';
import { MOCK_CARS } from '../data/mockCars';

export class TrackService {
  public static getAll(): Track[] {
    return MOCK_TRACKS;
  }

  public static getById(id: string): Track | undefined {
    return MOCK_TRACKS.find(t => t.id === id);
  }

  public static getTrackStats(trackId: string) {
    const allSessions = SessionService.getAll().filter(s => s.trackId === trackId);
    const sessionsCount = allSessions.length;
    const totalLaps = allSessions.reduce((acc, s) => acc + s.totalLaps, 0);

    let personalBest = Infinity;
    let totalLapSum = 0;
    let validLapsCount = 0;
    let lastSessionDate = '';

    const sortedByDate = [...allSessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedByDate.length > 0) {
      lastSessionDate = sortedByDate[0].date;
    }

    allSessions.forEach(s => {
      if (s.bestLapTime > 0 && s.bestLapTime < personalBest) {
        personalBest = s.bestLapTime;
      }
      s.laps.forEach(l => {
        if (l.isValid && l.lapTime > 0) {
          totalLapSum += l.lapTime;
          validLapsCount++;
        }
      });
    });

    const averageLap = validLapsCount > 0 ? totalLapSum / validLapsCount : 0;

    // Cars used on this track
    const carMap = new Map<string, { sessions: number; bestLap: number }>();
    allSessions.forEach(s => {
      const existing = carMap.get(s.carId) || { sessions: 0, bestLap: Infinity };
      existing.sessions++;
      if (s.bestLapTime > 0 && s.bestLapTime < existing.bestLap) {
        existing.bestLap = s.bestLapTime;
      }
      carMap.set(s.carId, existing);
    });

    const carsUsed = Array.from(carMap.entries()).map(([carId, data]) => {
      const car = MOCK_CARS.find(c => c.id === carId);
      return {
        car,
        carId,
        sessionsCount: data.sessions,
        bestLap: data.bestLap === Infinity ? 0 : data.bestLap,
      };
    });

    // Lap time progression over time
    const progression = [...allSessions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bestLap: s.bestLapTime,
        avgLap: s.avgLapTime,
        sessionId: s.id,
        carId: s.carId,
      }));

    return {
      sessionsCount,
      totalLaps,
      personalBest: personalBest === Infinity ? 0 : personalBest,
      averageLap,
      lastSessionDate,
      carsUsed,
      progression,
      sessions: sortedByDate,
    };
  }
}
