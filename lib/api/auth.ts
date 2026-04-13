import { supabase } from "@/lib/supabase"

// TYPES
export type RegisterPayload = { full_name: string; email: string; password: string }
export type LoginPayload = { email: string; password: string }
export type MeResponse = { id: string; full_name: string; email: string; profile_image?: string }

// REGISTER
export async function registerUser(payload: RegisterPayload): Promise<MeResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { full_name: payload.full_name } },
  })
  if (error) throw error
  // insert into profiles table
  const userId = data.user?.id
  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      full_name: payload.full_name,
      email: payload.email,
    })
  }
  return { id: userId!, full_name: payload.full_name, email: payload.email }
}

// LOGIN
export async function loginUser(payload: LoginPayload): Promise<MeResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })
  if (error) throw error
  const user = data.user
  return {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? "",
    email: user.email ?? "",
  }
}

// LOGOUT
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// GET CURRENT USER (ME)
export async function getMe(): Promise<MeResponse> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Not authenticated")

  // fetch profile from profiles table for extra fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profile_image")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    email: user.email ?? "",
    profile_image: profile?.profile_image ?? undefined,
  }
}

// PRODUCTS
export async function getProducts(category?: string) {
  let query = supabase.from("products").select("*, product_variants(*)")
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) throw error
  return data
}

// INSERT ORDER
export async function insertOrder(order: {
  user_id: string
  items: any[]
  subtotal: number
  shipping: number
  total: number
  total_amount: number
  full_name: string
  payment: string
  status: string
}) {
  const { data, error } = await supabase.from("orders").insert([order]).select().single()
  if (error) throw error
  return data
}

// INSERT ORDER ITEMS
export async function insertOrderItems(items: {
  order_id: string
  product_id: string
  quantity: number
  price: number
}[]) {
  const { data, error } = await supabase.from("order_items").insert(items)
  if (error) throw error
  return data
}