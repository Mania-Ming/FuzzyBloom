import { supabase } from "@/lib/supabase"

// TYPES
export type RegisterPayload = { full_name: string; email: string; password: string }
export type LoginPayload = { email: string; password: string }
export type MeResponse = { id: string; full_name: string; email: string; address?: string; contact_number?: string }

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, address, contact_number")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
    email: user.email ?? "",
    address: profile?.address ?? "",
    contact_number: profile?.contact_number ?? "",
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

// INSERT ORDER — only core fields go into orders table
export async function insertOrder(order: {
  user_id: string
  items: any[]
  subtotal: number
  shipping: number
  total: number
  total_amount: number
  payment: string
  status: string
  receipt_url?: string | null
}) {
  const { data, error } = await supabase.from("orders").insert([order]).select().single()
  if (error) throw error
  return data
}

// INSERT DELIVERY DETAILS — separate table linked by order_id
export async function insertDeliveryDetails(details: {
  order_id: string
  delivery_type: string
  full_name: string
  phone: string
  address: string
  delivery_date: string
  delivery_time: string
}) {
  const { error } = await supabase.from("delivery_details").insert([details])
  if (error) throw error
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