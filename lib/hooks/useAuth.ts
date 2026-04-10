import { useMe } from "@/lib/hooks/useMe"

export function useAuth() {
  const { data: user, isLoading } = useMe()
  return { user, isLoggedIn: !!user, isLoading }
}
