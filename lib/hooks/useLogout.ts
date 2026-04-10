import { useMutation, useQueryClient } from "@tanstack/react-query"
import { logoutService } from "@/lib/services/authService"

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logoutService,
    onSettled: () => {
      localStorage.setItem("isLoggedIn", "false")
      queryClient.setQueryData(["me"], null)
      queryClient.removeQueries({ queryKey: ["me"] })
    },
  })
}
