import axios from 'axios'
import { LoginCredentials, SignupCredentials, ForgotPasswordRequest, ResetPasswordRequest, Token } from '@/types/auth'
import { HubData, HubApiResponse, ClaimHubRequest, SetHubNicknameRequest } from '@/types/hub'
import { AreaData, AreaApiResponse, CreateAreaRequest, DeleteAreaRequest, RenameAreaRequest } from '@/types/area'
import { DeviceData, DeviceLatestDataApiResponse, DeviceHistoryResponse } from '@/types/device'
import { UserData, User } from '@/types/user'
import { config } from '@/config/env'

// Configure the base URL
const API_BASE_URL = config.apiUrl

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jarvis_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jarvis_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await apiClient.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  signup: async (credentials: SignupCredentials, captchaToken: string): Promise<{ message: string }> => {
    const params = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
      email: credentials.email,
      captcha: captchaToken,
    })
    
    const response = await apiClient.post(`/create_user?${params.toString()}`)
    return response.data
  },

  forgotPassword: async (request: ForgotPasswordRequest): Promise<{ message: string }> => {
    const params = new URLSearchParams({
      email: request.email,
    })
    
    const response = await apiClient.post(`/declare_lost_password?${params.toString()}`)
    // The endpoint returns 204 with no content, so we create our own success message
    return { message: 'Password reset request submitted successfully' }
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<{ message: string }> => {
    const params = new URLSearchParams({
      verification_token: request.verification_token,
      new_password: request.new_password,
    })
    
    const response = await apiClient.put(`/reset_password?${params.toString()}`)
    return response.data || { message: 'Password reset successfully' }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout')
    localStorage.removeItem('jarvis_token')
  },
}

export const hubApi = {
  getHubs: async (): Promise<HubData[]> => {
    const response = await apiClient.get('/get_hubs')
    const hubsApiResponse: HubApiResponse[] = response.data
    
    // Transform API response to frontend format
    return hubsApiResponse.map(hub => ({
      id: hub.hub_id,
      nickname: hub.hub_nickname || undefined,
      status: hub.status || 'unknown',
      location: hub.location,
      last_seen: hub.last_seen,
      device_count: hub.device_count || 0
    }))
  },

  claimHub: async (request: ClaimHubRequest): Promise<void> => {
    await apiClient.post('/claim_hub', null, {
      params: {
        hub_id: request.hub_id,
        verification_code: request.verification_code,
      },
    })
  },

  setHubNickname: async (request: SetHubNicknameRequest): Promise<void> => {
    await apiClient.post('/set_hub_nickname', null, {
      params: {
        hub_id: request.hub_id,
        hub_nickname: request.hub_nickname,
      },
    })
  },
}

export const areaApi = {
  getAreas: async (hubId?: string): Promise<AreaData[]> => {
    const response = await apiClient.get('/get_areas', {
      params: hubId ? { hub_id: hubId } : {},
    })
    const areasApiResponse: AreaApiResponse[] = response.data
    
    // Transform API response to frontend format
    return areasApiResponse.map(area => ({
      id: area.area_id,
      name: area.area_name,
      hubId: area.hub_id,
      deviceCount: area.device_count || 0,
      createdAt: area.created_at,
      updatedAt: area.updated_at,
    }))
  },

  createArea: async (request: CreateAreaRequest): Promise<AreaData> => {
    const response = await apiClient.post('/create_area', null, {
      params: {
        hub_id: request.hub_id,
        area_name: request.area_name,
      },
    })
    const areaApiResponse: AreaApiResponse = response.data
    
    // Transform API response to frontend format
    return {
      id: areaApiResponse.area_id,
      name: areaApiResponse.area_name,
      hubId: areaApiResponse.hub_id,
      deviceCount: areaApiResponse.device_count || 0,
      createdAt: areaApiResponse.created_at,
      updatedAt: areaApiResponse.updated_at,
    }
  },

  deleteArea: async (request: DeleteAreaRequest): Promise<void> => {
    await apiClient.delete('/delete_area', {
      params: {
        hub_id: request.hub_id,
        area_id: request.area_id,
      },
    })
  },

  renameArea: async (request: RenameAreaRequest): Promise<void> => {
    await apiClient.put('/rename_area', null, {
      params: {
        hub_id: request.hub_id,
        area_id: request.area_id,
        new_area_name: request.new_area_name,
      },
    })
  },
}

export const deviceApi = {
  getDevicesLatestData: async (): Promise<DeviceData[]> => {
    const response = await apiClient.get('/get_devices_latest_data')
    const devicesApiResponse: DeviceLatestDataApiResponse[] = response.data
    
    // Transform API response to frontend format
    return devicesApiResponse.map(device => ({
      id: device.device_id,
      name: device.device_nickname,
      type: device.device_type,
      areaId: device.area_id || undefined,
      hubId: device.hub_id,
      latestValue: device.device_data ?? device.device_state ?? undefined,
      latestTimestamp: device.time || undefined,
    }))
  },

  setDeviceNickname: async (deviceId: string, deviceNickname: string): Promise<void> => {
    await apiClient.post('/set_device_nickname', null, {
      params: {
        device_id: deviceId,
        device_nickname: deviceNickname,
      },
    })
  },

  assignDeviceToArea: async (deviceId: string, areaId: string): Promise<void> => {
    await apiClient.post('/assign_device_to_area', null, {
      params: {
        device_id: deviceId,
        area_id: areaId,
      },
    })
  },

  removeDeviceFromArea: async (deviceId: string): Promise<void> => {
    await apiClient.delete('/remove_device_from_area', {
      params: {
        device_id: deviceId,
      },
    })
  },

  getDeviceHistory: async (deviceId: string, timeWindow: number = 24): Promise<DeviceHistoryResponse> => {
    const response = await apiClient.get('/get_device_history', {
      params: {
        device_id: deviceId,
        time_window: timeWindow,
      },
    })
    return response.data
  },

  commandDevice: async (deviceId: string, deviceData: number): Promise<void> => {
    await apiClient.post('/command_device', null, {
      params: {
        device_id: deviceId,
        device_data: deviceData,
        device_state: false, // Set to 0 (false) as requested
      },
    })
  },
}

export const userApi = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/me')
    const userData: UserData = response.data
    
    // Transform API response to frontend format
    return {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      dateRegistered: new Date(userData.date_registered),
    }
  },

  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete('/delete_user', {
      params: {
        password: password
      }
    })
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/update_password', null, {
      params: {
        current_password: currentPassword,
        new_password: newPassword
      }
    })
  },

  updateEmail: async (newEmail: string, password: string, captcha: string): Promise<void> => {
    await apiClient.put('/update_email', null, {
      params: {
        new_email: newEmail,
        password: password,
        captcha: captcha
      }
    })
  },
}

export default apiClient 