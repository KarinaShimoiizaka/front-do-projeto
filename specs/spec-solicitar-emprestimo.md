# FE-04 — Solicitar empréstimo e Meus empréstimos

**Status:** aprovada (11/11/2026).

**Contexto:** briefing "solicitar empréstimo" da prática; [PRD](../../docs/prd.md)
§5.1, §5.2, §5.3 e §7 (alterado em 11/11/2026: limite de 5 itens, prazo de 14
dias úteis); [FE-01](spec-frontend.md) §3 a §6 (camadas, estado, `lib/api`);
[FE-02](spec-catalogo.md) (o catálogo que já existe).
**Lado do servidor:** [BE-04](../../backend/specs/spec-emprestimos.md).

---

## 1. Objetivo

O catálogo deixa de usar dados em memória e passa a mostrar o acervo real,
com foto. Solicitar cria o empréstimo de verdade, e a recusa mostra o motivo.
Nasce a tela "Meus empréstimos". Isso paga as dívidas 1 a 4 da FE-01 §11.

## 2. Comunicação com o backend

Como a FE-01 §6 define, em `src/lib/api.ts`:

- base em `NEXT_PUBLIC_API_URL`;
- `Authorization: Bearer <access_token>` da sessão do Supabase;
- erro da API vira exceção com o `codigo` e a `mensagem` do servidor. A tela
  mostra a `mensagem` como veio, sem reescrever.

Sem atualização otimista (FE-01 §6): ao confirmar, a tela espera a resposta.

**Os dados são buscados no navegador**, não no servidor do Next como a
FE-01 §4 sugeria: o token da sessão já está no cliente do Supabase do
navegador, e no Docker local o servidor do Next não alcança o backend por
`localhost`. As páginas continuam Server Components para checar a sessão.

## 3. Catálogo (`/`)

O que o FE-02 já descreve continua valendo (cabeçalho, busca, filtros,
banner de atraso, modal, toast), com estas mudanças:

- **Dados:** `GET /api/equipamentos` e `GET /api/emprestimos/meus` (BE-04),
  em vez de `lib/dados.ts`.
- **Foto no card:** cada card mostra a foto do equipamento (`imagemUrl`),
  em 4:3, com `alt` igual ao nome.
- **Sem crédito nem rodapé** no catálogo, como o briefing pede (decisão da
  pessoa, `ENTREGA.md` §1).
- **Botão do card** (FE-02 §5.1, com o limite novo):
  - em manutenção → `Indisponível`, desabilitado;
  - emprestado para a própria pessoa → `Está com você`, desabilitado;
  - emprestado para outra pessoa → `Emprestado`, desabilitado, e o detalhe
    "Com {pessoa} · devolver até {data}";
  - pessoa com item em atraso → `Bloqueado por atraso`, desabilitado;
  - pessoa com 5 em aberto → `Limite de 5 itens`, desabilitado;
  - nos outros casos → `Solicitar empréstimo` (o rótulo da FE-02 §5.1).
- **Modal:** mostra "Devolver até" com a data de 14 dias úteis a partir de
  hoje. O que vale é a data que o servidor devolver; é ela que aparece no
  toast.
- **Recusa do servidor:** a mensagem dele aparece num aviso na tela (o mesmo
  toast), e o card não muda.
- **"Hoje"** é o dia em São Paulo, não mais a constante `HOJE`.

## 4. Meus empréstimos (`/meus-emprestimos`)

Layout do PRD §5.3:

- H1 "Meus empréstimos" e a linha "N de 5 itens em seu nome · prazo padrão
  de 14 dias úteis";
- barra de 5 traços: ocupados no acento, em atraso em vermelho, vazios
  apagados;
- uma linha por empréstimo em aberto: foto pequena e nome do item,
  "Retirada" e "Devolver até" em `DD/MM/AAAA` (na cor do estado do prazo) e a
  pill do estado;
- **sem botão "Devolver":** devolução está fora de escopo nesta fase;
- estado vazio: caixa tracejada com "Ir ao catálogo".

A aba "Meus empréstimos" da barra de navegação passa a levar para cá.

## 5. Regras em `lib/dominio.ts`

- `LIMITE_POR_PESSOA = 5`;
- prazo em **dias úteis**: uma função que soma 14 dias úteis (segunda a
  sexta), com os mesmos exemplos da BE-04 §4;
- todas as funções recebem "hoje" como parâmetro (tests.md, regra 5).

## 6. Copy que muda por causa do PRD

- Login (PRD §5.1): `5 itens por pessoa` e `14 dias úteis de prazo`.
- Catálogo: `Limite de 5 itens`.

## 7. Fora de escopo

Devolução · telas de Operações e Equipamentos · reserva · notificação ·
renovação · crédito das fotos na tela.

## 8. Critérios de aceite

1. O card mostra a foto do equipamento (`img` com `src` igual à `imagemUrl`
   e `alt` igual ao nome) e nenhum texto de crédito.
2. Com 5 empréstimos em aberto e nenhum atraso, todo card disponível mostra
   `Limite de 5 itens`, desabilitado; com 4, mostra `Solicitar empréstimo`.
3. Item em manutenção mostra `Indisponível`, desabilitado.
4. Somar 14 dias úteis dá os três exemplos da BE-04 §4.
5. Confirmar no modal chama `POST /api/emprestimos` e, com sucesso, o card
   vira `Está com você` e o toast mostra a data de devolução que o servidor
   devolveu.
6. Quando o servidor recusa (por exemplo, `LIMITE_ATINGIDO`), a mensagem
   dele aparece na tela e o card não muda.
7. "Meus empréstimos" lista os empréstimos em aberto com a data de
   devolução em `DD/MM/AAAA`; sem nenhum, mostra o estado vazio com "Ir ao
   catálogo".
8. O cabeçalho de "Meus empréstimos" diz "N de 5 itens em seu nome · prazo
   padrão de 14 dias úteis".
9. O login mostra `5 itens por pessoa` e `14 dias úteis de prazo`.
10. `lib/api` envia o token da sessão no `Authorization` e transforma a
    resposta de erro em exceção com a `mensagem` do servidor.

## 9. Decisões em aberto

| # | Questão | Efeito |
|---|---|---|
| 1 | Feriados contam no prazo? | segue a BE-04, decisão em aberto 1 |
