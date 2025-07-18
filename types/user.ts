// User types for the /me endpoint response

export interface UserData {
  user_id: string
  username: string
  email: string
  date_registered: string
}

// Frontend-friendly user interface
export interface User {
  id: string
  username: string
  email: string
  dateRegistered: Date
}

// Request types for user-related operations (future use)
export interface UpdateUserRequest {
  username?: string
  email?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
} 