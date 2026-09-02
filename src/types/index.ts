export type SessionType = 'Practice' | 'Qualifying' | 'Race' | 'Hotlap' | 'Testing';

export type WeatherType = 'Dry' | 'Sunny' | 'Overcast' | 'Damp' | 'Wet';

export interface TrackConditions {
  airTemp: number;     // °C
  trackTemp: number;   // °C
  weather: WeatherType;
  gripLevel: number;   // % 0-100
  windSpeed: number;   // km/h
  windDirection?: string;
}

export interface TelemetryPoint {
  distance: number;    // meters from lap start
  time: number;        // seconds from lap start
  speed: number;       // km/h
  rpm: number;         // engine RPM
  gear: number;        // 0 = N, 1-6
  throttle: number;    // 0-100 %
  brake: number;       // 0-100 %
  steering: number;    // -180 to +180 degrees
  x?: number;          // SVG/GPS 2D coordinate x
  y?: number;          // SVG/GPS 2D coordinate y
  delta?: number;      // delta in seconds vs reference
}

export interface Sector {
  sectorNumber: 1 | 2 | 3;
  time: number;        // seconds (e.g. 34.521)
  personalBest?: boolean;
  sessionBest?: boolean;
}

export interface Lap {
  id: string;
  lapNumber: number;
  lapTime: number;      // total seconds (e.g. 104.102 -> 1:44.102)
  formattedTime: string;// "1:44.102"
  delta?: number;       // delta vs best lap of session (+0.412)
  sectors: [Sector, Sector, Sector];
  topSpeed: number;     // km/h
  avgSpeed: number;     // km/h
  isValid: boolean;     // track limits
  isPersonalBest?: boolean;
  isSessionBest?: boolean;
  telemetry?: TelemetryPoint[];
}

export interface Session {
  id: string;
  trackId: string;
  carId: string;
  driverId: string;
  date: string;         // ISO string "2026-09-02T14:30:00Z"
  type: SessionType;
  laps: Lap[];
  bestLapTime: number;  // seconds
  avgLapTime: number;   // seconds
  totalLaps: number;
  drivingTimeMinutes: number;
  conditions: TrackConditions;
  notes?: string;
}

export interface TrackSectorBoundaries {
  sector1EndDist: number; // meters
  sector2EndDist: number; // meters
}

export interface CornerMarker {
  number: number;
  name?: string;
  distance: number;     // meters from start
  x: number;
  y: number;
  type: 'hairpin' | 'chicane' | 'sweeper' | 'kink' | 'medium';
  suggestedGear: number;
  targetApexSpeed: number; // km/h
}

export interface Track {
  id: string;
  name: string;
  country: string;
  flagCode: string;
  lengthMeters: number;
  turns: number;
  recordLapTime: number;       // All-time record in seconds
  recordHolder: string;
  recordCar: string;
  corners: CornerMarker[];
  sectorBoundaries: TrackSectorBoundaries;
  svgPath: string;             // SVG path definition of the circuit layout
  viewBox: string;             // e.g. "0 0 800 500"
  description: string;
}

export interface Car {
  id: string;
  manufacturer: string;
  model: string;
  class: 'GT3' | 'Hypercar' | 'LMP2' | 'Formula';
  year: number;
  powerHp: number;
  weightKg: number;
  driveTrain: 'FR' | 'MR' | 'RR' | 'AWD';
  topSpeedKmh: number;
  accentColor: string;
  imageUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  team: string;
  safetyRating: string;
  irating: number;
  country: string;
  avatarUrl?: string;
  status: 'In Pits' | 'On Track' | 'Offline';
}

export interface TrainingGoal {
  id: string;
  trackId: string;
  carId?: string;
  title: string;
  targetTime: number;      // target lap time in seconds
  currentBestTime: number; // current best in seconds
  deadlineDate?: string;
  category: 'Lap Time' | 'Consistency' | 'Braking' | 'Corner Speed';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface EngineerInsight {
  id: string;
  cornerNumber: number;
  cornerName: string;
  distanceMeters: number;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  category: 'braking' | 'apex_speed' | 'throttle' | 'consistency';
  title: string;
  observation: string;
  recommendation: string;
  potentialGainSec: number;
  userValue: number;
  refValue: number;
  unit: string;
}

export interface ColumnMapping {
  distance: string;
  time: string;
  speed: string;
  rpm: string;
  gear: string;
  throttle: string;
  brake: string;
  steering: string;
}

export interface FilterOptions {
  trackId?: string;
  carId?: string;
  sessionType?: SessionType;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'lapTime' | 'laps';
  sortOrder?: 'asc' | 'desc';
}
