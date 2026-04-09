/**
 * Mean reaction time (ms).
 */
export function computeMeanRT(reactionTimes: number[]): number {
  if (reactionTimes.length === 0) return 0;
  return reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
}

/**
 * RTISV = Reaction Time Intra-Subject Variability (SD des TR).
 * Mesure sensible au TDAH selon la littérature.
 */
export function computeRTISV(reactionTimes: number[]): number {
  if (reactionTimes.length < 2) return 0;
  const mean = computeMeanRT(reactionTimes);
  const variance =
    reactionTimes.reduce((s, rt) => s + (rt - mean) ** 2, 0) /
    reactionTimes.length;
  return Math.sqrt(variance);
}

/**
 * SSRT = Stop-Signal Reaction Time (Stop-Signal Task).
 */
export function computeSSRT(
  goRT: number[],
  ssRatio: number,
  ssd: number
): number {
  const sortedGo = [...goRT].sort((a, b) => a - b);
  const nthPercentile = Math.floor(ssRatio * sortedGo.length);
  return (sortedGo[nthPercentile] ?? sortedGo.at(-1) ?? 500) - ssd;
}

/**
 * Switch cost (Task-Switching).
 */
export function computeSwitchCost(
  switchTrialsRT: number[],
  repeatTrialsRT: number[]
): number {
  const mean = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;
  return mean(switchTrialsRT) - mean(repeatTrialsRT);
}
