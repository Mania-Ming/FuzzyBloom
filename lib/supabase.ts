import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jszumhyyffcqqduaoojq.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzenVtaHl5ZmZjcXFkdWFvb2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjU4NTMsImV4cCI6MjA5MTM0MTg1M30.ht8jFJnB5X29-AU7-REEaeB_OBwNKAuonCK2MXgrLuo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
