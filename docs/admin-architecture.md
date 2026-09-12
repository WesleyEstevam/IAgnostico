# Arquitetura do painel administrativo do IAgnóstico

## Decisão técnica

O projeto já utiliza Firebase Authentication, Cloud Firestore e Firebase Admin em produção. Por isso, o painel administrativo continuará no mesmo projeto Next.js e usará o Firestore como fonte única de verdade. Adicionar PostgreSQL agora duplicaria identidades, planos e progresso, aumentaria o risco de divergência e exigiria uma migração sem benefício imediato.

O painel vive em `/admin` e o `proxy` reescreve acessos de `adm.iagnostico.com.br` para esse namespace. O mesmo deploy da Vercel atende o domínio público e o administrativo, evitando monorepo e duplicação de configuração.

## Estado atual auditado

- Next.js 16 App Router, React 19, TypeScript e Tailwind CSS 4.
- Firebase Authentication no cliente apenas para obtenção do ID token.
- Cookie de sessão Firebase `httpOnly`, validado pelo servidor.
- Firestore persiste usuários, projeção pública do ranking, partidas, progresso, casos e cotas de plantões.
- Gemini/OpenAI são acessados exclusivamente no servidor.
- Design baseado em tokens do Tailwind, `card-pop`, `btn-pop`, componentes Radix e ícones Lucide.
- Planos ainda estão parcialmente definidos no código e serão centralizados no Firestore na fase de assinaturas.
- Vercel executa um único app; não há ORM nem banco relacional a migrar.

## Autorização administrativa

Os papéis ficam no documento privado `users/{uid}`:

- `superadmin`: acesso integral, incluindo papéis.
- `admin`: gestão operacional, conteúdo, usuários e configurações.
- `support`: leitura de usuários e gestão de atendimento.

Cada operação exige uma permissão no servidor. O layout administrativo também valida a sessão, mas não substitui a autorização dentro de actions e serviços. Ações importantes escrevem em `adminAuditLogs` com ator, ação, recurso, valores anterior/posterior e timestamp.

## Coleções existentes e planejadas

Existentes: `users`, `playerProfiles`, `gameSessions`, `clinicalCases`.

Planejadas, criadas conforme cada módulo entrar em produção: `plans`, `planFeatures`, `subscriptions`, `payments`, `paymentWebhookEvents`, `supportCategories`, `supportTickets`, `supportMessages`, `faqs`, `emailTemplates`, `seoSettings`, `pageSeo`, `legalDocuments`, `appSettings`, `mediaAssets`, `adminAuditLogs`.

Não será criada uma segunda coleção de usuários. Campos novos serão adicionados de forma retrocompatível. Documentos ausentes usam defaults seguros até a migração correspondente ser executada.

## Índices, datas e exclusão

- Índices compostos ficam em `firestore.indexes.json` e são publicados pelo Firebase CLI.
- Timestamps persistidos usam `Timestamp.serverTimestamp()` (UTC).
- Datas administrativas serão formatadas com `America/Fortaleza`.
- Conteúdo e entidades financeiras usarão status/arquivamento em vez de exclusão física quando houver exigência de histórico.
- Eventos de webhook terão identificador único do provedor para idempotência.

## Estratégia de fases

1. **Fundação:** RBAC, namespace/subdomínio, shell administrativo, métricas reais iniciais, auditoria e documentação.
2. **Usuários (implementado):** paginação, busca, filtros, detalhes, ações sensíveis, migração de projeção e campo demográfico opcional.
3. **Planos e Asaas:** planos dinâmicos, entitlements, assinatura, pagamentos e webhooks idempotentes.
4. **Ajuda:** FAQs, categorias, tickets, mensagens e armazenamento privado de anexos.
5. **Conteúdo:** SEO, termos, templates de e-mail, configurações e rodapé dinâmico.
6. **Hardening:** testes de autorização/webhooks, rate limiting, observabilidade, acessibilidade e revisão responsiva.

## Configuração do subdomínio na Vercel

Adicione `iagnostico.com.br` e `adm.iagnostico.com.br` ao mesmo projeto Vercel. Configure no DNS o registro solicitado pela Vercel para o subdomínio. Não é necessário um segundo build. As mesmas variáveis Firebase server-side devem existir nos ambientes usados pelo domínio administrativo.

Adicione também `adm.iagnostico.com.br` aos domínios autorizados do Firebase Authentication. O cookie atual é restrito ao host, portanto a equipe administrativa autentica-se no subdomínio sem expor a sessão do aplicativo público entre domínios.

## Próxima migração

A próxima fase criará os documentos de plano e seus benefícios no Firestore, migrará `users.plan` para referência/slug normalizado e fará landing page e cotas consumirem essa configuração. A integração Asaas só será ativada depois da definição das credenciais Sandbox, segredo do webhook e regras comerciais de inadimplência/cancelamento.
