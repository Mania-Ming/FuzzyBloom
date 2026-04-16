import { supabase } from "@/lib/supabase"

export async function getUserRole(userId?: string): Promise<string | null> {
  let uid = userId

  if (!uid) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    uid = user.id
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", uid)
    .single()

  if (profileError) return null
  return profile?.role ?? null
}
