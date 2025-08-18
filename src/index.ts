import { Hono } from "hono";

const app = new Hono();

type RefundInput = {
  originalOrderId: string;
  refundAmount: number;
  refundReason: string;
  refundType: "store_credit";
};

type RefundOutput = {
  refundId: string;
  refundAmount: number;
};

app.post("/refund", async (c) => {
  return c.json({ ok: "true" });
});

export default app;
