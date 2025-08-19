import { Hono } from "hono";
import { v7 } from "uuid";
import { saveRefund } from "./mockDb";
import { z } from "zod";

const app = new Hono();

const RefundInputSchema = z.object({
  originalOrderId: z.string(),
  requestedRefundAmount: z.number(),
  refundReason: z.string(),
  refundType: z.enum(["store_credit"]),
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

  // Destructuring
  const { originalOrderId, requestedRefundAmount } = parsedInput;

  // Business logic
  const refundId = v7();

  const refund = await saveRefund({
    refundId,
    refundAmount: requestedRefundAmount,
  });

  // Output
  const output = RefundOutputSchema.parse(refund);
  return c.json(output);
});

export default app;
