# FE-02 — Catálogo (página inicial)

**Status:** aprovada. Escrita depois da implementação e ainda não passou
pelo verificador-spec. O código existe em `frontend/src/app/page.tsx` e hoje
roda com dados em memória. Este documento é a fonte de verdade; onde o
código divergir, o código está errado.

**Contexto:** [PRD §5.2](../../docs/prd.md) (layout), [ADR-001](../../docs/adrs/adr-001-stack.md) (stack).
**Depende de:** [FE-03](spec-login.md) e [BE-02](../../backend/specs/spec-autenticacao.md)
para saber quem é o usuário, [BE-01](../../backend/specs/spec-backend.md) para os dados.

---

## 1. Objetivo

Ser a tela de entrada de quem faz login como **Colaborador**: mostrar todo o
acervo de equipamentos, deixar claro em uma olhada o que dá para pegar agora,
e permitir solicitar um empréstimo sem sair da página.

Não é uma tela de "o que está disponível" — é o acervo inteiro. Ver que o
MacBook está com outra pessoa e volta dia 07/09 é informação útil; esconder o
item seria pior.

## 2. Quem acessa

| Papel | Acessa | Vê |
|---|---|---|
| Colaborador | sim | todos os equipamentos; os próprios empréstimos |
| Operações | sim | o mesmo; a visão completa dos empréstimos é em outra tela |
| Não autenticado | não | redireciona para o login |

A rota é `/`. Operações vê o mesmo Catálogo que o Colaborador — o que muda
para ele são as abas disponíveis na barra de navegação, não esta tela.

## 3. Dados de entrada

A tela precisa de três coisas:

| Dado | Origem | Uso |
|---|---|---|
| Lista de equipamentos | `GET /equipamentos` | os cards |
| Empréstimos em aberto do usuário | `GET /emprestimos/meus` | limite, atraso, "está com você" |
| Quem está logado | sessão | nome e iniciais na barra |

Cada equipamento traz, quando emprestado, **quem está com ele e até quando** —
o Catálogo não faz uma segunda chamada por item.

## 4. Composição da tela

Layout completo no PRD §5.2. O que esta spec fixa é a **estrutura**, na ordem
vertical:

1. Barra de navegação (fixa no topo)
2. Cabeçalho: H1 "Catálogo" + contagem de disponíveis; busca à direita
3. Banner de bloqueio por atraso — **condicional**
4. Linha de chips de filtro
5. Grade de cards, ou estado vazio

### Contagem do cabeçalho

`"{n} de {total} equipamentos disponíveis agora"`, onde `n` conta apenas
situação `disponivel`. Manutenção **não** entra em `n`. A contagem ignora
busca e filtro: é sobre o acervo, não sobre o que está na tela.

### Card

Kicker de categoria · nome · patrimônio · pill de situação · linha de detalhe
· botão de largura total. A linha de detalhe tem altura mínima fixa para que
cards em situações diferentes não fiquem com alturas desiguais.

| Situação | Linha de detalhe |
|---|---|
| Disponível | `Pronto para retirada no balcão` |
| Emprestado | `Com {pessoa} · devolver até {DD/MM/AAAA}` |
| Em manutenção | a observação do equipamento |

## 5. Regras de comportamento

### 5.1 Botão do card

O rótulo e a habilitação são **derivados**, nunca guardados em estado. A
ordem de avaliação importa e é esta:

| # | Condição | Rótulo | Habilitado | Variante |
|---|---|---|---|---|
| 1 | equipamento em manutenção | `Indisponível` | não | secondary |
| 2 | emprestado para o próprio usuário | `Está com você` | não | secondary |
| 3 | emprestado para outra pessoa | `Emprestado` | não | secondary |
| 4 | usuário tem algum item em atraso | `Bloqueado por atraso` | não | secondary |
| 5 | usuário tem 5 empréstimos ativos | `Limite de 5 itens` | não | secondary |
| 6 | nenhuma das anteriores | `Solicitar empréstimo` | sim | primary |

**Por que a ordem é essa:** a posse do item precisa vencer o limite e o
atraso. Dizer "Limite de 3 itens" num equipamento que já está na mão do
usuário seria uma resposta errada à pergunta que ele está fazendo.

