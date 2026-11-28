import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

export const useCustomerMe = () =>
  useQuery({
    queryKey: QUERY_KEYS.customerMe,
    queryFn: customerService.getMe,
    retry: false,
  });
