export function getScoreColor(score: number): string {
  if (score >= 9.0) return '#FFD700'
  if (score >= 7.5) return '#4ADE80'
  if (score >= 6.0) return '#60A5FA'
  if (score >= 4.0) return '#F59E0B'
  return '#EF4444'
}

export function getScoreClass(score: number): string {
  if (score >= 9.0) return 'elite'
  if (score >= 7.5) return 'great'
  if (score >= 6.0) return 'good'
  if (score >= 4.0) return 'avg'
  return 'poor'
}

export function getScoreDashOffset(score: number, circumference = 131.9): number {
  return circumference * (1 - score / 10)
}
