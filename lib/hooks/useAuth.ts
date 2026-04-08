import { useMe } from "@/lib/hooks/useMe"

export function useAuth() {
  const { data: user, isLoading, isError } = useMe()
  return { user, isLoggedIn: !!user && !isError, isLoading, isError }
}
