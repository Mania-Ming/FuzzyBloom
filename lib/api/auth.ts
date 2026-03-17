import api from "@/lib/api/axiosInstance"

// TYPES
export type RegisterPayload = { full_name: string; email: string; password: string }
export type RegisterResponse = { id: number; full_name: string; email: string }

export type LoginPayload = { email: string; password: string }
export type LoginResponse = { detail: string }

export type MeResponse = { id: number; full_name: string; email: string; profile_image?: string }

// REGISTER
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register/", payload)
  return res.data
}

// LOGIN
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login/", payload)
  return res.data
}

// LOGOUT
export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout/")
}

// REFRESH
export async function refreshToken(): Promise<void> {
  await api.post("/auth/refresh/")
}

// ME
export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me/")
  return res.data
}
