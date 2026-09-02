import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatLapTime } from '../../utils/formatters';

interface LapReplayerProps {
  lapTimeSeconds: number;
  totalDistance: number;
  currentTime: number;
  onTimeUpdate: (newTime: number) => void;
  className?: string;
}

export const LapReplayer: React.FC<LapReplayerProps> = ({
  lapTimeSeconds,
  currentTime,
  onTimeUpdate,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const lastRafTimeRef = useRef<number | null>(null);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    let animationFrameId: number;

    const loop = (now: number) => {
      if (lastRafTimeRef.current !== null) {
        const deltaSec = (now - lastRafTimeRef.current) / 1000;
        const nextTime = currentTimeRef.current + deltaSec * speedMultiplier;

        if (nextTime >= lapTimeSeconds) {
          onTimeUpdate(lapTimeSeconds);
          setIsPlaying(false);
          lastRafTimeRef.current = null;
          return;
        } else {
          onTimeUpdate(nextTime);
        }
      }
      lastRafTimeRef.current = now;
      animationFrameId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastRafTimeRef.current = null;
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, speedMultiplier, lapTimeSeconds, onTimeUpdate]);

  const handleTogglePlay = () => {
    if (currentTime >= lapTimeSeconds) {
      onTimeUpdate(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    onTimeUpdate(0);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onTimeUpdate(newTime);
  };

  const speedOptions = [0.5, 1, 2, 4];

  return (
    <div
      className={`bg-[#0b111e] rounded-xl border border-slate-800 p-4 shadow-xl select-none ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleTogglePlay}
            icon={isPlaying ? Pause : Play}
          >
            {isPlaying ? 'Pause' : 'Play Lap'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            icon={RotateCcw}
            title="Restart Lap"
          >
            Restart
          </Button>

          {/* Speed Multipliers */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 ml-2">
            {speedOptions.map(spd => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-1 text-xs font-bold rounded ${
                  speedMultiplier === spd
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex-1 w-full max-w-xl flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-slate-300 min-w-[54px]">
            {formatLapTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={lapTimeSeconds}
            step={0.05}
            value={currentTime}
            onChange={handleScrubberChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />

          <span className="text-xs font-mono font-semibold text-slate-400 min-w-[54px]">
            {formatLapTime(lapTimeSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
