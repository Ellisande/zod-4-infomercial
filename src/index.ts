import { Hono } from "hono";
import { v7 } from "uuid";
import { z } from "zod";
import { saveRefund } from "./mockDb";
import {
  AmountOutputSchema,
  CompatibleAmountSchema,
  ThreateningToSueSchema,
  UuidSchema,
} from "./schemas";

const app = new Hono();

const RefundInputSchema = z.object({
  originalOrderId: UuidSchema.optional(),
  requestedRefundAmount: CompatibleAmountSchema,
  refundReason: ThreateningToSueSchema,
  refundType: z.literal("store_credit"),
});

const RefundOutputSchema = z.object({
  refundId: z.string(),
  refundAmount: AmountOutputSchema,
});

app.post("/refund", async (c) => {
  // Input validation
  const input = await c.req.json();
  const inputResult = RefundInputSchema.safeParse(input);
  if (!inputResult.success) {
    return c.json(inputResult.error.issues, 400);
  }
  const parsedInput = inputResult.data;

  // Business logic
  const refund = await processRefund(parsedInput);

  // Output
  const output = RefundOutputSchema.parse(refund);
  return c.json(output);
});

const processRefund = async (input: z.infer<typeof RefundInputSchema>) => {
  const { requestedRefundAmount } = input;
  const refundId = v7();
  const refund = await saveRefund({
    refundId,
    refundAmount: requestedRefundAmount,
  });
  return refund;
};

export default app;
