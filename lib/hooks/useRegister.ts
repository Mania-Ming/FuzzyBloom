import { useMutation } from "@tanstack/react-query"
import { registerService } from "@/lib/services/authService"
import { RegisterPayload } from "@/lib/api/auth"

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerService(payload),
  })
}
