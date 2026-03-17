import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutService } from "@/lib/services/authService"

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
