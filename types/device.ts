// Backend API response format
export interface DeviceLatestDataApiResponse {
  device_id: string
  device_nickname: string
  device_type: number
  area_id?: string | null
  hub_id: string
  device_data?: number | null
  device_state?: number | null
  time?: string | null
}

// Frontend interface (normalized)
export interface DeviceData {
  id: string
  name: string
  type: number
  areaId?: string
  hubId: string
  latestValue?: number
  latestTimestamp?: string
}

export interface DeviceFilter {
  category?: 'environmental' | 'security' | 'control'
  areaId?: string | null
  searchTerm?: string
}

export interface DeviceStats {
  total: number
  byCategory: {
    environmental: number
    security: number
    control: number
  }
  byArea: Record<string, number>
  lastUpdate?: string
} 