import { Session, TrainingGoal, Driver } from '../types';

const SESSIONS_STORAGE_KEY = 'apex_telemetry_sessions_v2';
const GOALS_STORAGE_KEY = 'apex_telemetry_goals_v2';
const DRIVER_STORAGE_KEY = 'apex_telemetry_driver_v2';

const DEFAULT_DRIVER: Driver = {
  id: 'driver-1',
  name: 'Sim Driver',
  team: 'Independent',
  safetyRating: 'A 4.99',
  irating: 2500,
  country: 'Global',
  status: 'In Pits',
};

export class StorageService {
  public static getSessions(): Session[] {
    try {
      // Clean legacy demo key if present
      if (localStorage.getItem('apex_telemetry_sessions_v1')) {
        localStorage.removeItem('apex_telemetry_sessions_v1');
      }
      const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
      return [];
    }
  }

  public static saveSessions(sessions: Session[]): void {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  }

  public static getGoals(): TrainingGoal[] {
    try {
      if (localStorage.getItem('apex_telemetry_goals_v1')) {
        localStorage.removeItem('apex_telemetry_goals_v1');
      }
      const data = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load goals from localStorage', e);
      return [];
    }
  }

  public static saveGoals(goals: TrainingGoal[]): void {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals to localStorage', e);
    }
  }

  public static getDriver(): Driver {
    try {
      const data = localStorage.getItem(DRIVER_STORAGE_KEY);
      if (!data) {
        return DEFAULT_DRIVER;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_DRIVER;
    }
  }

  public static saveDriver(driver: Driver): void {
    try {
      localStorage.setItem(DRIVER_STORAGE_KEY, JSON.stringify(driver));
    } catch (e) {
      console.error('Failed to save driver to localStorage', e);
    }
  }

  public static clearAllData(): void {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    localStorage.removeItem(GOALS_STORAGE_KEY);
    localStorage.removeItem(DRIVER_STORAGE_KEY);
    localStorage.removeItem('apex_telemetry_sessions_v1');
    localStorage.removeItem('apex_telemetry_goals_v1');
    this.saveSessions([]);
    this.saveGoals([]);
    this.saveDriver(DEFAULT_DRIVER);
  }

  public static resetToDefaults(): void {
    this.clearAllData();
  }
}
