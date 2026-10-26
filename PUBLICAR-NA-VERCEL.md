# Publicar o Pulso na Vercel

## 1. Preparar o Supabase

1. Crie um projeto em https://supabase.com/dashboard.
2. No SQL Editor do projeto novo, execute o conteúdo de `supabase/migrations/001_pulso.sql`, uma única vez.
3. Em Authentication, habilite Email, cadastro e confirmação de e-mail. Depois de criar os usuários desejados, você pode desabilitar novos cadastros para manter o acesso restrito.
4. No diálogo Connect ou nas configurações de API, copie Project URL e a chave publishable. A chave anon legada também funciona. Não use chave secret nem service_role.

A migração cria a tabela e a política de leitura por usuário. A função de gravação identifica o dono pela sessão e confere a revisão antes de salvar. Escrita direta na tabela fica bloqueada.

## 2. Importar o código na Vercel

1. Extraia o ZIP e coloque o conteúdo da pasta `pulso-independente` em um repositório GitHub seu. Inclua `.env.example` e `supabase/`; não envie `.env.local`, `node_modules` ou `.next`.
2. Na Vercel, selecione Add New → Project e importe esse repositório.
3. Escolha Next.js. A pasta raiz deve ser a que contém `package.json`. `vercel.json` já configura `npm ci` e `npm run build`. Não defina saída estática.
4. Se precisar descobrir o domínio atribuído, faça um primeiro deploy: o projeto compila sem credenciais, mas o login aguarda configuração.
5. Anote o domínio de produção, por exemplo `https://seu-pulso.vercel.app`.

Alternativa: use `npx vercel` na pasta extraída e siga as instruções da sua conta. Não basta enviar o ZIP ao painel como um site estático.

## 3. Configurar as variáveis

Em Project → Settings → Environment Variables, adicione para Production:

| Variável | Valor |
| --- | --- |
| APP_URL | https://seu-pulso.vercel.app |
| SUPABASE_URL | Project URL do Supabase |
| SUPABASE_PUBLISHABLE_KEY | Chave publishable ou anon |

São variáveis de servidor: não precisam de prefixo NEXT_PUBLIC_. O código não usa chave administrativa.

Faça redeploy após alterar variáveis. APP_URL deve ser a origem exata usada no navegador, sem caminhos. Se mudar para domínio próprio, atualize também o Supabase. Para começar, valide no domínio estável de produção. Se usar Preview, configure uma origem de Preview exata e, preferencialmente, outro projeto Supabase para testes.

## 4. Configurar os e-mails

Em Supabase → Authentication → URL Configuration:

- Site URL: `https://seu-pulso.vercel.app`.
- Redirect URLs: `https://seu-pulso.vercel.app/auth/callback` e `https://seu-pulso.vercel.app/auth/callback?next=/recuperar`.
- Para desenvolvimento, adicione os equivalentes com `http://localhost:3000` e use essa origem em APP_URL no `.env.local`.

Em Authentication → Email Templates:

- Confirm signup: copie o conteúdo de `supabase/email-templates/confirm-signup.html`.
- Reset password: copie `supabase/email-templates/reset-password.html`.

Esses modelos usam `/auth/confirm` para validar o token e criar a sessão; os links podem ser abertos em outro dispositivo. O retorno PKCE por `/auth/callback` também é suportado.

Configure SMTP no Supabase para envio em produção. O servidor padrão é limitado aos endereços autorizados da equipe do projeto. Alinhe o mínimo de senha do Supabase em 12 caracteres, conforme o formulário, e ajuste os limites de tentativas do provedor.

## 5. Conferir e migrar os dados

1. Abra `/entrar`, crie sua conta e confirme o e-mail.
2. Entre, registre um indicador e aguarde “Salvo na nuvem”.
3. Entre com a mesma conta em outro computador/celular e confira o registro.
4. Com uma segunda conta de teste, confira que os dados da primeira não aparecem.
5. Teste “Esqueci minha senha”, conclua a troca e teste sair/entrar.
6. Exporte o backup JSON no app original. No novo domínio, use Sobre o modelo → Restaurar backup. Aguarde o salvamento e confira os registros.

O ZIP contém código, não o banco antigo ou senhas. Os IDs dos provedores são diferentes; o backup importa os dados para a nova conta. Confira a migração antes de desativar a versão anterior.

## Problemas comuns

- Acesso não configurado: confira as três variáveis e faça redeploy.
- Login funciona, mas não salva: confira a migração, o projeto Supabase e APP_URL.
- E-mail não chega: confira SMTP, limites e modelos de e-mail.
- Link expirou: solicite outro e confira Site URL e os modelos.
- Origem não permitida: use o domínio exato definido em APP_URL.
- Conflito de edição: exporte o rascunho antes de carregar a versão mais recente da nuvem.

## Validação da entrega

Compilação e 10 testes locais passaram. A migração foi executada em PostgreSQL via PGlite, com verificação das permissões e conflitos. Login real, e-mails e gravação remota devem ser confirmados após configurar seu projeto Supabase. O pacote não inclui deploy já realizado na sua conta Vercel.

## Referências oficiais

- Vercel/Next.js: https://vercel.com/docs/frameworks/full-stack/nextjs
- Variáveis: https://vercel.com/docs/environment-variables/managing-environment-variables
- Sessões: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Login e senha: https://supabase.com/docs/guides/auth/passwords
- E-mails: https://supabase.com/docs/guides/auth/auth-email-templates
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
