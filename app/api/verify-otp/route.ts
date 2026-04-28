import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { email, code } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 })
    }

    // 1. Find matching unused, unexpired code
    const { data, error } = await supabaseAdmin
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 })
    }

    // 2. Mark code as used
    await supabaseAdmin
      .from("verification_codes")
      .update({ used: true })
      .eq("id", data.id)

    // 3. Fetch the auth user to get full_name from metadata
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(data.user_id)
    const fullName = authUser?.user?.user_metadata?.full_name ?? ""
    const userEmail = authUser?.user?.email ?? email

    // 4. UPSERT profile — guarantees the row exists even if the DB trigger failed.
    //    ON CONFLICT (id) → update is_verified and fill any missing fields.
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id:          data.user_id,
          email:       userEmail,
          full_name:   fullName,
          role:        "customer",
          is_verified: true,
        },
        { onConflict: "id" }   // if row exists, update it; if not, insert it
      )

    if (upsertError) {
      console.error("[verify-otp] profile upsert error:", upsertError.message)
      // Don't fail the whole request — verification still succeeded
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[verify-otp] unexpected error:", err.message)
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 })
  }
}
