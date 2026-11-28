import { useMutation } from "@tanstack/react-query";
import { orderService } from "@/entities/order/services/order.service";

export const useCreateOnlinePayment = () =>
  useMutation({
    mutationFn: (orderId: string) => orderService.createOnlinePayment(orderId),
  });
