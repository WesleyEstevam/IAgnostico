import { z } from "zod";

export const cancellationRequestSchema = z.object({
  mode: z.enum(["period_end", "refund"]),
  reason: z.string().trim().min(10, "Informe o motivo com pelo menos 10 caracteres.").max(1000, "O motivo deve ter até 1000 caracteres."),
});
