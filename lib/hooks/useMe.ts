import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        localStorage.setItem("isLoggedIn", "false")
        throw new Error("Not authenticated")
      }

      localStorage.setItem("isLoggedIn", "true")

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, address, contact_number")
        .eq("id", user.id)
        .single()

      return {
        id: user.id,
        email: user.email ?? "",
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        address: profile?.address ?? "",
        contact_number: profile?.contact_number ?? "",
      }
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}
