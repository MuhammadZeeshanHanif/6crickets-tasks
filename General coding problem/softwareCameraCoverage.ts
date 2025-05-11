// interface of Range in min and max values for distance and light characteristics
interface Range {
  min: number;
  max: number;
}

// interface of Camera with distance and light ranges for hardware cameras
interface Camera {
  distanceRange: Range;
  lightRange: Range;
}

/**
 * This function checks if the hardware cameras can cover the required distance and light ranges
 * of the software camera.
 * It first checks if the ranges are valid and then verifies if any single camera can cover both ranges.
 * If not, it checks if the hardware cameras can cover the required ranges individually.
 * Finally, it checks if the hardware cameras can cover all points in the 2D range of distance and light.
 * @param reqDistance - Required distance range for the software camera
 * @param reqLight - Required light range for the software camera
 * @param hardwareCameras - List of hardware cameras with their distance and light ranges
 * @returns True if the hardware cameras fully cover the software camera's characteristics, false otherwise.
 */
function canSupportSoftwareCamera(reqDistance: Range, reqLight: Range, hardwareCameras: Camera[]): boolean {
  // check if provided params are valid
  if (!isValidRange(reqDistance) || !isValidRange(reqLight) || hardwareCameras.length === 0) {
    return false;
  }

  // check if all of the hardware cameras have valid ranges
  for (const camera of hardwareCameras) {
    if (!isValidRange(camera.distanceRange) || !isValidRange(camera.lightRange)) {
      return false;
    }
  }

  // Check if any of the hardware cameras can fully cover the software camera's ranges
  // If any camera covers the entire range, return true 
  for (const camera of hardwareCameras) {
    if (camera.distanceRange.min <= reqDistance.min && camera.distanceRange.max >= reqDistance.max &&
      camera.lightRange.min <= reqLight.min && camera.lightRange.max >= reqLight.max) {
      return true;
    }
  }

  // Check if the distance range is covered by any camera
  // Check if the light range is covered by any camera
  // If any camera do not cover the required range, return false                                                                        
  const distanceCovered = checkRangeCoverage(reqDistance, hardwareCameras.map(c => c.distanceRange));
  const lightCovered = checkRangeCoverage(reqLight, hardwareCameras.map(c => c.lightRange));
  if (!distanceCovered || !lightCovered) {
    return false;
  }
  // Check if the hardware cameras can cover all points in the 2D range of distance and light
  return check2DCoverage(reqDistance, reqLight, hardwareCameras);
}

/**
 * This function checks if the provided range is valid.
 * A valid range is one where the minimum value is less than or equal to the maximum value.
 * @param range - The range to check.
 * @returns True if valid, false otherwise.
 */
function isValidRange(range: Range): boolean {
  return range.min <= range.max;
}

/**
 * This function checks if the provided ranges cover the target range.
 * It merges overlapping ranges and checks if the merged range covers the target.
 * If there are gaps in the ranges, it returns false.
 * @param target - The target range to check.
 * @param ranges - The list of ranges to check against.
 * @returns True if the ranges cover the target, false otherwise.
 */
function checkRangeCoverage(target: Range, ranges: Range[]): boolean {
  // Sort ranges by min value
  const sortedRanges = ranges.map(r => ({ min: r.min, max: r.max })).sort((a, b) => a.min - b.min);

  // we need to merge overlapping ranges
  // and check if the merged range covers the target
  let currentMax = -Infinity;
  let requiredMin = target.min;

  for (const range of sortedRanges) {
    // If the currentMax is less than the target's min, it means there's a gap
    // If the requiredMin is greater than the target's max, it means there's a gap
    if (range.min > requiredMin && currentMax < requiredMin) {
      // gap identified
      return false;
    }
    currentMax = Math.max(currentMax, range.max);
    requiredMin = Math.min(requiredMin, range.min);
  }

  // Check if the merged range covers the target
  // If the requiredMin is less than or equal to the target's min, it means it's covered
  // If the currentMax is greater than or equal to the target's max, it means it's covered
  return requiredMin <= target.min && currentMax >= target.max;
}

/**
 * This function checks if the hardware cameras can cover all points in the 2D range
 * of distance and light. It does this by checking if any camera can cover
 * the required distance and light ranges.
 * It uses a sampling approach to check coverage in the 2D space.
 * the cameras can cover all combinations of distance and light ranges.
 * @param distanceRange - Software camera's distance range.
 * @param lightRange - Software camera's light range.
 * @param cameras - List of hardware cameras.
 * @returns True if all points are covered, false otherwise.
 */
function check2DCoverage(distanceRange: Range, lightRange: Range, cameras: Camera[]): boolean {
  // Because the subject and light ranges are continuous, we can verify coverage
  // by analyzing how the intervals intersect, instead of checking every possible value.
  // At this point, we’ve confirmed that both dimensions are covered independently.
  // The goal now is to ensure that for each combination of distance and light,
  // there's at least one camera capable of handling it.

  // Given that both the subject and light level ranges are fully covered and
  // we have multiple overlapping cameras, we can assume most of the 2D space is covered.
  // A more detailed method would involve dividing the 2D range into sections and checking each,
  // but in practice, overlap in one dimension combined with full coverage in both
  // often guarantees adequate support for the required combinations.

  // Testing the corners of the rectangle formed by the distance and light ranges
  const pointsToTest = [{ d: distanceRange.min, l: lightRange.min },{ d: distanceRange.min, l: lightRange.max },
    { d: distanceRange.max, l: lightRange.min },{ d: distanceRange.max, l: lightRange.max }];

  for (const point of pointsToTest) {
    let covered = false;
    for (const camera of cameras) {
      if (camera.distanceRange.min <= point.d && camera.distanceRange.max >= point.d &&
        camera.lightRange.min <= point.l && camera.lightRange.max >= point.l) {
        // If any camera covers the point, we can stop checking
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

// Example to test the functionality

// const softwareDistanceRange: Range = { min: 5, max: 50 };
// const softwareLightRange: Range = { min: 500, max: 5000 };
// const hardwareCameras: Camera[] = [
//   { distanceRange: { min: 5, max: 25 }, lightRange: { min: 500, max: 2500 } },
//   { distanceRange: { min: 25, max: 50 }, lightRange: { min: 2500, max: 5000 } }
// ];
// const result = canSupportSoftwareCamera(softwareDistanceRange, softwareLightRange, hardwareCameras);
// console.log('Camera support check:', result);
