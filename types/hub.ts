// Backend API response format
export interface HubApiResponse {
  hub_id: string
  hub_nickname?: string | null
  status?: 'online' | 'offline' | 'unknown'
  location?: string
  last_seen?: string
  device_count?: number
}

// Frontend interface (normalized)
export interface HubData {
  id: string
  nickname?: string
  status?: 'online' | 'offline' | 'unknown'
  location?: string
  last_seen?: string
  device_count?: number
}

export interface ClaimHubRequest {
  hub_id: string
  verification_code: string
}

export interface SetHubNicknameRequest {
  hub_id: string
  hub_nickname: string
} 