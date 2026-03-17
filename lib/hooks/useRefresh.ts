import { useMutation } from "@tanstack/react-query"
import { refreshService } from "@/lib/services/authService"

export function useRefresh() {
  return useMutation({
    mutationFn: refreshService,
  })
}
