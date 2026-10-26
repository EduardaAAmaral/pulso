# Atualizar o Pulso no GitHub

Este pacote foi preparado a partir do repositório EduardaAAmaral/pulso, revisão 18de31b. Versão do app: 1.0.1. Identificador de diagnóstico: pulso-fix-20261026-1.

1. Extraia `pulso-corrigido-github.zip`.
2. Abra a pasta `pulso-corrigido`. O arquivo package.json deve aparecer junto das pastas app, public e lib.
3. No repositório GitHub, selecione Add file → Upload files.
4. Envie o conteúdo de DENTRO dessa pasta. Os arquivos de mesmo caminho devem substituir os anteriores. Não envie o ZIP ou uma pasta adicional envolvendo o projeto.
5. Confirme em Commit changes na branch main.
6. Aguarde a publicação automática da Vercel ficar Ready. Se não começar automaticamente, faça Redeploy usando o novo commit.
7. Abra https://pulso-rho-one.vercel.app/entrar e atualize a página com Ctrl+Shift+R.

Se a conexão falhar, abra https://pulso-rho-one.vercel.app/api/workspace. A resposta nova terá um campo release com pulso-fix-20261026-1 e um código que identifica a etapa. Envie somente a mensagem e o código para conferência, nunca chaves.

As três variáveis continuam configuradas na Vercel. Não é necessário reexecutar a migração SQL nesta atualização. O pacote não inclui dados ou credenciais.

## Alterações

- Validação específica de APP_URL, SUPABASE_URL e formato da chave.
- Remoção de espaços no começo e no fim dos valores.
- Mensagens distintas para configuração, conectividade e estrutura/permissões do banco.
- A tela exibe a mensagem segura recebida da API, em vez de esconder o diagnóstico.
- Botão para ir ao login também disponível na tela de falha.
- Identificador de versão na tela e na API, e atualização dos endereços de assets para evitar cache do código anterior.
- 15 testes automatizados passaram. Compilação de produção verificada separadamente antes de empacotar.

Esta correção melhora o diagnóstico; uma configuração incorreta ou um serviço Supabase indisponível ainda precisará ser corrigido conforme a mensagem exibida. O login e a gravação reais devem ser conferidos após publicar na sua conta.