### 5.2 Bloqueio por atraso

Se o usuário tiver **qualquer** empréstimo com `devolver_ate` anterior a
hoje, o banner vermelho aparece no topo (abaixo do cabeçalho, acima dos
chips) nomeando o item e a data vencida, com atalho para Meus empréstimos.

O bloqueio é por pessoa, não por item: um único atraso bloqueia todas as
solicitações.

### 5.3 Busca

Filtra por **nome + patrimônio**, case-insensitive e sem sensibilidade a
acento, a cada tecla, sem botão e sem debounce visível. A busca não fala com
o servidor — filtra a lista já carregada.

### 5.4 Filtros de situação

Quatro chips exclusivos: Todos · Disponíveis · Emprestados · Em manutenção.
Combinam com a busca (E lógico). O padrão é Todos, e o filtro **não persiste**
entre visitas.

### 5.5 Solicitar empréstimo

1. Clique no botão habilitado abre o modal de confirmação.
2. O modal mostra o nome do item e `Devolver até = hoje + 14 dias`, em
   destaque no acento.
3. Cancelar, `Esc` ou clique no backdrop fecham sem efeito.
4. Confirmar chama `POST /emprestimos`.
5. Em sucesso: o item vira `Emprestado`, some dos disponíveis, o contador do
   cabeçalho cai em um, e sai um toast de 2600ms.
6. Em erro: o modal continua aberto e mostra a mensagem do servidor.

**O prazo é calculado pelo servidor, não pelo navegador.** A data no modal é
uma previsão; a data que vale é a que volta na resposta. Relógio de cliente
não decide prazo.

## 6. Estados

| Estado | O que aparece |
|---|---|
| Carregando | esqueleto da grade, cabeçalho já visível |
| Vazio por busca/filtro | caixa tracejada: "Nenhum equipamento encontrado para esta busca." |
| Acervo vazio | caixa tracejada: "Nenhum equipamento cadastrado ainda." |
| Erro ao carregar | mensagem com botão "Tentar de novo" |

## 7. Acessibilidade

- A busca tem `aria-label`; o modal é `role="dialog"` com `aria-modal`.
- O modal fecha com `Esc` e devolve o foco ao botão que o abriu.
- Botões desabilitados continuam no fluxo de tabulação e anunciam o motivo
  pelo rótulo — "Limite de 3 itens" já é a explicação.
- O toast é `role="status"`, para ser anunciado sem roubar o foco.
- Situação nunca é comunicada só por cor: a pill sempre tem texto.

## 8. Fora de escopo

Reserva com data futura · notificação por e-mail · paginação ou scroll
infinito · ordenação configurável · favoritar item · histórico de empréstimos
encerrados · foto do equipamento.

## 9. Critérios de aceite

1. Com 9 equipamentos, 4 disponíveis e 2 em manutenção, o cabeçalho diz
   "4 de 9 equipamentos disponíveis agora".
2. Um item em manutenção mostra pill cinza, a observação na linha de detalhe
   e botão `Indisponível` desabilitado.
3. Com 5 empréstimos ativos e nenhum atraso, todo card disponível mostra
   `Limite de 5 itens`, e o card que está com o usuário mostra
   `Está com você`. (Era 3 até a alteração do PRD em 11/11/2026; ver FE-04.)
4. Com um item em atraso, o banner aparece e todos os cards disponíveis
   mostram `Bloqueado por atraso`.
5. Buscar `TI-0142` deixa exatamente um card; buscar `ti-0142` faz o mesmo.
6. Confirmar um empréstimo faz o card virar `Está com você` e o contador cair
   em um, sem recarregar a página.
7. Sem sessão válida, a rota `/` leva ao login.

## 10. Decisões em aberto

| # | Questão | Efeito |
|---|---|---|
| 1 | O acervo pode passar de ~100 itens? | se sim, busca e filtro vão para o servidor e entra paginação |
| 2 | Operações deve ver algo a mais no Catálogo (ex.: botão de editar item)? | muda o card por papel |
| 3 | Quando dois usuários pedem o mesmo item ao mesmo tempo, que mensagem o perdedor vê? | texto do erro de conflito (ver [BE-01 §7](../../backend/specs/spec-backend.md)) |
