import { Hono } from "hono";
import { v7 } from "uuid";
import { saveRefund } from "./mockDb";

const app = new Hono();

type RefundInput = {
  originalOrderId: string;
  requestedRefundAmount: number;
  refundReason: string;
  refundType: "store_credit";
};

type RefundOutput = {
  refundId: string;
  refundAmount: number;
};

app.post("/refund", async (c) => {
  // Input validation
  const input = await c.req.json();
  const parsed: RefundInput = input;

  // Destructuring
  const { originalOrderId, requestedRefundAmount } = parsed;

  // Business logic
  const refundId = v7();

  const refund = await saveRefund({
    refundId,
    refundAmount: requestedRefundAmount,
  });

  // Output
  return c.json(refund);
});

export default app;
