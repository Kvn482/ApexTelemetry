import { TrainingGoal } from '../types';
import { StorageService } from './storageService';

export class GoalService {
  public static getAll(): TrainingGoal[] {
    return StorageService.getGoals();
  }

  public static create(data: Omit<TrainingGoal, 'id' | 'createdAt'>): TrainingGoal {
    const goals = this.getAll();
    const newGoal: TrainingGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    goals.unshift(newGoal);
    StorageService.saveGoals(goals);
    return newGoal;
  }

  public static update(updated: TrainingGoal): TrainingGoal {
    const goals = this.getAll().map(g => (g.id === updated.id ? updated : g));
    StorageService.saveGoals(goals);
    return updated;
  }

  public static delete(id: string): boolean {
    const goals = this.getAll();
    const filtered = goals.filter(g => g.id !== id);
    if (filtered.length !== goals.length) {
      StorageService.saveGoals(filtered);
      return true;
    }
    return false;
  }

  public static toggleComplete(id: string): TrainingGoal | undefined {
    const goals = this.getAll();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      StorageService.saveGoals(goals);
      return goal;
    }
    return undefined;
  }

  /**
   * Calculates completion progress percentage (0 - 100%)
   * Lower lap time is better!
   */
  public static calculateProgress(goal: TrainingGoal, initialBaseline: number = 0): number {
    if (goal.completed) return 100;
    if (goal.currentBestTime <= goal.targetTime) return 100;

    const baseline = initialBaseline > goal.targetTime ? initialBaseline : goal.currentBestTime + 1.5;
    const totalDiffNeeded = baseline - goal.targetTime;
    const achievedDiff = baseline - goal.currentBestTime;

    if (totalDiffNeeded <= 0) return 100;
    const pct = Math.round((achievedDiff / totalDiffNeeded) * 100);
    return Math.max(0, Math.min(99, pct));
  }
}
