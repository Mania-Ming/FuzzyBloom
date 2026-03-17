import { registerUser, loginUser, logoutUser, refreshToken, getMe, RegisterPayload, LoginPayload } from "@/lib/api/auth"

export async function registerService(payload: RegisterPayload) {
  return registerUser(payload)
}

export async function loginService(payload: LoginPayload) {
  return loginUser(payload)
}

export async function logoutService() {
  return logoutUser()
}

export async function refreshService() {
  return refreshToken()
}

export async function getMeService() {
  return getMe()
}
