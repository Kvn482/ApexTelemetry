import { TrainingGoal } from '../types';

export const INITIAL_GOALS: TrainingGoal[] = [
  {
    id: 'goal-1',
    trackId: 'sebring',
    carId: 'ferrari-296-gt3',
    title: 'Break 1:43.500 barrier at Sebring',
    targetTime: 103.500, // 1:43.500
    currentBestTime: 104.102, // 1:44.102
    deadlineDate: '2026-10-15',
    category: 'Lap Time',
    completed: false,
    notes: 'Focus on trail braking into Sunset Bend (Turn 17) and earlier throttle pickup at Cunningham.',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'goal-2',
    trackId: 'imola',
    carId: 'porsche-992-gt3-r',
    title: 'Sub 1:43.800 qualifying pace at Imola',
    targetTime: 103.800, // 1:43.800
    currentBestTime: 104.183, // 1:44.183
    deadlineDate: '2026-09-30',
    category: 'Lap Time',
    completed: false,
    notes: 'Maximize kerb usage at Variante Alta without getting track limit warnings.',
    createdAt: '2026-08-20T12:00:00Z',
  },
  {
    id: 'goal-3',
    trackId: 'spa',
    carId: 'ferrari-296-gt3',
    title: 'Target 2:17.500 at Spa-Francorchamps',
    targetTime: 137.500, // 2:17.500
    currentBestTime: 138.421, // 2:18.421
    deadlineDate: '2026-10-01',
    category: 'Lap Time',
    completed: false,
    notes: 'Carry higher minimum apex speed through Pouhon and Blanchimont.',
    createdAt: '2026-08-25T14:00:00Z',
  },
  {
    id: 'goal-4',
    trackId: 'silverstone',
    carId: 'bmw-m4-gt3',
    title: 'Achieve 1:57.900 at Silverstone',
    targetTime: 117.900,
    currentBestTime: 118.421,
    deadlineDate: '2026-11-01',
    category: 'Lap Time',
    completed: false,
    notes: 'Commit to flat out through Maggotts without lift.',
    createdAt: '2026-08-28T09:00:00Z',
  },
  {
    id: 'goal-5',
    trackId: 'monza',
    carId: 'lamborghini-huracan-gt3',
    title: 'Break 1:46.000 at Monza Temple of Speed',
    targetTime: 106.000,
    currentBestTime: 105.890,
    deadlineDate: '2026-08-30',
    category: 'Lap Time',
    completed: true,
    notes: 'Nailed the Ascari chicane exit and braking into Rettifilo.',
    createdAt: '2026-08-10T08:00:00Z',
  },
];
