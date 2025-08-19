import z from "zod";

export const UuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

export const ThreateningToSueSchema = z
  .string()
  .max(255)
  .refine((value) => /(lawsuit|sue|lawyer)/gi.test(value), {
    message: "Does not constitute a valid refund reason, refund denied",
  });

export const AmountSchema = z.object({
  currency: z.enum(["USD"]),
  precision: z.enum(["base", "centis", "millis", "micros"]),
  value: z
    .number()
    .min(0)
    .transform((value) => BigInt(value)),
});

export const LegacyAmountSchema = z.number().min(0);

export const CompatibleAmountSchema = z.union([
  AmountSchema,
  LegacyAmountSchema.transform(
    (value): z.infer<typeof AmountSchema> => ({
      currency: "USD",
      precision: "centis",
      value: BigInt(value * 100),
    })
  ),
]);

export const AmountOutputSchema = AmountSchema.extend({
  value: z.bigint().transform((value) => Number(value)),
});

type MaskData = {
  type: "mask";
  transform: (value: z.$output) => string;
};

export const RedactedRegistry = z.registry<MaskData>();

export const BankAccountSchema = z.object({
  accountNumber: z.number(),
  routingNumber: z.number(),
  nameOnAccount: z.string(),
});

RedactedRegistry.add(BankAccountSchema, {
  type: "mask",
  transform: (value) => {
    return "Bank account ending in " + value.accountNumber.toString().slice(-4);
  },
});
