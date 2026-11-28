import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/api";
import { customerService } from "@/entities/customer/services/customer.service";

export const useCustomerOrders = () =>
  useQuery({
    queryKey: QUERY_KEYS.customerOrders,
    queryFn: customerService.getOrders,
  });
