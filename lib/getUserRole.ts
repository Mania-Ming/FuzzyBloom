import { supabase } from "@/lib/supabase"

export async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  return data?.role ?? null
}
