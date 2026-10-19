# FE-01 — Frontend

**Status:** parcialmente implementado. Existe o projeto Next.js e a tela do
Catálogo, rodando com dados em memória. As outras quatro telas e toda a
conversa com o backend não existem.

**Contexto:** [ADR-001](../../../docs/adrs/adr-001-stack.md) (Next.js + Tailwind),
[PRD](../../../docs/prd.md) (layout completo), [FE-02](spec-catalogo.md),
[FE-03](spec-login.md).
**Lado do servidor:** [BE-01](../../backend/specs/spec-backend.md).

---

## 1. Objetivo

Reproduzir fielmente o layout do PRD e não inventar regra de negócio. O
frontend derive o que é visual (rótulo, cor, habilitação) e delega ao backend
o que é decisão (se o empréstimo pode acontecer).

## 2. Estrutura

```
src/
├── app/
│   ├── layout.tsx              fonte, html/body, providers
│   ├── globals.css             tokens do Nocturne + classes de componente
│   ├── page.tsx                Catálogo            (/)
│   ├── login/page.tsx          Login               (/login)
│   ├── cadastro/page.tsx       Cadastro            (/cadastro)
│   ├── meus-emprestimos/       Meus empréstimos    (/meus-emprestimos)
│   ├── operacoes/              Operações           (/operacoes)
│   └── equipamentos/           Cadastro de item    (/equipamentos)
├── components/                 componentes de tela, sem regra de negócio
├── lib/
│   ├── tipos.ts                tipos do domínio
│   ├── dominio.ts              funções puras: derivações e formatação
│   └── api.ts                  cliente HTTP do backend
└── middleware.ts               proteção de rotas
```

### Rotas

| Rota | Tela | Exige |
|---|---|---|
| `/` | Catálogo | sessão |
| `/login`, `/cadastro`, `/recuperar` | autenticação | ausência de sessão |
| `/meus-emprestimos` | Meus empréstimos | sessão |
| `/operacoes` | Empréstimos em aberto | papel `operacoes` |
| `/equipamentos` | Cadastro de equipamento | papel `operacoes` |

O PRD descreve troca de tela na mesma janela, sem rotas aninhadas. Cada tela
é uma rota de verdade do App Router — o "sem rotas aninhadas" é sobre não
haver layout dentro de layout, não sobre usar uma SPA de uma página só.

## 3. Camadas

Três, com uma regra de dependência que não se inverte:

```
componentes  →  lib/dominio  →  (nada)
     ↓
  lib/api     →  backend
```

| Camada | Responsabilidade | Não faz |
|---|---|---|
| `lib/dominio` | funções puras: formatar data, derivar rótulo de botão, calcular estado de prazo | não importa React, não faz fetch |
| `lib/api` | fetch tipado, token, tradução de erro | não decide regra |
| `components` | markup e interação | não calcula regra; recebe pronto |
| `app/*/page` | busca dados, orquestra estado | não formata nem estiliza direto |

`lib/dominio.ts` ser puro é o que permite testar as regras sem montar
componente. É a camada mais valiosa para teste e a mais barata de manter.

## 4. Servidor e cliente

Padrão: **Server Component**. Vira `"use client"` só quando a tela tem estado
de interação — o que, na prática, é quase toda tela do PRD (busca a cada
tecla, chips, modal, toast).

A estratégia é empurrar o `"use client"` o mais fundo possível: a página busca
os dados no servidor e passa para um componente cliente que cuida da
interação. Hoje o Catálogo não faz isso — é cliente inteiro, porque os dados
são constantes. Quando a API existir, a página vira servidor e o miolo
interativo é que fica cliente.

## 5. Estado

| Tipo de estado | Onde vive |
|---|---|
| Dados do servidor | fetch na página, passado por props |
| Busca, filtro, modal aberto, toast | `useState` local da tela |
| Sessão | cliente do Supabase |
| Papel do usuário | do JWT, lido uma vez no layout |

**Nada de biblioteca de estado global.** Cinco telas que não compartilham
estado entre si não justificam Redux, Zustand nem Context de dados.

Toda mudança de dado é derivada no render: contagens, KPIs, cor de estado,
rótulo e habilitação de cada botão. Nenhum desses valores é guardado em
`useState` — guardar significaria ter de lembrar de atualizar.

