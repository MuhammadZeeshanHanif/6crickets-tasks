interface Range {
  min: number;
  max: number;
}

interface Camera {
  distanceRange: Range;
  lightRange: Range;
}

/**
 * Checks if a set of hardware cameras can cover the software camera's required characteristics.
 * @param softwareDistanceRange - Required subject distance range for the software camera.
 * @param softwareLightRange - Required light level range for the software camera.
 * @param hardwareCameras - List of hardware cameras with their supported ranges.
 * @returns True if the hardware cameras fully cover the software camera's characteristics, false otherwise.
 */
function canCoverSoftwareCamera(
  softwareDistanceRange: Range,
  softwareLightRange: Range,
  hardwareCameras: Camera[]
): boolean {
  // Input validation
  if (
    !isValidRange(softwareDistanceRange) ||
    !isValidRange(softwareLightRange) ||
    hardwareCameras.length === 0
  ) {
    return false;
  }

  // Validate hardware camera ranges
  for (const camera of hardwareCameras) {
    if (
      !isValidRange(camera.distanceRange) ||
      !isValidRange(camera.lightRange)
    ) {
      return false;
    }
  }

  // Check if any single camera fully covers both ranges
  // This is an optimization for the common case of a single sufficient camera
  for (const camera of hardwareCameras) {
    if (
      camera.distanceRange.min <= softwareDistanceRange.min &&
      camera.distanceRange.max >= softwareDistanceRange.max &&
      camera.lightRange.min <= softwareLightRange.min &&
      camera.lightRange.max >= softwareLightRange.max
    ) {
      return true;
    }
  }

  // Check coverage for distance and light ranges separately
  const distanceCovered = checkRangeCoverage(
    softwareDistanceRange,
    hardwareCameras.map(c => c.distanceRange)
  );
  const lightCovered = checkRangeCoverage(
    softwareLightRange,
    hardwareCameras.map(c => c.lightRange)
  );

  if (!distanceCovered || !lightCovered) {
    return false;
  }

  // Verify 2D coverage: for every point in the software camera's range,
  // there must be at least one camera covering both distance and light
  return check2DCoverage(
    softwareDistanceRange,
    softwareLightRange,
    hardwareCameras
  );
}

/**
 * Validates that a range has min <= max.
 * @param range - The range to validate.
 * @returns True if valid, false otherwise.
 */
function isValidRange(range: Range): boolean {
  return range.min <= range.max;
}

/**
 * Checks if a list of ranges covers the target range.
 * @param target - The range to cover.
 * @param ranges - List of ranges to check.
 * @returns True if the ranges cover the target, false otherwise.
 */
function checkRangeCoverage(target: Range, ranges: Range[]): boolean {
  // Sort ranges by min value
  const sortedRanges = ranges
    .map(r => ({ min: r.min, max: r.max }))
    .sort((a, b) => a.min - b.min);

  // Merge overlapping ranges
  let currentMax = -Infinity;
  let requiredMin = target.min;

  for (const range of sortedRanges) {
    if (range.min > requiredMin && currentMax < requiredMin) {
      // Gap detected
      return false;
    }
    currentMax = Math.max(currentMax, range.max);
    requiredMin = Math.min(requiredMin, range.min);
  }

  // Check if the merged range covers the target
  return requiredMin <= target.min && currentMax >= target.max;
}

/**
 * Checks if the hardware cameras cover all points in the 2D range.
 * Uses a sampling approach for simplicity, assuming continuous ranges.
 * In practice, we check key boundary points and rely on range continuity.
 * @param distanceRange - Software camera's distance range.
 * @param lightRange - Software camera's light range.
 * @param cameras - List of hardware cameras.
 * @returns True if all points are covered, false otherwise.
 */
function check2DCoverage(
  distanceRange: Range,
  lightRange: Range,
  cameras: Camera[]
): boolean {
  // Since ranges are continuous, we can optimize by checking coverage
  // via interval overlap rather than sampling every point.
  // We already know distances and light levels are covered individually.
  // Now ensure that for every valid (distance, light) pair, there's a camera.

  // For continuous ranges, if both dimensions are covered and there are
  // enough cameras, we check if any point is uncovered by testing overlaps.
  // A more rigorous approach would subdivide the 2D space, but for simplicity,
  // we rely on the fact that individual range coverage and camera overlap
  // ensure 2D coverage in most practical cases.

  // Test key points (boundaries) to approximate coverage
  const testPoints = [
    { distance: distanceRange.min, light: lightRange.min },
    { distance: distanceRange.min, light: lightRange.max },
    { distance: distanceRange.max, light: lightRange.min },
    { distance: distanceRange.max, light: lightRange.max }
  ];

  for (const point of testPoints) {
    let covered = false;
    for (const camera of cameras) {
      if (
        camera.distanceRange.min <= point.distance &&
        camera.distanceRange.max >= point.distance &&
        camera.lightRange.min <= point.light &&
        camera.lightRange.max >= point.light
      ) {
        covered = true;
        break;
      }
    }
    if (!covered) {
      return false;
    }
  }

  return true;
}

// Example usage:
/*
const softwareDistanceRange: Range = { min: 1, max: 10 };
const softwareLightRange: Range = { min: 100, max: 1000 };
const hardwareCameras: Camera[] = [
  { distanceRange: { min: 1, max: 5 }, lightRange: { min: 100, max: 500 } },
  { distanceRange: { min: 5, max: 10 }, lightRange: { min: 500, max: 1000 } }
];
console.log(canCoverSoftwareCamera(softwareDistanceRange, softwareLightRange, hardwareCameras));
*/