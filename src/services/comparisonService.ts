import { TelemetryPoint } from '../types';

export interface ComparisonPoint {
  distance: number;
  timeA: number;
  timeB: number;
  speedA: number;
  speedB: number;
  throttleA: number;
  throttleB: number;
  brakeA: number;
  brakeB: number;
  steeringA: number;
  steeringB: number;
  gearA: number;
  gearB: number;
  delta: number; // seconds (timeA - timeB)
}

export class ComparisonService {
  /**
   * Aligns two telemetry traces along distance and computes continuous delta and side-by-side telemetry
   */
  public static alignLaps(
    telemetryA: TelemetryPoint[],
    telemetryB: TelemetryPoint[]
  ): ComparisonPoint[] {
    if (!telemetryA.length || !telemetryB.length) return [];

    const aligned: ComparisonPoint[] = [];

    // Use telemetryA distance samples as baseline
    for (let i = 0; i < telemetryA.length; i++) {
      const ptA = telemetryA[i];
      const dist = ptA.distance;

      // Find closest or linearly interpolate ptB at this distance
      let ptB = telemetryB[0];
      for (let j = 0; j < telemetryB.length - 1; j++) {
        if (telemetryB[j].distance <= dist && telemetryB[j + 1].distance >= dist) {
          const ratio = (dist - telemetryB[j].distance) / (telemetryB[j + 1].distance - telemetryB[j].distance || 1);
          ptB = {
            distance: dist,
            time: telemetryB[j].time + ratio * (telemetryB[j + 1].time - telemetryB[j].time),
            speed: Math.round(telemetryB[j].speed + ratio * (telemetryB[j + 1].speed - telemetryB[j].speed)),
            rpm: Math.round(telemetryB[j].rpm + ratio * (telemetryB[j + 1].rpm - telemetryB[j].rpm)),
            gear: telemetryB[j].gear,
            throttle: Math.round(telemetryB[j].throttle + ratio * (telemetryB[j + 1].throttle - telemetryB[j].throttle)),
            brake: Math.round(telemetryB[j].brake + ratio * (telemetryB[j + 1].brake - telemetryB[j].brake)),
            steering: parseFloat((telemetryB[j].steering + ratio * (telemetryB[j + 1].steering - telemetryB[j].steering)).toFixed(1)),
          };
          break;
        }
      }

      const delta = parseFloat((ptA.time - ptB.time).toFixed(3));

      aligned.push({
        distance: dist,
        timeA: ptA.time,
        timeB: ptB.time,
        speedA: ptA.speed,
        speedB: ptB.speed,
        throttleA: ptA.throttle,
        throttleB: ptB.throttle,
        brakeA: ptA.brake,
        brakeB: ptB.brake,
        steeringA: ptA.steering,
        steeringB: ptB.steering,
        gearA: ptA.gear,
        gearB: ptB.gear,
        delta,
      });
    }

    return aligned;
  }
}
