import { useMutation, useQueryClient } from "@tanstack/react-query"
import { loginService } from "@/lib/services/authService"
import { LoginPayload } from "@/lib/api/auth"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginService(payload),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["me"] })
    },
  })
}
