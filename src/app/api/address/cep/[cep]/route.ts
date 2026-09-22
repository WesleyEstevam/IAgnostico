import { NextResponse } from "next/server";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ cep: string }> }) {
  const { cep: rawCep } = await params;
  const cep = rawCep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ error: "Informe um CEP com 8 dígitos." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`ViaCEP respondeu ${response.status}`);
    const address = await response.json() as ViaCepResponse;
    if (address.erro === true || address.erro === "true") {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      cep,
      street: typeof address.logradouro === "string" ? address.logradouro : "",
      neighborhood: typeof address.bairro === "string" ? address.bairro : "",
      city: typeof address.localidade === "string" ? address.localidade : "",
      state: typeof address.uf === "string" ? address.uf : "",
    });
  } catch (error) {
    console.error("Falha ao consultar CEP", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Não foi possível consultar o CEP agora." }, { status: 502 });
  }
}
