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

A autenticação usa Firebase no navegador apenas para obter o ID token. O servidor o troca por um cookie de sessão `httpOnly` e cria o perfil privado com 3 plantões gratuitos. O fluxo inclui login social/e-mail, recuperação de senha e logout. As áreas privadas validam a sessão no servidor; pontuação, tempo, gabarito, plantões e ranking permanecem sob autoridade do servidor.

O chat do caso clínico aceita OpenAI ou Gemini e acessa o provedor somente no servidor. Configure `AI_PROVIDER`, `AI_MODEL` e a chave correspondente (`OPENAI_API_KEY` ou `GEMINI_API_KEY`) em `.env.local` e nas variáveis da Vercel. Para OpenAI, use `AI_PROVIDER=openai` e `AI_MODEL=gpt-5.6-luna`. Para Gemini, use `AI_PROVIDER=gemini` e `AI_MODEL=gemini-3.6-flash`. Cada partida aceita até 10 perguntas; se o provedor estiver indisponível ou a chave não estiver configurada, o paciente usa a resposta de fallback do caso.

### Plantões gratuitos

- Cada jogador do plano gratuito possui no máximo 3 plantões.
- O saldo é restaurado para `3/3` diariamente às `00:00` no fuso `America/Bahia`.
- A recarga é aplicada pelo servidor no primeiro acesso após a virada do dia, sem depender de tarefa agendada.
- O consumo e a criação da partida acontecem em uma transação idempotente do Firestore quando a contagem anuncia o início do plantão.
- O encerramento por diagnóstico ou tempo é validado pelo servidor, que calcula o tempo restante, corrige a resposta, concede XP e atualiza as estatísticas em uma única transação.
- O streak usa o calendário de `America/Bahia`: o primeiro caso concluído no dia inicia ou mantém a sequência, um caso no dia seguinte incrementa `+1` e um dia perdido reinicia a sequência.
- O ranking lê somente `playerProfiles`, uma projeção pública sem e-mail ou saldo de plantões, atualizada pelo servidor durante o login e a conclusão dos casos.
- A correção diagnóstica possui três níveis: correto (100% do XP), chegou perto (50%) e incorreto (20% quando uma hipótese foi enviada). Os aliases de resposta parcial são configurados individualmente por arquétipo clínico.
- Cada caso do catálogo MVP possui exatamente cinco exames: dois relevantes, dois neutros e um distrator plausível. A categoria é interna e não é revelada ao jogador.

## Configuração do Firebase

1. Copie `.env.example` para `.env.local` e preencha a configuração do app Web e da conta de serviço.
2. No Firebase Authentication, habilite E-mail/senha e os provedores sociais desejados.
3. Crie o banco Cloud Firestore e publique `firestore.rules` antes de usar dados reais.
4. Publique também `firestore.indexes.json`; o índice de partidas por usuário e data é necessário para o histórico e os gráficos de evolução.
5. Execute `npm run seed:cases` uma vez para publicar o catálogo `mvp-2`, com 85 cenários clínicos distintos: 30 de Cardiologia, 30 de Clínica Geral e 25 de Infectologia. O comando valida e substitui somente documentos gerenciados por versões anteriores do seed, preservando casos manuais.
6. Para liberar o painel de casos para um usuário já cadastrado, execute `npm run grant:admin -- usuario@exemplo.com`. O acesso é verificado novamente no servidor em cada operação administrativa.

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
