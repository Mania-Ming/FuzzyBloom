import { useQuery } from "@tanstack/react-query"
import { getMeService } from "@/lib/services/authService"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMeService,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}
