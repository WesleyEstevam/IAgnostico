# IAgnóstico Web

Frontend do IAgnóstico migrado para Next.js App Router, TypeScript, Tailwind CSS 4 e componentes no padrão shadcn/Radix.

## Rotas disponíveis

- `/` — landing page
- `/dashboard` — hub gamificado
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

A interface atual contém dados demonstrativos. Pontuação, tempo, gabarito e ranking deverão permanecer sob autoridade do servidor quando as integrações forem implementadas.

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