## 6. Comunicação com o backend

`lib/api.ts` centraliza: base URL de `NEXT_PUBLIC_API_URL`, `Authorization`
com o token da sessão, e tradução do corpo de erro da [BE-01 §7](../../backend/specs/spec-backend.md) em exceção
tipada.

### Atualização otimista: não

Ao solicitar um empréstimo, a tela espera a resposta antes de mudar o card. O
servidor pode recusar por corrida (`EQUIPAMENTO_INDISPONIVEL`), por limite ou
por atraso, e desfazer uma mudança já pintada é pior que esperar 200ms.

### Mensagens de erro

O texto vem do campo `mensagem` da resposta. O frontend não reescreve nem
mapeia código em texto próprio — duas fontes de verdade para a mesma frase
divergem na primeira alteração.

## 7. Design system

O PRD §1 a §4 é normativo. O que esta spec acrescenta são as regras de uso:

1. **Nenhuma cor literal no markup.** Todo valor sai de `var(--*)`. Um
   `#2fb8ac` escrito à mão em um componente é bug.
2. **Tailwind não redefine token.** `tailwind.config.ts` aponta para as
   variáveis do `:root`; a escala vive no CSS, não na config.
3. **Classes de componente no `globals.css`** (`.btn`, `.card`, `.pill`,
   `.input`, `.nav`, `.dialog`), utilitárias do Tailwind para layout. A
   divisão é: aparência de componente no CSS, arranjo na marcação.
4. **Espaçamento sempre por `gap`**, nunca margem entre irmãos.
5. **Situação nunca só por cor** — a pill sempre tem texto.

## 8. Acessibilidade

Mínimo que toda tela cumpre: foco visível (`outline` de 2px no acento),
modal com `role="dialog"` que fecha no `Esc` e devolve o foco, toast em
`role="status"`, todo input com label ou `aria-label`, e contraste de texto
sobre o fundo escuro usando o acento 300 e não o 500.

## 9. Testes

| Nível | Ferramenta | O que cobre |
|---|---|---|
| Unitário | Jest | `lib/dominio.ts` inteiro — é onde as regras viram comportamento |
| Componente | Testing Library | card com cada situação, e o modal |
| Fluxo | manual, por ora | login → solicitar → devolver |

Não há teste de ponta a ponta automatizado na v1. O ganho não paga o custo de
manter navegador em CI para cinco telas.

## 10. Convenções

- Código e comentário em **português**, como o resto do repositório.
- Arquivo de componente em `PascalCase`, de `lib` em `camelCase`.
- Nome de função e variável descreve o domínio (`emprestimoEmAtraso`), não a
  mecânica (`checkFlag`).
- Import do próprio projeto sempre por `@/`, nunca por `../../`.
- Data no formato `DD/MM/AAAA`; ISO só no transporte.
- Copy direta e operacional, sem exclamação e sem emoji.

## 11. Dívidas conhecidas

| # | O quê | Onde |
|---|---|---|
| 1 | Dados de exemplo em memória em vez da API | `src/lib/dados.ts` |
| 2 | `HOJE` é uma constante fixa (`2026-08-31`) para bater com o PRD | `src/lib/dados.ts` |
| 3 | Aba "Meus empréstimos" inerte, porque a tela não existe | `src/components/Navbar.tsx` |
| 4 | Catálogo é `"use client"` inteiro | `src/app/page.tsx` |
| 5 | Scripts chamam `node node_modules/next/...` porque o `&` no caminho quebra o npm no Windows | `package.json` |

## 12. Fora de escopo

Tema claro · internacionalização · PWA e uso offline · animação além das três
do PRD §8 · biblioteca de componentes de terceiros · Storybook.

## 13. Decisões em aberto

| # | Questão | Efeito |
|---|---|---|
| 1 | O prazo usa a data do servidor ou do navegador para calcular atraso? | se do navegador, o relógio do usuário muda o que ele vê |
| 2 | A lista recarrega sozinha quando outra pessoa pega um item? | hoje não; se precisar, entra revalidação ou polling |
| 3 | Sessão expirada no meio de um modal: descarta ou tenta de novo depois do login? | muda o tratamento de 401 em `lib/api.ts` |
