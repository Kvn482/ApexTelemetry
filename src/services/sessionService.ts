import { Session, FilterOptions } from '../types';
import { StorageService } from './storageService';

export class SessionService {
  public static getAll(): Session[] {
    return StorageService.getSessions();
  }

  public static getById(id: string): Session | undefined {
    const sessions = this.getAll();
    return sessions.find(s => s.id === id);
  }

  public static getFiltered(filters: FilterOptions): Session[] {
    let list = this.getAll();

    if (filters.trackId) {
      list = list.filter(s => s.trackId === filters.trackId);
    }
    if (filters.carId) {
      list = list.filter(s => s.carId === filters.carId);
    }
    if (filters.sessionType) {
      list = list.filter(s => s.type === filters.sessionType);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(s =>
        s.trackId.toLowerCase().includes(q) ||
        s.carId.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    if (filters.startDate) {
      list = list.filter(s => new Date(s.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      list = list.filter(s => new Date(s.date) <= new Date(filters.endDate!));
    }

    // Sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'lapTime') {
        comparison = a.bestLapTime - b.bestLapTime;
      } else if (sortBy === 'laps') {
        comparison = b.totalLaps - a.totalLaps;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return list;
  }

  public static create(newSessionData: Omit<Session, 'id'>): Session {
    const sessions = this.getAll();
    const newSession: Session = {
      ...newSessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    sessions.unshift(newSession);
    StorageService.saveSessions(sessions);
    return newSession;
  }

  public static delete(id: string): boolean {
    const sessions = this.getAll();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length !== sessions.length) {
      StorageService.saveSessions(filtered);
      return true;
    }
    return false;
  }

  public static getOverallStats() {
    const sessions = this.getAll();
    const totalSessions = sessions.length;
    const totalLaps = sessions.reduce((acc, s) => acc + s.totalLaps, 0);
    const uniqueTracks = new Set(sessions.map(s => s.trackId)).size;
    const uniqueCars = new Set(sessions.map(s => s.carId)).size;
    const totalDrivingMinutes = sessions.reduce((acc, s) => acc + s.drivingTimeMinutes, 0);

    let bestLapTimeOverall = Infinity;
    let bestLapSession: Session | undefined;

    for (const s of sessions) {
      if (s.bestLapTime > 0 && s.bestLapTime < bestLapTimeOverall) {
        bestLapTimeOverall = s.bestLapTime;
        bestLapSession = s;
      }
    }

    return {
      totalSessions,
      totalLaps,
      tracksCount: uniqueTracks,
      carsCount: uniqueCars,
      totalDrivingMinutes,
      bestLapTime: bestLapTimeOverall === Infinity ? 0 : bestLapTimeOverall,
      bestLapSession,
    };
  }

  /**
   * Performance overview history across sessions (for line chart)
   */
  public static getPerformanceHistory(daysLimit: number = 0, trackId?: string) {
    let sessions = [...this.getAll()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (trackId) {
      sessions = sessions.filter(s => s.trackId === trackId);
    }

    if (daysLimit > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysLimit);
      sessions = sessions.filter(s => new Date(s.date) >= cutoff);
    }

    return sessions.map(s => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bestLap: s.bestLapTime,
      avgLap: s.avgLapTime,
      trackId: s.trackId,
      carId: s.carId,
      sessionType: s.type,
      sessionId: s.id,
    }));
  }
}
