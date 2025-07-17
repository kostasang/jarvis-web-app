// Backend API response format
export interface AreaApiResponse {
  area_id: string
  area_name: string
  hub_id: string
  device_count?: number
  created_at?: string
  updated_at?: string
}

// Frontend interface (normalized)
export interface AreaData {
  id: string
  name: string
  hubId: string
  deviceCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAreaRequest {
  hub_id: string
  area_name: string
}

export interface DeleteAreaRequest {
  hub_id: string
  area_id: string
}

export interface RenameAreaRequest {
  hub_id: string
  area_id: string
  new_area_name: string
} 