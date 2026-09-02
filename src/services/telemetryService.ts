import { TelemetryPoint, Track } from '../types';
import { MOCK_TRACKS } from '../data/mockTracks';

/**
 * Generates realistic high-density telemetry data for a track lap
 * Produces ~250-350 distance sample points with realistic braking, throttle, RPM, gear, and steering
 */
export function generateRealisticTelemetry(
  track: Track,
  targetLapTimeSec: number,
  isReference: boolean = false,
  varianceMultiplier: number = 0.0
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const totalDist = track.lengthMeters;
  const numPoints = 280;
  const stepDist = totalDist / numPoints;

  // We sort corners by distance
  const sortedCorners = [...track.corners].sort((a, b) => a.distance - b.distance);

  let currentTime = 0;
  const nominalAvgSpeed = (totalDist / targetLapTimeSec) * 3.6; // km/h

  for (let i = 0; i <= numPoints; i++) {
    const dist = Math.min(i * stepDist, totalDist);

    // Find closest upcoming or current corner
    let closestCorner = sortedCorners[0];
    let minCornerDist = Infinity;

    for (const c of sortedCorners) {
      const d = Math.abs(dist - c.distance);
      if (d < minCornerDist) {
        minCornerDist = d;
        closestCorner = c;
      }
    }

    const distToApex = dist - closestCorner.distance; // negative before apex, positive after

    let speed: number;
    let throttle: number;
    let brake: number;
    let gear: number;
    let steering: number;

    const cornerApexSpeed = closestCorner.targetApexSpeed * (isReference ? 1.02 : (1 - varianceMultiplier * 0.03));
    const brakingZoneLength = 140; // meters before corner
    const exitZoneLength = 120;    // meters after corner

    if (distToApex < -brakingZoneLength) {
      // Straight / Full acceleration
      const straightProgress = Math.min(1, Math.abs(distToApex + brakingZoneLength) / 300);
      speed = Math.min(285, cornerApexSpeed + 80 + straightProgress * 65);
      throttle = 100;
      brake = 0;
      steering = (Math.sin(dist / 60) * 1.5); // micro straight adjustments
      gear = speed > 240 ? 6 : speed > 200 ? 5 : speed > 155 ? 4 : 3;
    } else if (distToApex >= -brakingZoneLength && distToApex < -15) {
      // Heavy braking & downshifting zone
      const brakeProgress = (distToApex + brakingZoneLength) / (brakingZoneLength - 15);
      // Hard initial hit then trail off
      brake = Math.min(100, Math.max(15, (1 - Math.pow(brakeProgress, 1.4)) * 95));
      throttle = 0;
      const decelFactor = Math.pow(brakeProgress, 1.2);
      const topApproachSpeed = Math.min(275, cornerApexSpeed + 110);
      speed = topApproachSpeed - (topApproachSpeed - cornerApexSpeed) * decelFactor;
      steering = (closestCorner.number % 2 === 0 ? 1 : -1) * (brakeProgress * 15);
      gear = Math.max(closestCorner.suggestedGear, Math.floor(speed / 48));
    } else if (distToApex >= -15 && distToApex <= 25) {
      // Apex zone: trail brake ending, steering peak, transition to throttle
      brake = Math.max(0, 15 - (distToApex + 15) * 0.7);
      throttle = distToApex > 5 ? (distToApex - 5) * 4 : 0;
      speed = cornerApexSpeed + (Math.abs(distToApex) < 5 ? 0 : 4);
      const turnDir = closestCorner.number % 2 === 0 ? 1 : -1;
      const steerMagnitude = closestCorner.type === 'hairpin' ? 68 : closestCorner.type === 'chicane' ? 52 : 38;
      steering = turnDir * (steerMagnitude * (1 - Math.abs(distToApex) / 35));
      gear = closestCorner.suggestedGear;
    } else if (distToApex > 25 && distToApex <= exitZoneLength) {
      // Corner exit acceleration
      const exitProgress = (distToApex - 25) / (exitZoneLength - 25);
      brake = 0;
      throttle = Math.min(100, 35 + exitProgress * 65);
      speed = cornerApexSpeed + exitProgress * 65;
      const turnDir = closestCorner.number % 2 === 0 ? 1 : -1;
      steering = turnDir * (30 * (1 - exitProgress));
      gear = Math.max(closestCorner.suggestedGear, Math.floor(speed / 48));
    } else {
      // Connecting straight
      speed = Math.min(275, cornerApexSpeed + 80);
      throttle = 100;
      brake = 0;
      steering = (Math.sin(dist / 50) * 1.8);
      gear = speed > 220 ? 5 : 4;
    }

    // RPM based on speed and gear
    const gearRatios = [0, 68, 52, 42, 35, 30, 26];
    const currentGearRatio = gearRatios[gear] || 32;
    let rpm = Math.round(speed * currentGearRatio + 1500);
    rpm = Math.min(8500, Math.max(4200, rpm));

    // Time elapsed calculation (dt = ds / v)
    const speedMs = Math.max(15, (speed * 1000) / 3600);
    if (i > 0) {
      const dt = stepDist / speedMs;
      currentTime += dt;
    }

    points.push({
      distance: Math.round(dist),
      time: parseFloat(currentTime.toFixed(3)),
      speed: Math.round(speed),
      rpm,
      gear,
      throttle: Math.round(throttle),
      brake: Math.round(brake),
      steering: parseFloat(steering.toFixed(1)),
    });
  }

  // Rescale time to match exact targetLapTimeSec precisely
  const actualGeneratedTime = points[points.length - 1].time;
  if (actualGeneratedTime > 0) {
    const timeScale = targetLapTimeSec / actualGeneratedTime;
    for (const pt of points) {
      pt.time = parseFloat((pt.time * timeScale).toFixed(3));
    }
  }

  return points;
}

/**
 * Retrieves or generates telemetry for a given session lap
 */
export function getLapTelemetry(trackId: string, targetLapTime: number, isReference = false, seedVariance = 0): TelemetryPoint[] {
  const track = MOCK_TRACKS.find(t => t.id === trackId) || MOCK_TRACKS[0];
  return generateRealisticTelemetry(track, targetLapTime, isReference, seedVariance);
}
