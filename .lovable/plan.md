# Sincronizar o progresso entre celular e navegador

## O que está acontecendo hoje

O progresso (lições resolvidas e a última query escrita) é gravado no armazenamento local do próprio aparelho, junto com o banco PostgreSQL que roda dentro do navegador. Nada sai do aparelho. Por isso o que você fez no celular não aparece no computador — não é um bug, é o modelo atual.

## O que será construído

Login com conta, e o progresso passa a ficar na nuvem, sincronizado entre todos os aparelhos.

1. **Backend (Lovable Cloud)** ativado no projeto, com banco de dados e autenticação.
2. **Tela de acesso** com e-mail/senha e "Entrar com Google". Sem obrigar login: quem não entrar continua usando o app normalmente, só com progresso local.
3. **Sincronização do progresso**: ao entrar, o app envia o progresso local para a nuvem e baixa o que já existe lá, unindo os dois. A partir daí, cada lição resolvida e cada query salva sobe automaticamente.
4. **Regra de união** ao juntar local + nuvem: "resolvida" vence "resolvida com gabarito", que vence "não iniciada". Para a query salva, vale a mais recente.
5. **Indicador no cabeçalho**: mostra a conta conectada e um botão de sair; quando deslogado, um link discreto "Entrar para sincronizar".

## O que continua local

A base de treino (PostgreSQL no navegador) e o botão "Recriar base de dados" seguem 100% no aparelho. Só o progresso viaja.

## Detalhes técnicos

- Ativar Lovable Cloud; nova tabela `lesson_progress` com `user_id`, `lesson_id`, `estado`, `query`, `updated_at`, chave única `(user_id, lesson_id)`, RLS restrita a `auth.uid()` e GRANTs para `authenticated`/`service_role`.
- Sem tabela de perfil: o app não precisa de nome de exibição nem avatar; usa apenas `auth.users`.
- Rota pública `/auth` com e-mail/senha (`signUp` com `emailRedirectTo`) e Google via `lovable.auth.signInWithOAuth`, mais `supabase--configure_social_auth` para o provedor Google.
- `src/lib/progress.ts` ganha uma camada de sincronização: mantém o `localStorage` como cache imediato (leitura instantânea, funciona offline) e faz upsert no banco em cada mudança quando há sessão.
- Merge executado uma vez no login e no `onAuthStateChange` (`SIGNED_IN`), com listener único em `__root.tsx`.
- Leituras/escritas via `createServerFn` com `requireSupabaseAuth`, chamadas de componentes (nunca de loader público).
- Barra de progresso, home e navegação passam a ler o estado já mesclado — sem mudança visual além do indicador de conta.
