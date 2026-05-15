import type { Restroom, UserPreferences } from '@/types/database'

function baseAccess(accessType: Restroom['access_type']): number {
  switch (accessType) {
    case 'free':
      return 1.0
    case 'purchase_required':
      return 0.6
    case 'code_required':
      return 0.3
  }
}

function weights(urgency: UserPreferences['urgency']): [number, number, number] {
  switch (urgency) {
    case 1:
      return [0.6, 0.25, 0.15]
    case 2:
      return [0.45, 0.4, 0.15]
    case 3:
      return [0.25, 0.55, 0.2]
    case 4:
      return [0.1, 0.65, 0.25]
  }
}

export function passesHardFilters(
  r: Restroom,
  preferences: UserPreferences,
): boolean {
  if (preferences.needs_accessible && !r.is_accessible) {
    return false
  }
  if (preferences.access_tolerance === 'free_only') {
    if (
      r.access_type === 'purchase_required' ||
      r.access_type === 'code_required'
    ) {
      return false
    }
  }
  if (preferences.access_tolerance === 'free_or_purchase') {
    if (r.access_type === 'code_required') {
      return false
    }
  }
  if (preferences.urgency === 4 && r.access_type === 'code_required') {
    return false
  }
  return true
}

export function accessScore(
  r: Restroom,
  preferences: UserPreferences,
): number {
  let access = baseAccess(r.access_type)
  if (preferences.urgency === 4 && r.access_type === 'purchase_required') {
    access *= 0.3
  }
  if (preferences.urgency === 3 && r.access_type === 'code_required') {
    access *= 0.6
  }
  return access
}

export function scoreRestroom(
  r: Restroom,
  preferences: UserPreferences,
): number {
  const cleanliness = (r.avg_cleanliness ?? 3) / 5
  const distance = Math.max(0, 1 - r.distance_meters / 3000)
  const access = accessScore(r, preferences)
  const [wC, wD, wA] = weights(preferences.urgency)
  return cleanliness * wC + distance * wD + access * wA
}

export function recommendRestrooms(
  restrooms: Restroom[],
  preferences: UserPreferences,
): Restroom[] {
  const scored = restrooms
    .filter((r) => passesHardFilters(r, preferences))
    .map((r) => ({ r, score: scoreRestroom(r, preferences) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ r }) => r)

  return scored
}
