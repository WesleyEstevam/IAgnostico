export async function readApiResponse<T extends object>(response: Response): Promise<Partial<T>> {
  const body = await response.text();
  if (!body.trim()) return {};

  try {
    return JSON.parse(body) as Partial<T>;
  } catch {
    return {};
  }
}

export function apiResponseError(response: Response, message?: string) {
  if (message) return new Error(message);
  if (response.status === 504) return new Error("O servidor demorou para responder. Verifique a conexão do Firebase Admin na Vercel.");
  if (response.status >= 500) return new Error(`A configuração do servidor falhou (HTTP ${response.status}). Verifique os logs da Vercel e as variáveis FIREBASE_ADMIN_*.`);
  return new Error(`Não foi possível iniciar sua sessão (HTTP ${response.status}).`);
}
