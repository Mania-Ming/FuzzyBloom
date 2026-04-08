import { useQuery } from "@tanstack/react-query"
import { getMeService } from "@/lib/services/authService"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const user = await getMeService()
        localStorage.setItem("isLoggedIn", "true")
        return user
      } catch (err) {
        localStorage.setItem("isLoggedIn", "false")
        throw err
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
