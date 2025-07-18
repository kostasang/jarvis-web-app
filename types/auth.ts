export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupCredentials {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  verification_token: string
  new_password: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface AuthError {
  detail: string
}

export interface User {
  id: string
  username: string
  email?: string
} 