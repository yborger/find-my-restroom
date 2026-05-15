export interface Restroom {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  access_type: 'free' | 'purchase_required' | 'code_required'
  is_accessible: boolean
  hours: string | null
  avg_cleanliness: number | null
  review_count: number
  distance_meters: number
}

export interface Rating {
  id: string
  restroom_id: string
  user_id: string | null
  cleanliness_score: number
  created_at: string
}

export interface Review {
  id: string
  restroom_id: string
  user_id: string | null
  comment: string
  created_at: string
}

export interface UserPreferences {
  urgency: 1 | 2 | 3 | 4
  needs_accessible: boolean
  access_tolerance: 'any' | 'free_or_purchase' | 'free_only'
}

export interface UserProfile {
  id: string
  email: string | null
  preferences: UserPreferences
}
