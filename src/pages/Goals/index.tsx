import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Trophy, Clock, Trash2, Calendar } from 'lucide-react';
import { GoalService } from '../../services/goalService';
import { TrackService } from '../../services/trackService';
import { CarService } from '../../services/carService';
import { TrainingGoal } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatLapTime, formatDelta, parseLapTimeToSeconds } from '../../utils/formatters';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<TrainingGoal[]>(() => GoalService.getAll());
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  const [trackId, setTrackId] = useState('sebring');
  const [carId, setCarId] = useState('ferrari-296-gt3');
  const [title, setTitle] = useState('');
  const [targetTimeStr, setTargetTimeStr] = useState('1:43.500');
  const [currentBestStr, setCurrentBestStr] = useState('1:44.102');
  const [category, setCategory] = useState<TrainingGoal['category']>('Lap Time');
  const [deadline, setDeadline] = useState('2026-10-31');
  const [notes, setNotes] = useState('');

  const tracks = TrackService.getAll();
  const cars = CarService.getAll();

  const handleToggleComplete = (id: string) => {
    GoalService.toggleComplete(id);
    setGoals(GoalService.getAll());
  };

  const handleDeleteGoal = (id: string) => {
    GoalService.delete(id);
    setGoals(GoalService.getAll());
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSeconds = parseLapTimeToSeconds(targetTimeStr) || 103.5;
    const currentSeconds = parseLapTimeToSeconds(currentBestStr) || 104.1;

    GoalService.create({
      trackId,
      carId,
      title: title || `Target ${targetTimeStr} at ${TrackService.getById(trackId)?.name.split(' ')[0]}`,
      targetTime: targetSeconds,
      currentBestTime: currentSeconds,
      deadlineDate: deadline,
      category,
      completed: false,
      notes,
    });

    setGoals(GoalService.getAll());
    setIsNewGoalModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            <Target size={24} className="text-cyan-400" />
            Driver Training Goals & Targets
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Establish tangible performance benchmarks, track progression targets, and review completion.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsNewGoalModalOpen(true)}
        >
          Create Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1526] rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-4">
          <Target size={36} className="mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Training Goals Set</h3>
          <p className="text-xs text-slate-400">
            Define target lap times, braking consistency objectives, or corner minimum speed milestones.
          </p>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setIsNewGoalModalOpen(true)}>
            Set First Training Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const track = TrackService.getById(goal.trackId);
            const car = CarService.getById(goal.carId || '');
            const progress = GoalService.calculateProgress(goal);
            const gap = parseFloat((goal.currentBestTime - goal.targetTime).toFixed(3));

          return (
            <div
              key={goal.id}
              className={`bg-[#0e1526] rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-all duration-150 relative overflow-hidden ${
                goal.completed
                  ? 'border-emerald-500/40 bg-emerald-950/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant={goal.completed ? 'green' : 'cyan'}>
                    {goal.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400">
                    {track?.name.split(' ')[0]}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">
                  {goal.title}
                </h3>
                {car && (
                  <p className="text-xs text-slate-400 font-medium">
                    {car.manufacturer} {car.model}
                  </p>
                )}

                {/* Section 19: Benchmark Box */}
                <div className="mt-5 grid grid-cols-3 gap-2 bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Target
                    </span>
                    <span className="text-xs font-black text-emerald-400 telemetry-mono mt-0.5 block">
                      {formatLapTime(goal.targetTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Current
                    </span>
                    <span className="text-xs font-black text-white telemetry-mono mt-0.5 block">
                      {formatLapTime(goal.currentBestTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Gap
                    </span>
                    <span
                      className={`text-xs font-black telemetry-mono mt-0.5 block ${
                        gap <= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {gap <= 0 ? 'Achieved!' : `+${gap.toFixed(3)}s`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">Completion Progress</span>
                    <span className="font-bold text-cyan-400 telemetry-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.completed ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {goal.notes && (
                  <p className="mt-3 text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleComplete(goal.id)}
                  className={`flex items-center gap-1.5 font-semibold cursor-pointer ${
                    goal.completed
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{goal.completed ? 'Goal Completed' : 'Mark Complete'}</span>
                </button>

                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                  title="Delete Goal"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* New Goal Modal */}
      <Modal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        title="Set Training Goal"
        subtitle="Define a measurable target to strive for during simulator training"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Break 1:43.500 barrier at Sebring"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Circuit
              </label>
              <select
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                {tracks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Car
              </label>
              <select
                value={carId}
                onChange={e => setCarId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                {cars.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.manufacturer} {c.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Target Lap Time
              </label>
              <input
                type="text"
                placeholder="1:43.500"
                value={targetTimeStr}
                onChange={e => setTargetTimeStr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white telemetry-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">
                Current Best Time
              </label>
              <input
                type="text"
                placeholder="1:44.102"
                value={currentBestStr}
                onChange={e => setCurrentBestStr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white telemetry-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">
              Target Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">
              Engineer Coaching Focus
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on trail braking into Sunset Bend and throttle pickup at Cunningham..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewGoalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

