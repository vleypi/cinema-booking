import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

export const useRequestOtp = () =>
  useMutation({
    mutationFn: (email: string) => customerService.requestOtp(email),
  });

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => customerService.verifyOtp(email, code),
    onSuccess: (profile) => {
      queryClient.setQueryData(QUERY_KEYS.customerMe, profile);
    },
  });
};
