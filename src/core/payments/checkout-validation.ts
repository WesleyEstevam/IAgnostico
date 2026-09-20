import { z } from "zod";

const digits = (min: number, max: number) => z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(min).max(max));
export const checkoutRequestSchema = z.object({
  planId: z.string().regex(/^[a-z0-9-]{2,40}$/), cycle: z.enum(["monthly", "annual"]), method: z.enum(["credit_card", "pix_automatic"]), couponCode: z.string().trim().max(30),
  identity: z.object({ name: z.string().trim().min(3).max(100), email: z.string().trim().email().max(160), cpfCnpj: digits(11, 14), mobilePhone: digits(10, 11), postalCode: digits(8, 8), addressNumber: z.string().trim().min(1).max(20), addressComplement: z.string().trim().max(100) }),
  card: z.object({ holderName: z.string().trim().min(3).max(100), number: digits(13, 19), expiryMonth: digits(2, 2).refine((value) => Number(value) >= 1 && Number(value) <= 12), expiryYear: digits(4, 4).refine((value) => Number(value) >= new Date().getFullYear()), ccv: digits(3, 4) }).optional(),
}).refine((data) => data.method !== "credit_card" || Boolean(data.card), { message: "Informe os dados do cartão." });
