import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/lib/api/auth"

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
    staleTime: 1000 * 60 * 5,
  })
}
