export interface LoginCredentials {
  username: string
  password: string
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