# Pulso independente — Vercel + Supabase

Next.js com cadastro por e-mail, senha, confirmação e recuperação; PostgreSQL com dados separados por usuário. Não depende de Sites, login ChatGPT, Vinext ou Cloudflare D1.

## Instalação local

Use Node.js 22 atualizado e npm. Execute `npm ci`, copie `.env.example` para `.env.local` e preencha os três valores. Aplique a migração e configure os e-mails no Supabase conforme `PUBLICAR-NA-VERCEL.md`. Execute `npm run dev` e abra `http://localhost:3000/entrar`. Não há conta fictícia ou banco de demonstração.

## Comandos

- `npm test`: 10 testes, incluindo PostgreSQL real via PGlite, políticas de acesso, conflitos e validação.
- `npm run typecheck`: verificação TypeScript.
- `npm run build`: compilação Next.js.
- `npm start`: servidor de produção, para execução fora da Vercel se necessário.

## Estrutura

- `app/api/auth/route.ts`: login, cadastro, recuperação, troca de senha e logout.
- `app/auth/`: confirmação por token e retorno PKCE.
- `lib/supabase.ts`: sessão no servidor; cookies HttpOnly e validação com getUser().
- `app/api/workspace/route.ts`: API autenticada de dados.
- `supabase/migrations/001_pulso.sql`: banco, RLS e gravação atômica com revisão.
- `supabase/email-templates/`: modelos de confirmação e recuperação.
- `public/`: interface e catálogo de KPIs.
- `vercel.json`: configuração para publicação.

As páginas não consultam a sessão em Server Components. As APIs e os retornos de autenticação validam a sessão e podem renovar os cookies. Cabeçalhos externos de identidade não são usados para autenticar.

A interface mantém indicadores, metas, histórico, ações e importação de backup. Registros antigos devem ser exportados no aplicativo original e importados no novo domínio, após entrar na nova conta.

O pacote contém código, sem conta Supabase provisionada, senhas ou banco de produção. Compilação e testes locais passaram. Envio de e-mail, login e armazenamento remotos precisam ser confirmados após configurar seu Supabase. Nenhum deploy foi feito em sua conta Vercel.
