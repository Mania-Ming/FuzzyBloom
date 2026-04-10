import { useMutation } from "@tanstack/react-query"
import { insertOrder } from "@/lib/api/auth"

export function useInsertOrder() {
  return useMutation({
    mutationFn: insertOrder,
  })
}
