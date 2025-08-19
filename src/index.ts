import { Hono } from "hono";
import { v7 } from "uuid";
import { saveRefund } from "./mockDb";
import { z } from "zod";

const app = new Hono();

const UuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

const ThreateningToSueSchema = z
  .string()
  .max(255)
  .refine((value) => /(lawsuit|sue|lawyer)/gi.test(value), {
    message: "Does not constitute a valid refund reason, refund denied",
  });

const RefundInputSchema = z.object({
  originalOrderId: UuidSchema.optional(),
  requestedRefundAmount: z.number().min(0),
  refundReason: ThreateningToSueSchema,
  refundType: z.literal("store_credit"),
});

const RefundOutputSchema = z.object({
  refundId: z.string(),
  refundAmount: z.number(),
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

const processRefund = async (
  input: z.infer<typeof RefundInputSchema>
): Promise<z.infer<typeof RefundOutputSchema>> => {
  const { requestedRefundAmount } = input;
  const refundId = v7();
  const refund = await saveRefund({
    refundId,
    refundAmount: requestedRefundAmount,
  });
  return refund;
};

export default app;
