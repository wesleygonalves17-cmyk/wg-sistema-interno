# WG // Sistema Interno

Painel interno da WG Marketing — clientes, atividades do dia e metas.
Next.js (App Router) + Supabase.

## Rodar localmente

1. Instalar dependências:
   ```
   npm install
   ```

2. Copiar `.env.local.example` para `.env.local` e colar sua chave:
   - No Supabase, vá em **Project Settings → API**
   - Copie a **anon / public key** e cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Criar seu usuário de login (a única forma de entrar no sistema):
   - No Supabase, vá em **Authentication → Users → Add user**
   - Cadastre seu e-mail e uma senha (marque "Auto Confirm User")
   - Deixe o **Public sign-up desabilitado** em Authentication → Settings, pra ninguém mais conseguir criar conta

4. Rodar:
   ```
   npm run dev
   ```
   Abre em http://localhost:3000 — vai pedir login primeiro.

## Estrutura

- `app/(app)/page.tsx` — dashboard "Hoje": atividades pendentes agrupadas por prioridade
- `app/(app)/clientes/page.tsx` — lista e cadastro de clientes
- `app/(app)/metas/page.tsx` — metas com barra de progresso
- `app/login/page.tsx` — login (Supabase Auth)
- `middleware.ts` — protege as rotas, redireciona pra /login se não estiver autenticado
- `schema.sql` — schema já aplicado no banco (clients, activities, goals)

## O que ainda falta (próximos passos naturais)

- Editar/apagar clientes e metas direto na tela (hoje só tem criação + toggle de atividade)
- Atualizar `current_value` das metas manualmente ou puxar de alguma fonte (Meta Ads API, etc.)
- Conectar o pipeline de leads (diagnóstico de Instagram) pra criar clientes automaticamente como "prospect"
- Deploy (Vercel é o caminho mais direto pra Next.js)
