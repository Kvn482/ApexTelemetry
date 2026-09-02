import { Car } from '../types';
import { MOCK_CARS } from '../data/mockCars';
import { SessionService } from './sessionService';
import { MOCK_TRACKS } from '../data/mockTracks';

export class CarService {
  public static getAll(): Car[] {
    return MOCK_CARS;
  }

  public static getById(id: string): Car | undefined {
    return MOCK_CARS.find(c => c.id === id);
  }

  public static getCarStats(carId: string) {
    const allSessions = SessionService.getAll().filter(s => s.carId === carId);
    const sessionsCount = allSessions.length;
    const tracksUsed = new Set(allSessions.map(s => s.trackId));
    const totalLaps = allSessions.reduce((acc, s) => acc + s.totalLaps, 0);

    let overallBestLap = Infinity;
    allSessions.forEach(s => {
      if (s.bestLapTime > 0 && s.bestLapTime < overallBestLap) {
        overallBestLap = s.bestLapTime;
      }
    });

    // Track performance matrix
    const trackMap = new Map<string, { bestLap: number; laps: number; sessions: number }>();
    allSessions.forEach(s => {
      const existing = trackMap.get(s.trackId) || { bestLap: Infinity, laps: 0, sessions: 0 };
      existing.sessions++;
      existing.laps += s.totalLaps;
      if (s.bestLapTime > 0 && s.bestLapTime < existing.bestLap) {
        existing.bestLap = s.bestLapTime;
      }
      trackMap.set(s.trackId, existing);
    });

    const trackPerformance = Array.from(trackMap.entries()).map(([trackId, data]) => {
      const track = MOCK_TRACKS.find(t => t.id === trackId);
      return {
        track,
        trackId,
        bestLap: data.bestLap === Infinity ? 0 : data.bestLap,
        lapsCount: data.laps,
        sessionsCount: data.sessions,
      };
    });

    return {
      sessionsCount,
      tracksCount: tracksUsed.size,
      totalLaps,
      overallBestLap: overallBestLap === Infinity ? 0 : overallBestLap,
      trackPerformance,
      sessions: allSessions,
    };
  }
}
