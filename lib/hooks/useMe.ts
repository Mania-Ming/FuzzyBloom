import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { getMeService } from "@/lib/services/authService"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      // fast session check first
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.setItem("isLoggedIn", "false")
        throw new Error("No session")
      }
      const user = await getMeService()
      localStorage.setItem("isLoggedIn", "true")
      return user
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
