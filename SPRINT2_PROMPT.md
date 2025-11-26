# Prompt – Planejamento da Sprint 2 (Afixgraf Lead Master)

Use este prompt para orientar a próxima iteração do agente/desenvolvedor (Sprint 2). Ele contextualiza o estado atual do repositório e define entregáveis claros para o backend e para os painéis web (vendedoras e administrativo).

## 1) Contexto atual (Sprint 1)
- Backend Node/Express já expõe três rotas: `/assumir-atendimento`, `/enviar-mensagem` e `/reativar-atendimento`, com integração Supabase e webhook para o n8n. (Ver `backend/README.md`.)
- Estrutura de banco documentada no `README.md` raiz: tabelas principais `dados_cliente`, `chats`, `chat_messages`, `n8n_chat_histories`, `vendedoras` e `documents`.
- Não há frontend implementado; painéis e fluxos de UX estão apenas descritos conceitualmente.

## 2) Objetivo da Sprint 2
Entregar um MVP navegável para as vendedoras (painel de atendimento) e preparar a base para o dashboard administrativo. No backend, ampliar as rotas para sustentar o painel e garantir testes básicos.

## 3) Requisitos principais (histórias / critérios de aceitação)
1. **Autenticação simples para vendedoras**
   - Login com e-mail e senha (hash no Supabase) e emissão de JWT curto (1h) assinado por secret de ambiente.
   - Middleware protegendo rotas autenticadas do painel.
2. **Listagem de leads e estado**
   - Endpoint `GET /leads` retornando lista paginada de clientes com campos: `telefone`, `nomewpp`, `atendimento_ia`, `responsavel_atual`, `assumido_em`, última mensagem e indicador se há resposta pendente.
3. **Timeline de mensagens de um lead**
   - Endpoint `GET /leads/:telefone/messages` retornando mensagens de `chat_messages` em ordem crescente, incluindo `agent_type`, `agent_name`, `message`, `message_type`, `event`, `respondido_em`.
4. **Enviar mensagens via painel**
   - Reusar `/enviar-mensagem` com autenticação e preenchimento automático de `responsavel` a partir do token; manter chamada ao webhook do n8n.
5. **Assumir/pausar/reativar**
   - `POST /assumir-atendimento` deve exigir autenticação e gravar `responsavel_id`/`responsavel_atual` coerente com o usuário logado.
   - Novo endpoint `POST /pausar-atendimento` para marcar `atendimento_ia = "pause"` e manter `responsavel_atual`.
   - `/reativar-atendimento` pode ser chamado pelo painel para devolver à IA; zere `responsavel_atual/responsavel_id`.
6. **Observabilidade mínima**
   - Logging estruturado em todas as rotas (sucesso/erro) e métricas simples (contadores em memória) para chamadas de API.
7. **Frontend (painel vendedoras) – MVP**
   - Stack sugerida: React + Vite + TypeScript + Tailwind.
   - Telas: Login, Lista de Leads (com busca por telefone/nome e filtro por status), Chat detalhado (timeline + composer), Ações rápidas (assumir, pausar, reativar).
   - Usar mock do backend se necessário, mas preparar serviços apontando para os endpoints reais.
8. **Dashboard administrativo – base**
   - Criar shell de app (pode ser no mesmo projeto frontend, com rota protegida separada) contendo placeholders para métricas: leads por status, tempo médio de resposta, conversões.

## 4) Regras técnicas e de qualidade
- Não envolver try/catch em imports. Use ESLint/Prettier configurados no frontend e backend (adicionar se não existir).
- Testes mínimos: backend com Jest ou similar cobrindo happy path e validação de corpo nas novas rotas; frontend com teste de renderização das páginas principais (Vitest/RTL).
- Variáveis de ambiente documentadas em `.env.example` (tokens JWT, URLs backend/frontend, Supabase, n8n).
- Scripts npm: `dev`, `start`, `test`, `lint`, `build` (frontend e backend).
- Documentar no `backend/README.md` e em um `frontend/README.md` novo como iniciar, rodar testes e fluxo de autenticação.

## 5) Entregáveis esperados ao final da Sprint 2
- Código backend com novas rotas, autenticação e testes passando.
- Projeto frontend (painel vendedoras + shell administrativo) com rotas e chamadas de API configuradas.
- Atualização dos READMEs com passos de setup, envs e exemplos de payload/respostas.
- Scripts de banco atualizados se precisarem de novos campos/índices (ex.: `responsavel_id` em `dados_cliente`).

## 6) Checklist de pronto (Definition of Done)
- Lint e testes executados e documentados.
- Endpoints respondendo com status code e mensagens de erro claros.
- Build do frontend sem erros; telas principais navegáveis.
- Sem secrets no repositório; `.env.example` completo.
- Commits e PR com resumo das mudanças e instruções de teste.

Use este prompt como guia para executar ou orquestrar a Sprint 2. Priorize a lista acima e mantenha a coerência com o fluxo já descrito no README raiz.
