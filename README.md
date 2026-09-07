# SQL Vende Fácil

Construa um app de estudo de SQL chamado "SQL para quem vende". Roda inteiramente no navegador, sem backend e sem autenticação. O público é gente da área comercial que nunca escreveu uma query. Prioridade absoluta: precisa ser usável no celular.

Anexei dois arquivos: licoes.json (conteúdo do curso) e seed.sql (base de treino). Salve em src/data/licoes.json e src/data/seed.sql.

MOTOR DE BANCO
Use PGlite (@electric-sql/pglite), que é PostgreSQL compilado em WASM rodando no navegador. Instancie com persistência: new PGlite('idb://sqlvende'). No vite.config adicione optimizeDeps: { exclude: ['@electric-sql/pglite'] }, senão o WASM não carrega.

Na inicialização, verifique se a tabela "deals" existe. Se não existir, execute seed.sql com db.exec(). Mostre indicador de carregamento explicando que está preparando um PostgreSQL no navegador, porque demora alguns segundos na primeira vez.

Não use SQLite nem sql.js em hipótese nenhuma. O curso depende de FILTER, DATE_TRUNC, percentile_cont e window functions, que só existem no Postgres.

ESTRUTURA DO CONTEÚDO
licoes.json é um array de 14 lições. Campos: id, bloco, bloco_nome, titulo, pergunta_negocio, duracao_min, conceito (markdown), sintaxe {codigo, explicacao}, variacao {codigo, explicacao}, erro_classico {codigo, mensagem, explicacao}, exercicio {enunciado, dica, gabarito, resultado_esperado}, pratica_extra [{enunciado, gabarito}]. Algumas lições têm campo opcional "inversao" {titulo, texto}, renderizado como box de destaque entre sintaxe e variação.

Os textos usam markdown: negrito com asteriscos duplos, código inline com crase. Renderize markdown de verdade, não mostre os asteriscos.

TELAS

1. Home: as 14 lições agrupadas por bloco (6 blocos). Cada lição mostra id, titulo, pergunta_negocio como subtítulo, duração em minutos e indicador de estado (não iniciada, resolvida, resolvida com gabarito). Barra de progresso geral no topo.

2. Lição: renderize nesta ordem exata: O conceito, A sintaxe, o box de inversão se existir, A variação, O erro clássico, o Exercício. Cada bloco de código tem botão "Rodar no editor" que joga o código no editor e navega para a prática. O bloco do erro clássico tem visual distinto, com borda de alerta, e mostra a mensagem de erro abaixo em bloco monoespaçado.

3. Prática: editor SQL com realce de sintaxe (CodeMirror, modo sql, tema escuro), altura mínima 200px. Botões: Executar, Verificar resposta, Ver dica, Ver gabarito. Abaixo, tabela de resultado com contador de linhas e tempo em ms.

4. Referência: explorador de schema com as tabelas (stages, owners, companies, contacts, deals, deal_stage_history, activities) e suas colunas com tipo. Clicar em um nome insere o texto no editor. Em desktop é coluna lateral, em mobile é aba.

VERIFICAÇÃO
Ao clicar em Verificar resposta, execute a query do usuário E a do gabarito, normalize os dois resultados e compare.
Normalização: cada linha vira array de células; cada célula tenta virar número e arredonda em 2 casas, senão vira minúscula sem espaços nas pontas; ignore os nomes das colunas; ordene o conjunto de linhas antes de comparar.
Isso é essencial: existe mais de uma query certa por exercício, e a validação é por resultado, nunca por texto.

Acertou: marca resolvido, mensagem "Resultado correto".
Errou: diagnóstico útil, não um "errado" seco. Informe linhas esperadas versus obtidas e colunas esperadas versus obtidas. Se a contagem de linhas do usuário for múltiplo exato da esperada, acrescente: "sua query provavelmente sofreu fan-out: um join está multiplicando linhas".

Ver gabarito abre confirmação avisando que a lição será marcada como resolvida com ajuda, depois mostra o gabarito com botão de copiar.

ERROS
Quando a query do usuário der erro, mostre a mensagem original do Postgres inteira, sem traduzir e sem simplificar. A mensagem de erro é material de ensino, várias lições comentam mensagens específicas.

ESTADO
localStorage por id de lição: estado (nao_iniciada, resolvida, resolvida_com_gabarito) e última query escrita. Ao voltar na lição, restaure a query no editor.

Botão discreto no rodapé "Recriar base de dados", com confirmação, que roda o seed de novo sem apagar o progresso.

VISUAL
Tema escuro, sóbrio, densidade alta. Monoespaçada em todo código e tabela. Sem gradiente, sem emoji, sem ilustração, sem animação de comemoração. Referência é cliente de banco profissional como TablePlus ou DBeaver, não plataforma gamificada de curso. Tabela com linhas zebradas, cabeçalho fixo e rolagem horizontal.

Valor NULL na tabela deve aparecer como a palavra NULL em itálico e cor apagada, nunca célula vazia. Isso é conteúdo do curso, a lição 3 inteira trata disso.

MOBILE
O app será usado principalmente no celular, em sessões de 20 a 40 minutos. Em desktop, três colunas (navegação, conteúdo, referência). Em mobile, navegação por abas na parte inferior, uma coluna, editor confortável para digitação em tela pequena. Trate mobile como caso principal, não como adaptação.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sql-for-sales.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3aa7ffd3-7f75-47f9-b231-46cb3cc9a609).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
