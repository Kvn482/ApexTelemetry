import { EngineerInsight, Track } from '../types';
import { ComparisonPoint } from './comparisonService';

export class EngineerService {
  /**
   * Generates deterministic, telemetry-backed race engineering insights comparing Lap A against Reference Lap B
   */
  public static generateInsights(
    track: Track,
    alignedData: ComparisonPoint[],
    lapTimeA: number,
    lapTimeB: number
  ): EngineerInsight[] {
    const insights: EngineerInsight[] = [];
    if (!alignedData.length) return insights;

    const corners = track.corners;

    corners.forEach(corner => {
      // Analyze window around corner apex (-120m before apex to +80m after apex)
      const cornerWindow = alignedData.filter(
        pt => pt.distance >= corner.distance - 120 && pt.distance <= corner.distance + 80
      );

      if (!cornerWindow.length) return;

      // 1. Braking Point Analysis (find where brake > 20% starts)
      const brakingA = cornerWindow.find(pt => pt.brakeA > 20 && pt.distance < corner.distance);
      const brakingB = cornerWindow.find(pt => pt.brakeB > 20 && pt.distance < corner.distance);

      if (brakingA && brakingB) {
        const brakeDistDiff = brakingB.distance - brakingA.distance; // positive means A braked earlier than B
        if (brakeDistDiff > 8) {
          const potentialGain = parseFloat(Math.min(0.28, brakeDistDiff * 0.015).toFixed(2));
          insights.push({
            id: `insight-brake-${corner.number}`,
            cornerNumber: corner.number,
            cornerName: corner.name || `Turn ${corner.number}`,
            distanceMeters: corner.distance,
            severity: brakeDistDiff > 15 ? 'warning' : 'info',
            category: 'braking',
            title: `Braking too early into ${corner.name || `Turn ${corner.number}`}`,
            observation: `You are initiating braking approximately ${Math.round(brakeDistDiff)}m earlier than your reference lap.`,
            recommendation: `Trust the GT3 ABS. Shift your braking marker closer to the curb and brake firmly in a straight line.`,
            potentialGainSec: potentialGain,
            userValue: Math.round(brakingA.distance),
            refValue: Math.round(brakingB.distance),
            unit: 'm',
          });
        }
      }

      // 2. Minimum Corner Apex Speed
      const apexWindow = cornerWindow.filter(
        pt => pt.distance >= corner.distance - 25 && pt.distance <= corner.distance + 25
      );
      if (apexWindow.length) {
        const minSpeedA = Math.min(...apexWindow.map(p => p.speedA));
        const minSpeedB = Math.min(...apexWindow.map(p => p.speedB));
        const speedDeficit = minSpeedB - minSpeedA;

        if (speedDeficit >= 4) {
          const potentialGain = parseFloat((speedDeficit * 0.028).toFixed(2));
          insights.push({
            id: `insight-apex-${corner.number}`,
            cornerNumber: corner.number,
            cornerName: corner.name || `Turn ${corner.number}`,
            distanceMeters: corner.distance,
            severity: speedDeficit > 8 ? 'critical' : 'warning',
            category: 'apex_speed',
            title: `Low minimum apex speed at ${corner.name || `Turn ${corner.number}`}`,
            observation: `Minimum apex speed is ${Math.round(speedDeficit)} km/h lower than reference (${minSpeedA} km/h vs ${minSpeedB} km/h).`,
            recommendation: `Carry more rolling momentum off the brakes before apex; release brake pressure smoothly to prevent front tuck-in.`,
            potentialGainSec: potentialGain,
            userValue: minSpeedA,
            refValue: minSpeedB,
            unit: 'km/h',
          });
        } else if (speedDeficit <= -3) {
          // Faster than reference!
          insights.push({
            id: `insight-apex-fast-${corner.number}`,
            cornerNumber: corner.number,
            cornerName: corner.name || `Turn ${corner.number}`,
            distanceMeters: corner.distance,
            severity: 'positive',
            category: 'apex_speed',
            title: `Excellent rolling speed at ${corner.name || `Turn ${corner.number}`}`,
            observation: `Apex speed is ${Math.abs(Math.round(speedDeficit))} km/h faster than reference lap.`,
            recommendation: `Great trail braking discipline maintained high mid-corner rotational velocity.`,
            potentialGainSec: 0,
            userValue: minSpeedA,
            refValue: minSpeedB,
            unit: 'km/h',
          });
        }
      }

      // 3. Throttle Application on Exit
      const exitWindow = cornerWindow.filter(
        pt => pt.distance >= corner.distance + 10 && pt.distance <= corner.distance + 70
      );
      if (exitWindow.length) {
        const fullThrottleA = exitWindow.find(p => p.throttleA >= 90);
        const fullThrottleB = exitWindow.find(p => p.throttleB >= 90);

        if (fullThrottleA && fullThrottleB && fullThrottleA.distance > fullThrottleB.distance + 12) {
          const delayDist = fullThrottleA.distance - fullThrottleB.distance;
          const potentialGain = parseFloat((delayDist * 0.007).toFixed(2));
          insights.push({
            id: `insight-throttle-${corner.number}`,
            cornerNumber: corner.number,
            cornerName: corner.name || `Turn ${corner.number}`,
            distanceMeters: corner.distance,
            severity: 'warning',
            category: 'throttle',
            title: `Hesitant throttle pickup on exit`,
            observation: `Full throttle application was delayed by ${Math.round(delayDist)}m on exit relative to reference.`,
            recommendation: `Unwind steering earlier as you clip the apex to allow aggressive traction application on exit.`,
            potentialGainSec: potentialGain,
            userValue: Math.round(fullThrottleA.distance),
            refValue: Math.round(fullThrottleB.distance),
            unit: 'm',
          });
        }
      }
    });

    // Overall lap delta summary
    const totalDelta = parseFloat((lapTimeA - lapTimeB).toFixed(3));
    if (totalDelta > 0 && insights.length === 0) {
      insights.push({
        id: 'insight-general-delta',
        cornerNumber: 0,
        cornerName: 'Overall Lap',
        distanceMeters: 0,
        severity: 'info',
        category: 'consistency',
        title: 'Micro-time losses across transitions',
        observation: `Lap is +${totalDelta}s behind reference with steady minor deficits spread evenly across the lap.`,
        recommendation: `Focus on smoother brake release transitions into mid-corners.`,
        potentialGainSec: totalDelta,
        userValue: lapTimeA,
        refValue: lapTimeB,
        unit: 's',
      });
    }

    return insights.sort((a, b) => b.potentialGainSec - a.potentialGainSec);
  }
}
