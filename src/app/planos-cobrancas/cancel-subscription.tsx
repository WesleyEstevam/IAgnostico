"use client";

import { useRef, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { readApiResponse } from "@/presentation/http/read-api-response";
import { refreshAuthSession } from "@/presentation/auth/auth-store";

type CancellationMode = "period_end" | "refund";

export function CancelSubscription() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CancellationMode>("period_end");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const router = useRouter();

  async function cancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (reason.trim().length < 10) { setError("Informe o motivo com pelo menos 10 caracteres."); return; }
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, reason: reason.trim() }),
      });
      const payload = await readApiResponse<{ message: string; error: string }>(response);
      if (!response.ok || !payload.message) throw new Error(payload.error || "Não foi possível cancelar a assinatura.");
      setMessage(payload.message);
      setOpen(false);
      await refreshAuthSession();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível cancelar. Verifique sua conexão e tente novamente.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <div>
    {message && <p role="status" className="text-sm font-extrabold text-primary">{message}</p>}
    <Dialog.Root open={open} onOpenChange={(value) => { if (submitting.current) return; setOpen(value); if (value) { setError(""); setReason(""); setMode("period_end"); } }}>
      {!message && <Dialog.Trigger asChild><button type="button" className="text-sm font-extrabold text-destructive hover:underline">Cancelar assinatura</button></Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/45 backdrop-blur-sm" />
        <Dialog.Content className="card-pop fixed left-1/2 top-1/2 z-[101] max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 sm:p-8">
          <Dialog.Close asChild><button type="button" disabled={pending} aria-label="Fechar" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted disabled:opacity-60"><X className="h-4 w-4" /></button></Dialog.Close>
          <Dialog.Title className="pr-10 text-2xl font-black">Cancelar assinatura</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm font-bold text-muted-foreground">Conte o motivo, escolha como deseja encerrar o plano e confirme o cancelamento.</Dialog.Description>
          <form onSubmit={cancel} className="mt-5 space-y-5">
            <div>
              <label htmlFor="cancellation-reason" className="block text-sm font-extrabold">Motivo do cancelamento</label>
              <textarea id="cancellation-reason" value={reason} onChange={(event) => setReason(event.target.value)} required minLength={10} maxLength={1000} rows={3} disabled={pending} aria-describedby="cancellation-reason-help" placeholder="O que levou você a cancelar sua assinatura?" className="mt-2 w-full rounded-xl border-2 border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
              <p id="cancellation-reason-help" className="mt-1 text-xs font-bold text-muted-foreground">Entre 10 e 1000 caracteres.</p>
            </div>
            <fieldset disabled={pending} className="space-y-3">
              <legend className="mb-2 text-sm font-extrabold">Quando deseja encerrar?</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border p-4 has-checked:border-primary has-checked:bg-primary/5"><input type="radio" name="mode" value="period_end" checked={mode === "period_end"} onChange={() => setMode("period_end")} className="mt-1" /><span><strong className="block">No fim do período pago</strong><span className="mt-1 block text-xs font-bold text-muted-foreground">Interrompe as próximas cobranças e mantém seu acesso até o fim do período atual.</span></span></label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border p-4 has-checked:border-destructive has-checked:bg-destructive/5"><input type="radio" name="mode" value="refund" checked={mode === "refund"} onChange={() => setMode("refund")} className="mt-1" /><span><strong className="block">Agora, com pedido de reembolso</strong><span className="mt-1 block text-xs font-bold text-muted-foreground">Encerra o acesso imediatamente. Disponível até 7 dias corridos após o pagamento.</span></span></label>
            </fieldset>
            {error && <p role="alert" className="text-sm font-extrabold text-destructive">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Dialog.Close asChild><button type="button" disabled={pending} className="btn-pop flex-1 bg-muted text-foreground shadow-[var(--shadow-pop-muted)] disabled:opacity-60">Manter assinatura</button></Dialog.Close>
              <button type="submit" disabled={pending || reason.trim().length < 10} className="btn-pop flex-1 gap-2 bg-destructive text-white disabled:opacity-60">{pending && <LoaderCircle className="h-4 w-4 animate-spin" />}{pending ? "Cancelando..." : "Confirmar cancelamento"}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}
