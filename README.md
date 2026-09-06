# IAgnóstico Web

Frontend do IAgnóstico migrado para Next.js App Router, TypeScript, Tailwind CSS 4 e componentes no padrão shadcn/Radix.

## Rotas disponíveis

- `/` — landing page
- `/registro` — criação de conta com Firebase Authentication
- `/recuperar-senha` — envio seguro do link de redefinição
- `/dashboard` — hub gamificado (requer sessão)
- `/caso` — caso clínico interativo (demo local)
- `/evolucao` — desempenho e histórico

## Arquitetura

```text
src/
├── app/                    # rotas e layouts do Next.js
├── core/                   # domínio e casos de uso (próximas etapas)
├── infrastructure/         # Firebase e provedores de IA (próximas etapas)
├── presentation/           # componentes e hooks de interface
└── shared/                 # tipos, configuração e utilitários compartilhados
```

A autenticação usa Firebase no navegador apenas para obter o ID token. O servidor o troca por um cookie de sessão `httpOnly` e cria o perfil privado com 3 plantões gratuitos. O fluxo inclui login social/e-mail, verificação de e-mail, recuperação de senha e logout. As áreas privadas validam a sessão no servidor; pontuação, tempo, gabarito, plantões e ranking permanecem sob autoridade do servidor.

## Configuração do Firebase

1. Copie `.env.example` para `.env.local` e preencha a configuração do app Web e da conta de serviço.
2. No Firebase Authentication, habilite E-mail/senha e os provedores sociais desejados.
3. Crie o banco Cloud Firestore e publique `firestore.rules` antes de usar dados reais.

Nunca versione `.env.local` ou o JSON da conta de serviço.

## Desenvolvimento

```bash
npm install
npm run dev
```

Validação:

```bash
npm run typecheck
npm run lint
npm run build
```
