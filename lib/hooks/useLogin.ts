import { useMutation, useQueryClient } from "@tanstack/react-query"
import { loginService } from "@/lib/services/authService"
import { LoginPayload } from "@/lib/api/auth"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginService(payload),
    onSuccess: async (user) => {
      localStorage.setItem("isLoggedIn", "true")
      queryClient.setQueryData(["me"], user)
    },
  })
}
