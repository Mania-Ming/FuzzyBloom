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

      // fetch profile for full_name and profile_image
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, profile_image, address, contact_number")
        .eq("id", user.id)
        .single()

     return {
        id: user.id,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
        profile_image: profile?.profile_image ?? undefined,
        address: profile?.address ?? "",
        contact_number: profile?.contact_number ?? "",
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
