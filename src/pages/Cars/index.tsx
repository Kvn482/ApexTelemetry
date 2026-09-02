import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car as CarIcon, ArrowRight, Gauge, Zap, Flag, Timer } from 'lucide-react';
import { CarService } from '../../services/carService';
import { Badge } from '../../components/ui/Badge';
import { formatLapTime } from '../../utils/formatters';

export const CarsPage: React.FC = () => {
  const navigate = useNavigate();
  const cars = CarService.getAll();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
          GT3 Machinery & Telemetry Garage
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Vehicle engineering specifications, track matrix records, and stint mileage.
        </p>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cars.map(car => {
          const stats = CarService.getCarStats(car.id);

          return (
            <div
              key={car.id}
              onClick={() => navigate(`/cars/${car.id}`)}
              className="bg-[#0e1526] rounded-2xl border border-slate-800 p-6 shadow-xl hover:border-slate-700 cursor-pointer transition-all duration-150 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Color Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: car.accentColor }}
              />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {car.manufacturer}
                  </span>
                  <Badge variant="cyan">{car.class}</Badge>
                </div>

                <h3 className="text-xl font-black text-white mt-1 group-hover:text-cyan-400 transition-colors">
                  {car.model}
                </h3>

                {/* Technical Specs Pills */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                    {car.powerHp} HP
                  </span>
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                    {car.weightKg} kg
                  </span>
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                    {car.driveTrain} Layout
                  </span>
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                    Top: {car.topSpeedKmh} km/h
                  </span>
                </div>

                {/* Performance Matrix Summary Box */}
                <div className="mt-5 grid grid-cols-3 gap-3 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Overall Best
                    </span>
                    <span className="text-sm font-black text-cyan-400 telemetry-mono mt-0.5 block">
                      {formatLapTime(stats.overallBestLap)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Circuits
                    </span>
                    <span className="text-sm font-black text-white telemetry-mono mt-0.5 block">
                      {stats.tracksCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Laps
                    </span>
                    <span className="text-sm font-black text-white telemetry-mono mt-0.5 block">
                      {stats.totalLaps}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{stats.sessionsCount} Sessions logged</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Performance Matrix</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

