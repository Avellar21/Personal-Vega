# Vega

Central pessoal com assistente: agenda, tarefas e hábitos, diário, finanças, empresa, saúde e dieta, treino, estudos
e hobbies, integrados pela Vega.

## Rodar

1. `npm install`
2. Copie `apps/app/.env.example` para `apps/app/.env` e preencha o endereço do projeto Supabase e a chave publicável.
3. Aplique as migrações de `supabase/migrations` no projeto (SQL Editor do Supabase, em ordem, ou `supabase db push`).
4. `npm run web` para o navegador, ou `npm run app` e abra no celular.

Depois de criar sua conta no app, desligue novos cadastros no Supabase (Authentication > Sign In / Providers >
Allow new users to sign up), já que o app é só seu.

## Verificações

`npm run typecheck`, `npm run lint`, `npm test` e `npm run test:db`. O GitHub Actions roda as quatro a cada push.
