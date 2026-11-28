import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import type { IUpdateCustomerProfilePayload } from "@/entities/customer/interfaces/customer.interface";
import { customerService } from "@/entities/customer/services/customer.service";

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUpdateCustomerProfilePayload) => customerService.updateMe(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(QUERY_KEYS.customerMe, profile);
    },
  });
};
