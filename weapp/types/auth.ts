export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  openid: string
  login_source: string
}

export interface AuthResponse {
  user: User
  token: string
  expires_in: number
}
