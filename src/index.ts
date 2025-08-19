import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { v7 } from "uuid";
import { z } from "zod";
import { saveRefund } from "./mockDb";
import {
  AmountOutputSchema,
  BankAccountSchema,
  CompatibleAmountSchema,
  RedactedRegistry,
  ThreateningToSueSchema,
  UuidSchema,
} from "./schemas";
import { mapValues } from "./utils";

const app = new Hono();

const BaseRefundInputSchema = z.object({
  originalOrderId: UuidSchema.optional(),
  requestedRefundAmount: CompatibleAmountSchema,
  refundReason: ThreateningToSueSchema,
});

const StoreCreditRefundInputSchema = BaseRefundInputSchema.extend({
  refundType: z.literal("store_credit"),
});

const PayoutRefundInputSchema = BaseRefundInputSchema.extend({
  refundType: z.literal("bank_transfer"),
  bankAccount: BankAccountSchema,
});

const RefundInputSchema = z.union([
  StoreCreditRefundInputSchema,
  PayoutRefundInputSchema,
]);

const RefundOutputSchema = z.object({
  refundId: z.string(),
  refundAmount: AmountOutputSchema,
  paidTo: BankAccountSchema.optional(),
});

const redactMiddleware = <T extends z.ZodObject>(schema: T) => {
  const properties = schema.shape;
  const transformer = mapValues(properties, (value) => {
    const unwrappedSchema = value.unwrap ? value.unwrap() : value;
    const maybeRedacted = RedactedRegistry.get(unwrappedSchema);
    if (maybeRedacted?.type === "mask") {
      return maybeRedacted.transform;
    }
    return (i: any) => i;
  });
  return createMiddleware(async (c, next) => {
    await next();
    const response = await c.res.json();
    if (c.res.status !== 200) {
      return;
    }
    const newResponse = mapValues(response, (value, key) => {
      const transform = transformer[key];
      return transform ? transform(value) : value;
    });
    c.res = c.json(newResponse);
  });
};

app.post("/refund", redactMiddleware(RefundOutputSchema), async (c) => {
  // Input validation
  const input = await c.req.json();
  const inputResult = RefundInputSchema.safeParse(input);
  if (!inputResult.success) {
    return c.json(inputResult.error.issues, 400);
  }
  const parsedInput = inputResult.data;

  // Destructuring
  const { originalOrderId, requestedRefundAmount, refundReason } = parsedInput;

  // Business logic
  const refundId = v7();

  const refund = await saveRefund({
    refundId,
    refundAmount: requestedRefundAmount,
  });

  // Output
  const output = RefundOutputSchema.parse(refund);
  let paidTo: z.infer<typeof BankAccountSchema> | undefined;
  if (parsedInput.refundType === "bank_transfer") {
    paidTo = parsedInput.bankAccount;
  }
  return c.json({
    ...output,
    paidTo,
  });
});

export default app;
