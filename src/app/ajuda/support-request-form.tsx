"use client";

import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, FileUp, LoaderCircle, Send } from "lucide-react";
import type { SupportSubject } from "@/core/admin/support-settings-service";
import { submitPublicSupportAction, type PublicSupportState } from "./actions";

const field =
  "mt-1.5 h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm font-bold outline-none transition focus:border-primary";
export function SupportRequestForm({
  authenticated,
  subjects,
  siteKey,
}: {
  authenticated: boolean;
  subjects: SupportSubject[];
  siteKey: string;
}) {
  const [state, action, pending] = useActionState(
    submitPublicSupportAction,
    {} as PublicSupportState,
  );
  const [count, setCount] = useState(0);
  const [attachment, setAttachment] = useState("");
  useEffect(() => {
    if (state.error)
      (window as typeof window & { turnstile?: { reset: () => void } }).turnstile?.reset();
  }, [state.error]);
  if (state.protocol)
    return (
      <section className="card-pop mx-auto max-w-xl p-7 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h2 className="mt-4 text-2xl font-black">Solicitação aberta!</h2>
        <p className="mt-2 font-bold text-muted-foreground">Guarde o número do seu protocolo:</p>
        <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-4 text-xl font-black tracking-wide text-primary">
          {state.protocol}
        </p>
        <a
          href="/ajuda"
          className="btn-pop mt-6 bg-muted px-5 text-xs shadow-[var(--shadow-pop-muted)]"
        >
          Abrir outra solicitação
        </a>
      </section>
    );
  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="card-pop mx-auto max-w-2xl space-y-6 p-5 sm:p-8"
    >
      {!authenticated && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 text-lg font-extrabold">Seus dados</legend>
          <label className="text-sm font-extrabold">
            Nome
            <input
              name="firstName"
              required
              minLength={2}
              maxLength={60}
              autoComplete="given-name"
              className={field}
            />
          </label>
          <label className="text-sm font-extrabold">
            Sobrenome
            <input
              name="lastName"
              required
              minLength={2}
              maxLength={80}
              autoComplete="family-name"
              className={field}
            />
          </label>
          <label className="text-sm font-extrabold">
            E-mail
            <input
              name="email"
              type="email"
              required
              maxLength={160}
              autoComplete="email"
              className={field}
            />
          </label>
          <label className="text-sm font-extrabold">
            Celular
            <input
              name="phone"
              type="tel"
              required
              maxLength={20}
              placeholder="(71) 99999-9999"
              autoComplete="tel"
              className={field}
            />
          </label>
        </fieldset>
      )}
      {authenticated && (
        <div className="rounded-2xl bg-primary/10 p-4 text-sm font-bold text-primary">
          Seus dados cadastrados serão enviados automaticamente com a solicitação.
        </div>
      )}
      <label className="block text-sm font-extrabold">
        Assunto
        <select name="subjectId" required defaultValue="" className={field}>
          <option value="" disabled>
            Selecione o assunto
          </option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-extrabold">
        Como podemos ajudar?
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={1000}
          rows={8}
          onChange={(event) => setCount(event.target.value.length)}
          placeholder="Descreva sua solicitação com o máximo de detalhes possível..."
          className={`${field} h-auto resize-y py-3`}
        />
        <span
          className={`mt-1 block text-right text-xs ${count > 950 ? "font-extrabold text-streak" : "font-bold text-muted-foreground"}`}
        >
          {count}/1000
        </span>
      </label>
      <div>
        <label className="btn-pop cursor-pointer gap-2 bg-muted px-5 py-3 text-xs shadow-[var(--shadow-pop-muted)]">
          <FileUp className="h-4 w-4" />
          Adicionar foto ou PDF
          <input
            type="file"
            name="attachment"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            className="sr-only"
            onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? "")}
          />
        </label>
        {attachment && (
          <p className="mt-2 truncate text-xs font-bold text-muted-foreground">
            Anexo: {attachment}
          </p>
        )}
        <p className="mt-2 text-xs font-bold text-muted-foreground">
          PNG, JPEG, WebP ou PDF · máximo de 5 MB
        </p>
      </div>
      {siteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
          />
          <div
            className="cf-turnstile"
            data-sitekey={siteKey}
            data-action="support_request"
            data-language="pt-BR"
            data-theme="light"
          />
        </>
      ) : (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm font-extrabold text-destructive"
        >
          O captcha ainda não foi configurado. Entre em contato novamente mais tarde.
        </p>
      )}
      {state.error && (
        <p role="alert" className="text-sm font-extrabold text-destructive">
          {state.error}
        </p>
      )}
      <button
        disabled={pending || !siteKey}
        className="btn-pop w-full gap-2 bg-primary px-6 text-primary-foreground shadow-[var(--shadow-pop)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {pending ? "Enviando..." : "Abrir solicitação"}
      </button>
    </form>
  );
}
