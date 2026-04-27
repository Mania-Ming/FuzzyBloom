import { createClient } from "@supabase/supabase-js"

// Server-side only — bypasses RLS using service role key
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
