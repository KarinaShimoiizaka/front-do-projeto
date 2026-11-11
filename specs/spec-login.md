# FE-03 — Login

**Status:** aprovada. Implementada, mas ainda não passou pelo
verificador-spec. O código está em `frontend/src/app/login/`,
`src/lib/supabase/` e `src/middleware.ts`.

**Contexto:** [PRD §5.1](../../docs/prd.md) (layout do login),
[FE-01](spec-frontend.md) (frontend).
**Lado do servidor:** [BE-02](../../backend/specs/spec-autenticacao.md) —
papéis, validação de token e provisionamento de perfil.

> **Decisão tomada em 28/09/2026: não há cadastro na v1.** As contas são
> criadas à mão no painel do Supabase. Isso apagou desta spec as telas de
> cadastro e de recuperação de senha, que a versão anterior descrevia.

---

## 1. Objetivo

Levar a pessoa de "cheguei no site" a "estou no Catálogo" com o mínimo de
passos, e deixar evidente quando algo deu errado.

## 2. Telas

| Rota | Tela | Quem acessa |
|---|---|---|
| `/login` | entrar | quem não tem sessão |

Uma só. Com sessão válida, `/login` redireciona para `/`.

### Layout

O do PRD §5.1, com **uma mudança**: sai o botão ghost
"Entrar como Operações →". Era atalho de protótipo; o papel vem da conta, não
de um botão (BE-02 §2).

A coluna esquerda (marca, título de 44px em duas linhas, lead, faixa das três
estatísticas, rodapé "Operações · TI interno") fica exatamente como o PRD
descreve. A coluna direita tem 340px centralizados: H2 "Entrar", lead, campo
E-mail, campo Senha, botão primário `btn-block` de 40px, e a nota "Cada
pessoa vê apenas os próprios empréstimos".

Não há link para cadastro nem para recuperação de senha, porque não há essas
telas. Quem não consegue entrar procura quem administra o painel.

## 3. Campos e validação

| Campo | Regra no cliente | Quando valida |
|---|---|---|
| E-mail | não vazio, com formato de e-mail | ao enviar |
| Senha | não vazia | ao enviar |

A validação do cliente serve para evitar uma ida à rede que já se sabe
inútil, **não** para garantir nada: a regra que vale é a do Supabase. Em
particular, o comprimento mínimo de senha não é verificado aqui — no login
isso só revelaria formato de senha a quem está tentando adivinhar.

Erro de campo aparece abaixo dele, em 12px, na cor de erro
(`--st-late-fg`), e o campo ganha borda da mesma cor.

## 4. Estados do formulário

| Estado | Comportamento |
|---|---|
| Ocioso | botão primário habilitado, rótulo `Entrar` |
| Enviando | botão desabilitado, rótulo `Entrando…` |
| Erro | mensagem acima do botão; **e-mail e senha preservados** |
| Sucesso | navega para `/` |

A senha nunca é limpa em caso de erro. Obrigar a redigitar depois de uma
falha de rede pune a pessoa por um problema que não é dela.

## 5. Mensagens de erro

| Origem | Mensagem |
|---|---|
| Credencial recusada pelo Supabase | `E-mail ou senha incorretos.` |
| E-mail não confirmado | `Confirme seu e-mail antes de entrar.` |
| Falha de rede | `Não foi possível conectar. Verifique sua internet.` |
| Qualquer outra | `Não foi possível entrar. Tente de novo.` |

Credencial errada e e-mail inexistente produzem a **mesma** mensagem: senão a
tela de login vira um verificador de quem trabalha aqui. O Supabase já
devolve um erro único para os dois casos; o frontend não tenta distinguir.

## 6. Proteção de rotas

Três camadas, e as três precisam existir:

| Camada | Protege de | O que faz |
|---|---|---|
| `middleware.ts` do Next | a tela piscar antes do redirect | redireciona por presença de sessão |
| Guard do Nest | chamada direta à API | 401/403 |
| RLS no Postgres | o dado vazar | política por linha |

Esconder a aba de Operações **não** é proteção — é acabamento.

| Rota | Regra do middleware |
|---|---|
| `/login` | com sessão → `/` |
| todas as outras | sem sessão → `/login` |

Depois do login, a barra de navegação monta as abas a partir do papel:
Colaborador vê Catálogo e Meus empréstimos; Operações vê essas duas mais
Operações e Equipamentos.

## 7. Acessibilidade

- Cada campo tem `<label>` visível — nunca placeholder no lugar de rótulo.
- O formulário envia com `Enter`.
- A mensagem de erro do formulário é `role="alert"`, para ser anunciada.
- O campo com erro recebe `aria-invalid` e `aria-describedby` apontando para
  a mensagem.
- Erro nunca é sinalizado só por cor: sempre há texto.
- Ordem de tabulação segue a ordem visual: e-mail, senha, entrar.

## 8. Fora de escopo

Cadastro · recuperação de senha · login social · SSO · MFA · "lembrar de
mim" · medidor de força de senha · captcha · troca de senha estando logado.

## 9. Critérios de aceite

1. Com sessão válida, abrir `/login` redireciona para `/`.
2. Sem sessão, abrir `/` redireciona para `/login`.
3. Senha errada mostra `E-mail ou senha incorretos.` e **mantém** o e-mail e
   a senha digitados.
4. E-mail inexistente produz a mesma mensagem, indistinguível.
5. E-mail em branco não dispara chamada de rede: o erro aparece no campo.
6. Enquanto envia, o botão fica desabilitado e não aceita duplo clique.
7. Entrar com conta de Operações mostra quatro abas; com Colaborador, duas.

## 10. Decisões em aberto

| # | Questão | Efeito |
|---|---|---|
| 1 | Recuperação de senha entra na v1? | hoje a pessoa depende de quem administra o painel |
| 2 | A tela mostra alguma orientação de "como consigo uma conta"? | hoje não há texto nenhum sobre isso |
