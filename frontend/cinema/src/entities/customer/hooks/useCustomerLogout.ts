import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

export const useCustomerLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.customerMe });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.customerOrders });
    },
  });
};
