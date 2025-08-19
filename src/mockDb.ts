import z from "zod";
import { AmountSchema } from "./schemas";

export const getOrder = async (orderId: string) => {
  return {
    id: orderId,
    amount: {
      unitType: "currency_micros",
      unitToken: "USD",
      value: 1000000,
    },
    owner: {
      type: "customer",
      id: "63ebb5c4-b06d-47f5-9856-5d3787199163",
    },
  };
};

export const saveRefund = async ({
  refundId,
  refundAmount,
}: {
  refundId: string;
  refundAmount: z.infer<typeof AmountSchema>;
}) => {
  return {
    refundId,
    refundAmount,
  };
};
