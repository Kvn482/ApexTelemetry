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
  rpmA: number;
  rpmB: number;
  delta: number; // seconds (timeA - timeB)
}

export class ComparisonService {
  /**
   * Aligns two telemetry traces along distance and computes continuous delta and side-by-side telemetry.
   * When lap times are provided, ensures the final point aligns with the official transponder delta.
   */
  public static alignLaps(
    telemetryA: TelemetryPoint[],
    telemetryB: TelemetryPoint[],
    lapTimeA?: number,
    lapTimeB?: number
  ): ComparisonPoint[] {
    if (!telemetryA.length || !telemetryB.length) return [];

    const aligned: ComparisonPoint[] = [];
    const lenB = telemetryB.length;
    const lastPtB = telemetryB[lenB - 1];

    // Use telemetryA distance samples as baseline
    for (let i = 0; i < telemetryA.length; i++) {
      const ptA = telemetryA[i];
      const dist = ptA.distance;

      // Find closest or linearly interpolate ptB at this distance
      let ptB = telemetryB[0];
      if (dist >= lastPtB.distance) {
        ptB = lastPtB;
      } else {
        for (let j = 0; j < lenB - 1; j++) {
          if (telemetryB[j].distance <= dist && telemetryB[j + 1].distance >= dist) {
            const span = telemetryB[j + 1].distance - telemetryB[j].distance;
            const ratio = span > 0 ? (dist - telemetryB[j].distance) / span : 0;
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
        rpmA: ptA.rpm,
        rpmB: ptB.rpm,
        delta,
      });
    }

    // Ensure the final point matches the official transponder lap times and overall delta
    if (lapTimeA !== undefined && lapTimeB !== undefined && aligned.length > 0) {
      const officialDelta = parseFloat((lapTimeA - lapTimeB).toFixed(3));
      const last = aligned[aligned.length - 1];

      // If the last telemetry sample is slightly before the line, ensure the finish reaches the official delta
      if (Math.abs(last.delta - officialDelta) > 0.001) {
        aligned.push({
          ...last,
          distance: Math.round(last.distance + 15),
          timeA: lapTimeA,
          timeB: lapTimeB,
          delta: officialDelta,
        });
      }
    }

    return aligned;
  }
}
