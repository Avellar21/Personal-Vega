# Vega

App pessoal all-in-one do Gabriel, com a assistente Vega. Uso só pessoal: um usuário, nada é publicado ou vendido.
Responda e escreva textos da interface em português do Brasil. O plano completo e o roadmap em 8 etapas estão no
documento "Plano do App Assistente Pessoal" do projeto.

## Estrutura

- `apps/app`: app Expo (Android, iOS e web) com Expo Router. Rotas em `apps/app/src/app`. Leia `apps/app/AGENTS.md`.
- `packages/core`: domínio, `Store` e a camada de serviços. Sem dependência de React ou Supabase.
- `supabase/migrations`: SQL do banco. `supabase/test` aplica as migrações num Postgres em memória e testa as regras.

## Regras da arquitetura

- Toda leitura e escrita passa por um serviço de `packages/core` via `callService`. Telas nunca chamam o Supabase
  direto. A Vega usa os mesmos serviços como ferramentas (`toToolDefinitions`).
- Um serviço novo: `defineService` com schema zod, `description` escrita para a Vega, `mutates`, e
  `needsConfirmation` para apagar, mexer em dinheiro ou alterar em massa. Escritas devolvem `activity` para o
  registro de atividades. Registre o serviço em `packages/core/src/index.ts` e escreva testes com `MemoryStore`.
- Toda tabela tem `user_id` com RLS, `created_at`, `updated_at` e `deleted_at` (lixeira). `activity_log` é só de
  inclusão.
- Cores, espaços e tipografia vêm de `apps/app/src/theme/tokens.ts`; componentes base em `apps/app/src/components/ui`.

## Comandos (na raiz)

```bash
npm run typecheck   # todos os pacotes
npm run lint
npm test            # testes da camada de serviços
npm run test:db     # migrações + regras de acesso
npm run web         # app no navegador
npm run app         # servidor do Expo (celular)
```

Neste ambiente, `npx expo install` precisa de `EXPO_OFFLINE=1` (a API do Expo é bloqueada) e a documentação do Expo
não abre; consulte os tipos em `node_modules`.
