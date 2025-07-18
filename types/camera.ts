// Backend API response format
export interface CameraApiResponse {
  camera_id: string
  camera_nickname: string
}

// Frontend data format
export interface CameraData {
  id: string
  nickname: string
}

// API request types
export interface ClaimCameraRequest {
  camera_id: string
  verification_code: string
  nickname: string
}

export interface SetCameraNicknameRequest {
  camera_id: string
  nickname: string
}

export interface UnclaimCameraRequest {
  camera_id: string
} 