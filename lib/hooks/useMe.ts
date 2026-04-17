import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        localStorage.setItem("isLoggedIn", "false")
        throw new Error("No session")
      }
      const user = session.user
      localStorage.setItem("isLoggedIn", "true")

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, address, contact_number")
        .eq("id", user.id)
        .single()

      if (error) console.error("Profile fetch error:", error.message)

      return {
        id: user.id,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
        address: profile?.address ?? "",
        contact_number: profile?.contact_number ?? "",
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
