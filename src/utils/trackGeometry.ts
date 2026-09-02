/**
 * Utility to calculate real-time car coordinates and rotation on SVG track paths
 */

// Cache SVG path elements for fast distance-to-point queries
const pathElementCache = new Map<string, SVGPathElement>();

function getOrCreatePath(svgPathD: string): SVGPathElement {
  if (typeof document === 'undefined') {
    // SSR / test fallback
    return {
      getTotalLength: () => 1000,
      getPointAtLength: (len: number) => ({ x: len, y: 100 }),
    } as unknown as SVGPathElement;
  }

  let el = pathElementCache.get(svgPathD);
  if (!el) {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', svgPathD);
    pathElementCache.set(svgPathD, el);
  }
  return el;
}

export interface TrackPointCoordinate {
  x: number;
  y: number;
  angleDeg: number;
}

/**
 * Returns the exact 2D SVG coordinates and heading angle for a car at a given progress (0 to 1)
 */
export function getCarPositionOnTrack(
  svgPathD: string,
  progress: number
): TrackPointCoordinate {
  const path = getOrCreatePath(svgPathD);
  const totalLength = path.getTotalLength();
  if (totalLength === 0) {
    return { x: 0, y: 0, angleDeg: 0 };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const currentDist = clampedProgress * totalLength;

  const currentPt = path.getPointAtLength(currentDist);

  // Look-ahead slightly to compute tangent heading
  const deltaAhead = Math.min(2, totalLength - currentDist);
  const aheadPt = path.getPointAtLength(
    currentDist + deltaAhead < totalLength ? currentDist + deltaAhead : currentDist
  );

  const dx = aheadPt.x - currentPt.x;
  const dy = aheadPt.y - currentPt.y;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    x: currentPt.x,
    y: currentPt.y,
    angleDeg: isNaN(angleDeg) ? 0 : angleDeg,
  };
}
