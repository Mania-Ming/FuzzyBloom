import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export function useRefresh() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data
    },
  })
}
