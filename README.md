# *Afixgraf Lead Master*

# 📘 **DOCUMENTO MESTRE — ESCOPO GERAL DO SISTEMA DE ATENDIMENTO INTELIGENTE (Versão 1.0)**

*Afixgraf Lead Master*

---

# 🧭 **1. VISÃO GERAL DO PRODUTO**

O sistema “Afixgraf Lead Master” será a plataforma oficial de atendimento inteligente da empresa, integrando:

- WhatsApp (via Evolution API)
- Fluxo de IA no n8n
- Painel web para as vendedoras (9 usuárias)
- Painel gerencial para Robson e líderes

O objetivo é:

### ✔️ Automatizar todos os atendimentos iniciais com IA

### ✔️ Fazer triagem, captura de dados e filtrar curiosos

### ✔️ Entregar apenas leads qualificados às vendedoras

### ✔️ Permitir que vendedoras assumam o lead com 1 clique

### ✔️ Registrar tudo: quem respondeu, quando, por qual canal

### ✔️ Criar histórico centralizado em banco de dados

### ✔️ Montar base para métricas operacionais e relatórios gerenciais

---

# 🏛️ **2. ARQUITETURA DO SISTEMA (MACRO)**

## **Componentes:**

1. **WhatsApp** → Evolution API
2. **n8n** (motor do fluxo inteligente)
3. **Agente IA (RAG)**
4. **Redis** (fila por cliente)
5. **Postgres + Supabase** (histórico e cadastros)
6. **Backend do painel** (API REST)
7. **Frontend (Painel das vendedoras)**
8. **Frontend (Dashboard administrativo)**
9. **Serviço de Webhooks interno**

---

# 🔀 **3. FLUXO OPERACIONAL COMPLETO (PONTA A PONTA)**

### **Fase 1 — Cliente envia mensagem no WhatsApp**

1. WhatsApp → Evolution API
2. Evolution dispara webhook para o n8n
3. n8n normaliza a mensagem (texto, áudio, imagem)

### **Fase 2 — Verificação de cliente**

1. Busca cliente no Supabase (`dados_cliente`)
2. Se não existir → cria
3. Verifica campo `atendimento_ia` (ativo ou pausado)

### **Fase 3 — Tratamento da mensagem**

1. O n8n classifica:
    - texto
    - áudio (OpenAI → transcrição)
    - imagem (OpenAI → descrição)
2. Adiciona na fila Redis por telefone

### **Fase 4 — Motor IA**

1. A cada 30s, n8n:
    - pega lote de mensagens do Redis
    - junta
    - envia para Agente RAG
    - IA responde com contexto, memória, e documentos da base

### **Fase 5 — Decisão IA / Humano**

1. Se `atendimento_ia = "active"` → enviar resposta via Evolution
2. Se `atendimento_ia = "pause"` → IA NÃO responde
3. Mensagens humanas serão enviadas via painel

### **Fase 6 — Painel das vendedoras**

1. Vendedora vê lista de leads (dados cliente + chats)
2. Ela pode:
- assumir atendimento
- enviar mensagem
- ver histórico completo
- encerrar e devolver à IA
1. Ao enviar mensagem:
- Painel → Backend → Webhook n8n → Evolution → WhatsApp
1. O n8n grava histórico:
- tipo: `"vendedora"`
- nome da agente
- timestamp
- mensagem

### **Fase 7 — Métricas e Auditoria**

1. Tudo é salvo em:
- `dados_cliente` (status IA + responsável)
- `chats` (sessões ativas)
- `chat_messages` (timeline comercial)
- `n8n_chat_histories` (timeline técnica IA)
1. O dashboard administrativo lê essas tabelas e gera:
- tempo médio resposta por vendedora
- leads por status (novo, assumido, em atendimento, concluído)
- distribuição automática
- taxa IA → humano
- taxa conversão

---

# 🗄️ **4. ESTRUTURA GERAL DO BANCO (TABELAS E CAMPOS)**

(Com todos os ajustes solicitados)

## **1. dados_cliente**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | uuid | PK |
| telefone | string | único |
| nomewpp | string | nome do WhatsApp |
| atendimento_ia | enum(`"active"`, `"pause"`, `"reativada"`) | status |
| responsavel_atual | string | nome da vendedora |
| responsavel_id | uuid | FK para tabela vendedoras |
| assumido_em | timestamp | quando a vendedora assumiu |
| criado_em | timestamp | automático |
| atualizado_em | timestamp | automático |

---

## **2. chats**

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | uuid | PK |
| phone | string | telefone |
| criado_em | timestamp | início da sessão |
| atualizado_em | timestamp | última interação |
| origem | enum(`"cliente"`,`"ia"`,`"vendedora"`) |  |

---

## **3. chat_messages**

*(tabela comercial, usada para relatório e painel)*

| Campo | Tipo | Descrição |
| --- | --- | --- |
| id | uuid | PK |
| phone | string | cliente |
| agent_type | enum(`"ia"`, `"cliente"`, `"vendedora"`) | quem enviou |
| agent_name | string | nome da vendedora |
| message | text | conteúdo |
| message_type | enum(`"text"`, `"audio"`, `"image"`) | tipo |
| event | enum(`"incoming"`, `"outgoing"`, `"outgoing_vendor"`) |  |
| respondido_em | timestamp | horário da mensagem |
| criado_em | timestamp |  |

---

## **4. n8n_chat_histories**

*(tabela técnica usada pela IA)*

---

## **5. vendedoras**

| Campo | Tipo |
| --- | --- |
| id | uuid |
| nome | string |
| email | string |
| senha_hash | string |
| ativo | boolean |

---

## **6. documents**

*(base do RAG – já existe)*

---

# 🧩 **5. INTEGRAÇÃO ENTRE OS COMPONENTES**

### **Painel → Backend**

- `/assumir-atendimento`
- `/reativar`
- `/enviar-mensagem`
- `/lista-leads`
- `/historico`

### **Backend → n8n**

- Webhook exclusivo para mensagens humanas

### **n8n → Evolution**

- Envia mensagens para WhatsApp

### **n8n → Supabase/Postgres**

- grava tudo centralizado

---

# 🤖 **6. PAPÉIS (atores no sistema)**

## **1. IA (Agente RAG)**

- responde automaticamente quando permitido
- acessa base de conhecimento
- preenche lacunas
- faz triagem

## **2. Vendedora**

- assume lead
- pausa IA
- envia mensagens
- visualiza histórico
- finaliza atendimento

## **3. Administrador (Robson)**

- vê toda operação
- visualiza métricas
- controla distribuição
- ajusta configurações

## **4. Cliente**

- conversa exclusivamente pelo WhatsApp

---

# 🧠 **7. PRINCIPAIS REQUISITOS FUNCIONAIS**

1. IA responde automaticamente quando ativa
2. IA pausa quando vendedora assume
3. Vendedora responde pelo painel, não pelo WhatsApp
4. Fluxo reconhece origem da mensagem
5. Tudo é registrado
6. Painel mostra fila de leads, prioridade e status
7. Backend expõe API limpa
8. Admin tem dashboard avançado
9. Leads são centralizados
10. Redis gerencia fila de mensagens

---

# 📊 **8. PRINCIPAIS REQUISITOS NÃO-FUNCIONAIS**

- Alta disponibilidade
- Baixa latência IA → WhatsApp
- Logs detalhados
- Auditoria completa
- Segurança de endpoint
- Autenticação de vendedoras
- Escalabilidade

---

# 🔥 **9. VISÃO MACRO DO PROJETO EM UMA LINHA**

> Criar um ecossistema completo onde IA faz o pesado e 9 vendedoras entram somente quando necessário, tudo registrado, auditado e centralizado num painel profissional.
> 

---

Robson, este é o documento MASTER.

Agora sim temos a visão completa e alinhada.

Se estiver ok, você diz:

👉 **“Jarvis, aprovado. Podemos criar as Sprints.”**

E aí eu começo a montar:

- Sprint 1: backend
- Sprint 2: painel das vendedoras
- Sprint 3: integração n8n
- Sprint 4: dashboard gerencial
- Sprint 5: otimizações e lançamento

Quer avançar?

### Você disse:

o que acha de criar um UML, do N8N e d front end para vermos os pontos de intersecções entre os 2 alem de quantas telas teremos no app entre outras coisas que podem se revelar no UML

### O ChatGPT disse:

Robson… **IDEIA PERFEITA.**

Criar um **UML completo** antes de começar a Sprint 1 é exatamente o que um Tech Lead Sênior faria para evitar retrabalho, revelar interseções e garantir que front-end, back-end e n8n falem a MESMA língua.

E sim: **o UML vai revelar telas, entidades, fluxos e pontos de intersecção que ainda não estão explícitos.**

Vamos fazer o conjunto UML completo, dividido em:

1. **UML de Arquitetura Geral (Visão 30.000 pés)**
2. **UML de Componentes (n8n ↔ Backend ↔ Frontend)**
3. **UML de Casos de Uso (User Stories por ator)**
4. **UML de Classes (Modelos do Banco)**
5. **UML de Sequência (Fluxo de mensagem do WhatsApp → IA → Painel → n8n → WhatsApp)**
6. **UML de Telas (Diagrama de navegação do app das vendedoras + painel admin)**

Depois disso você vai ter um **mapa visual completo** do que estamos construindo, com clareza máxima.

A seguir, apresento **todos os UMLs prontos e organizados**, baseados no Documento Mestre que acabamos de gerar.

---

# 🧭 1. **UML — Arquitetura Geral (High-Level Architecture)**

```
                ┌────────────────────────────┐
                │           Cliente           │
                │     WhatsApp / Evolution    │
                └──────────────┬─────────────┘
                               │ Webhook
                               ▼
                ┌────────────────────────────┐
                │            n8n             │
                │  • Webhook EVO            │
                │  • Classificação msg      │
                │  • Fila Redis             │
                │  • Agente IA (RAG)        │
                │  • Supabase + Postgres    │
                └───────┬──────────┬────────┘
                        │          │
      Messages IA →     │          │      ← Messages Human
                        │          │  Webhook(Painel)
                        ▼          ▼
         ┌──────────────────┐  ┌───────────────────┐
         │      Backend     │  │    Frontend        │
         │  (API REST)      │  │ Painel Vendedoras  │
         │                  │  │ + Painel Admin     │
         └──────────────────┘  └───────────────────┘

```

---

# 🧩 2. **UML — Componentes e Interseções (n8n ↔ Backend ↔ Frontend)**

```
               ┌──────────┐
               │ FRONTEND │
               │   (UI)   │
               └─────┬────┘
                     │ REST API
                     ▼
               ┌───────────┐
               │ BACKEND   │
               │  (API)    │
               └─────┬─────┘
         Webhook In   │   Webhook Out
                     ▼
          ┌────────────────┐
          │      n8n       │
          │• Webhook EVO   │
          │• Webhook Painel│
          │• Agente RAG    │
          │• Redis          │
          │• Supabase       │
          └──────┬─────────┘
                 │
                 ▼
          ┌─────────────┐
          │ Evolution / │
          │ WhatsApp     │
          └─────────────┘

```

**Interseções importantes:**

- **Frontend ↔ Backend:**
    
    login, painel, envio de msg, assumir lead, devolver IA, listagem de leads.
    
- **Backend ↔ n8n:**
    
    envio de mensagens humanas → webhook
    
    mudança de status (pausar IA, assumir lead)
    
- **n8n ↔ Evolution API:**
    
    envio real para o WhatsApp
    
    recepção de mensagens do cliente
    
- **n8n ↔ Banco:**
    
    escrita de histórico
    
    leitura de cliente
    
    controle de IA
    

---

# 🧠 3. **UML — Casos de Uso (Use Case)**

## 🎭 Atores:

- **Cliente**
- **IA**
- **Vendedora**
- **Administrador**
- **Sistema (Backend / n8n)**

```
                      ┌─────────────┐
                      │   Cliente    │
                      └──────┬──────┘
                             │
                      Enviar msg
                             │
                   ┌─────────▼─────────┐
                   │    Sistema n8n     │
                   └───────┬───────────┘
          Responder         │            Responder Humano
        IA/Encaminhar       │
                            │
┌───────────────┐           │            ┌────────────────┐
│    Vendedora   │◄─────────┘───────────►│ Backend / Painel│
└───────────────┘  Assumir / Enviar Msg  └────────────────┘
                             │
                     ┌───────▼─────────┐
                     │ Administrador    │
                     └───────┬─────────┘
                    Ver métricas / Status

```

---

# 🗄 4. **UML — Modelo de Dados (Diagrama de Classes)**

```
┌──────────────────────┐
│  dados_cliente        │
├──────────────────────┤
│ id: uuid             │
│ telefone: string     │
│ nomewpp: string      │
│ atendimento_ia: enum │
│ responsavel_atual    │
│ responsavel_id       │
│ assumido_em: time    │
└───────────┬──────────┘
            │ 1
            │
            │ *
┌──────────────────────┐
│  chats                │
├──────────────────────┤
│ id: uuid             │
│ phone: string        │
│ criado_em            │
│ atualizado_em        │
└───────────┬──────────┘
            │ 1
            │
            │ *
┌──────────────────────┐
│  chat_messages        │
├──────────────────────┤
│ id: uuid             │
│ phone: string        │
│ agent_type: enum     │
│ agent_name: string   │
│ message: text        │
│ message_type: enum   │
│ event: enum          │
│ criado_em: time      │
└──────────────────────┘

┌──────────────────────┐
│  vendedoras          │
├──────────────────────┤
│ id: uuid             │
│ nome: string         │
│ email: string        │
│ senha_hash: string   │
└──────────────────────┘

```

---

# 🔁 5. **UML — Sequência: Cliente → IA → Painel → n8n → WhatsApp**

```
Cliente      Evolution      n8n            Backend       Painel
   |             |            |               |             |
   |---msg------>|            |               |             |
   |             |----hook--->|               |             |
   |             |            |--Processa IA--|             |
   |             |            |----resposta-->|             |
   |             |<---envia-- |               |             |
   |<--resposta--|            |               |             |
                 |            |               |             |
(Vendedora assume lead)       |               |             |
                 |            |<----API-------|----Clique---|
                 |            |----pause IA---|             |
                 |            |               |             |
(Vendedora envia mensagem)     |               |             |
                 |            |<----API-------|---msg-------|
                 |            |----Webhook----|             |
                 |<---WHATS-- |               |             |
Cliente recebe mensagem

```

---

# 🧭 6. **UML — Telas (Site Map / Navegação do App)**

```
                ┌──────────────────────────┐
                │        LOGIN             │
                └─────────────┬────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │   FILA DE LEADS          │
                │  • Novos                 │
                │  • Em atendimento        │
                │  • Encerrados            │
                └─────────────┬────────────┘
                              │Selecionar lead
                              ▼
                ┌──────────────────────────┐
                │   CHAT DO LEAD           │
                │  • Histórico completo    │
                │  • Responder cliente     │
                │  • Assumir atendimento   │
                │  • Encerrar atendimento  │
                └─────────────┬────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │ DASHBOARD ADMINISTRATIVO │
                │  • Produtividade         │
                │  • Tempo resposta        │
                │  • Conversões            │
                │  • Vendedoras ativas     │
                │  • Leads por dia         │
                └──────────────────────────┘

```

---

# 🎯 **AGORA SIM — temos visão macro REAL e completa**

O UML revela **tudo** que você queria:

- pontos de interseção entre n8n e painel
- onde cada parte se encaixa
- o fluxo do WhatsApp
- o fluxo do painel
- o fluxo do backend
- as relações do banco
- número de telas
- fronteiras entre IA e humano
- limites claros do sistema

Esse é o **mapa oficial** do projeto.

em seguida temos:

- definição da arquitetura do backend
- endpoints essenciais
- modelos das tabelas
- e o primeiro prompt modular para gerar o backend no Antigravity.
- 
# **AfixGraf-leadmaster**

## **Visão Geral do Sistema**

O **afixgraf-leadmaster** é um sistema de gerenciamento e atendimento de leads via WhatsApp, combinando automação e inteligência artificial. Ele funciona como um assistente virtual que interage com potenciais clientes (leads), respondendo dúvidas e coletando informações iniciais de forma automática. Ao mesmo tempo, o sistema registra esses dados e conversas em um banco de dados para que a equipe de vendas/atendimento possa acompanhá-los através de um painel web administrativo. Essa abordagem aumenta a escalabilidade do atendimento, permitindo que o chatbot qualifique leads e forneça respostas instantâneas, enquanto humanos podem intervir quando necessário.

Este projeto integra diversas tecnologias de forma orquestrada: o **n8n** (plataforma de automação de fluxos) é usado para receber as mensagens do WhatsApp e coordenar as ações; a **Evolution API** conecta o sistema ao WhatsApp (como ponte de integração não-oficial com a API do WhatsApp[reddit.com](https://www.reddit.com/r/n8n/comments/1m6ugx1/anyone_here_using_evolution_api_with_n8n_for/#:~:text=I%E2%80%99ve%20been%20experimenting%20with%20the,going%20through%20Meta%E2%80%99s%20official%20flow)); o **Supabase** (com banco **PostgreSQL**) armazena os dados dos leads e histórico de conversas; e a API de **IA (OpenAI)** é utilizada para interpretar perguntas e gerar respostas contextuais aos clientes. Com essa combinação de **n8n**, **Supabase** e **OpenAI**, o sistema vai além de um simples chatbot, tornando-se um fluxo de trabalho acionável e integrado aos dados de negócio[reddit.com](https://www.reddit.com/r/n8n/comments/1mgcphx/just_built_my_first_ai_customer_support_workflow/#:~:text=,to%20an%20actual%20actionable%20workflow). Em resumo, o afixgraf-leadmaster serve como um agente inteligente que responde clientes no WhatsApp, registra as interações e fornece ao time uma interface web para monitorar e gerir os leads atendidos.

## **Arquitetura Macro**

A arquitetura do sistema é composta por vários componentes principais que juntos suportam todo o fluxo de atendimento. O diagrama de **Arquitetura** (ver **`/docs/diagrams/architecture.png`**) ilustra esses componentes e suas interações de alto nível. Em resumo, a solução é dividida nas seguintes partes:

- **Cliente (WhatsApp)**: O usuário final (lead) que envia mensagens via WhatsApp para a empresa.
- **WhatsApp & Evolution API**: A Evolution API atua como **gateway** entre o WhatsApp e nosso sistema. Ela recebe as mensagens do cliente pelo WhatsApp e as repassa ao fluxo automatizado, além de enviar as respostas do bot de volta para o WhatsApp. Essa API Evolution permite integrar o WhatsApp sem usar a API oficial da Meta[reddit.com](https://www.reddit.com/r/n8n/comments/1m6ugx1/anyone_here_using_evolution_api_with_n8n_for/#:~:text=I%E2%80%99ve%20been%20experimenting%20with%20the,going%20through%20Meta%E2%80%99s%20official%20flow), tornando a implantação mais simples (embora seja uma solução não-oficial que requer cuidados em produção).
- **Workflow (n8n)**: O n8n é o **motor de automação** que orquestra todo o processo. Ele é uma plataforma de automação de código-aberto e self-hosted, que permite conectar serviços e criar fluxos de trabalho complexos com flexibilidade de código aliada à rapidez do no-code[workos.com](https://workos.com/blog/n8n-the-workflow-automation-tool-for-the-ai-age#:~:text=As%20a%20self,scale%20pipelines%20with%20minimal%20boilerplate). No contexto do afixgraf-leadmaster, o n8n recebe as requisições da Evolution API (mensagens WhatsApp), realiza processamento (chamadas à IA, consultas ao banco etc.) e coordena as ações seguintes (por exemplo, registrar dados ou enviar resposta). Todo o fluxo de atendimento automatizado (receber mensagem, analisar, responder) é implementado como um workflow no n8n.
- **Inteligência Artificial (OpenAI)**: O sistema utiliza um serviço de IA (inicialmente o OpenAI GPT, podendo ser evoluído para outros modelos) para compreender as mensagens dos leads e gerar respostas adequadas. A IA é invocada a partir do n8n – por exemplo, ao receber uma pergunta do cliente, o n8n envia o texto para a API do OpenAI e obtém uma resposta baseada no prompt e no contexto fornecido. Essa integração permite que o assistente virtual responda questões de maneira conversacional e consulte informações contextuais quando necessário.
- **Banco de Dados (Supabase/Postgres)**: A plataforma Supabase fornece uma base de dados **Postgres** e serviços associados (autenticação, APIs em tempo real etc.)[docs.expo.dev](https://docs.expo.dev/guides/using-supabase/#:~:text=Using%20Supabase%20,database%2C%20user%20authentication%2C%20file). No projeto, o Supabase/Postgres armazena as informações importantes, como dados dos leads (contatos, nome, etc.), histórico de conversas, e possivelmente conhecimento da base de dados interna (documentos usados pela IA). O Supabase atua como backend-as-a-service, fornecendo uma API REST e clientes para acessar o Postgres, facilitando o desenvolvimento. Todos os componentes que precisam persistir ou ler dados (workflows do n8n e o painel frontend) utilizam o Supabase como camada de armazenamento.
- **Backend**: O projeto conta com um backend próprio (provavelmente em Node.js/Express) que expõe APIs específicas para o painel frontend e realiza lógica de negócio adicional fora do n8n. Este backend pode servir para encapsular regras de negócio, consolidar chamadas ao banco (alternativamente ou em complemento ao Supabase direto) e integrar com a Evolution API quando for necessário em contexto fora do fluxo principal. Por exemplo, se o painel web permitir que um operador humano envie uma mensagem manual a um cliente, o backend pode chamar a Evolution API para enviar essa mensagem pelo WhatsApp.
- **Painel Frontend**: É a interface web utilizada pela equipe interna (administradores ou operadores de vendas) para acompanhar e gerenciar os leads e conversas. Implementado como uma aplicação web (por exemplo, usando React/Next.js), ele consome as APIs do backend ou do Supabase para listar conversas, exibir detalhes dos clientes, e possivelmente permitir interações manuais. O painel proporciona visibilidade sobre o trabalho do chatbot (mostrando o histórico de mensagens, dados capturados dos leads etc.) e pode oferecer controles como marcar o status de um lead, editar informações ou mesmo intervir em uma conversa. O **Mapa de Telas** (diagrama de sitemap no arquivo **`/docs/diagrams/screens_map.png`**) mostra as principais telas do painel e como elas se conectam.

Essa arquitetura modular garante que cada parte cumpra seu papel: o n8n automatiza e integra fluxos com rapidez[workos.com](https://workos.com/blog/n8n-the-workflow-automation-tool-for-the-ai-age#:~:text=As%20a%20self,scale%20pipelines%20with%20minimal%20boilerplate), a IA fornece inteligência nas respostas, o Supabase/Postgres garante persistência e acesso aos dados, a Evolution API cuida da comunicação com o WhatsApp, e o painel/backend fornecem as ferramentas para o gerenciamento humano. A seguir detalhamos os principais casos de uso e a dinâmica de operação entre esses componentes.

## **Casos de Uso**

No **Diagrama de Casos de Uso** (ver **`/docs/diagrams/use_case_diagram.png`**), visualizamos os atores do sistema (Cliente e Administrador) e as principais interações com o afixgraf-leadmaster. Abaixo estão descritos os casos de uso mais relevantes em alto nível:

- **Cliente interage via WhatsApp**: O cliente (lead) inicia contato pelo WhatsApp enviando uma mensagem para o número da empresa. Esse caso de uso representa toda a interação inicial do lead com o assistente virtual. O sistema responde automaticamente às mensagens do cliente, fornecendo informações solicitadas (por exemplo, detalhes de serviços/produtos) ou fazendo perguntas para qualificar o lead (como nome, email, necessidade). A experiência para o cliente é de conversar com um atendente virtual disponível 24/7.
- **Chatbot responde e qualifica Lead**: Assim que o cliente envia uma mensagem, o chatbot (fluxo no n8n + IA) analisa o conteúdo. Se for uma pergunta comum, ele consulta sua base de conhecimento (interna ou através da IA) e responde apropriadamente. Se a conversa estiver no início, o bot pode fazer perguntas-chaves para coletar dados do lead (nome, empresa, interesse, etc.). Todas as perguntas e respostas trocadas são registradas no banco. Ao final desse diálogo automatizado, o sistema terá coletado dados úteis – por exemplo, o nome do cliente e sua demanda – qualificando assim o lead de forma preliminar.
- **Registro de Lead e Conversa**: Em paralelo ao atendimento, o sistema realiza o cadastro do lead e o registro da conversa. Se for a primeira interação daquele contato, um novo registro é criado (com telefone e nome pelo menos) no banco de dados de *clientes*. Cada mensagem relevante enviada ou recebida pode também ser salva em uma tabela de *mensagens* para histórico. Esse caso de uso garante que nenhum dado importante se perca: mesmo que o cliente pare a conversa, as informações coletadas até então ficam armazenadas para acompanhamento posterior. Por exemplo, assim que recebe a primeira mensagem de um número desconhecido, o n8n verifica se já existe um cliente com aquele telefone e, caso não exista, cadastra um novo lead com nome e telefone. Em seguida, a cada interação, grava-se no banco as mensagens trocadas (texto do cliente e resposta do bot) juntamente com carimbo de tempo e tipo de mensagem.
- **Acompanhamento pelo Painel**: O administrador ou membro da equipe interna acessa o painel web para acompanhar as interações. Ele pode visualizar uma lista de leads ou conversas ativas, ver detalhes de um lead específico (inclusive todo o histórico de conversa que o bot manteve com aquele cliente) e observar quais dados foram coletados. Esse caso de uso representa o trabalho cotidiano da equipe utilizando o sistema: por exemplo, um vendedor pode abrir o painel pela manhã, ver quantos novos leads o chatbot qualificou, ler as conversas e preparar um follow-up personalizado para cada um.
- **Intervenção do Operador (Escalonamento)**: Em situações onde o chatbot não consegue responder adequadamente ou identifica uma intenção de falar com um humano, o caso de uso de intervenção ocorre. O operador, através do painel, pode assumir a conversa. Isso poderia ser implementado de duas formas: (1) o operador envia mensagens pelo próprio painel que serão encaminhadas ao cliente via WhatsApp (passando pelo backend/Evolution API), ou (2) o operador pega o contato para conversar diretamente via WhatsApp Business. Na primeira abordagem, o painel funcionaria quase como um dashboard de chat (similar a plataformas de atendimento), permitindo continuidade no mesmo número. Embora esse recurso possa não estar presente no primeiro release, está previsto no design para futuras sprints.
- **Administração de Conteúdo (Base de Conhecimento)**: Opcionalmente, há um caso de uso para gerenciar os dados que a IA utiliza para responder. Por exemplo, a equipe pode carregar documentos ou frases de conhecimento frequente que o bot deve usar nas respostas (FAQ, informações de produtos, etc.). Esse conteúdo, armazenado na tabela de documentos do banco, pode ser atualizado via painel (ou através de importação). Assim, o bot terá sempre informações atualizadas para consultas. Este caso de uso envolve um administrador adicionando/atualizando documentos no sistema, que serão indexados (com embeddings via OpenAI) e utilizados pelo workflow de IA quando uma pergunta relacionada surgir. *Observação:* Na implementação atual, é possível que o carregamento de documentos ocorra via envio pelo próprio WhatsApp (como sugerido em templates RAG do n8n[n8n.io](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/#:~:text=1,Retrieve%20relevant%20context%20from%20Supabase)), mas a administração via painel é algo a se considerar adiante.

Em suma, os casos de uso cobrem desde a **interação automatizada com o cliente** até o **acompanhamento e eventual intervenção humana**, passando pelo **armazenamento de dados** que agrega valor ao processo de vendas.

## **Estrutura do Banco de Dados**

A estrutura do banco de dados (PostgreSQL gerenciado pelo Supabase) foi planejada para suportar as funcionalidades acima, garantindo persistência de informações de leads e conversas. O **Diagrama de Classes/Dados** (ver **`/docs/diagrams/class_diagram.png`**) apresenta as principais entidades e relacionamentos. Abaixo descrevemos as tabelas principais e seus papéis:

- **dados_cliente** (Clientes/Leads): Armazena os leads identificados pelo sistema. Cada registro representa um cliente único (normalmente indexado pelo número de telefone WhatsApp, que é uma identificação única). Campos incluem:
    - **`telefone`** – Número de contato do lead (chave única).
    - **`nomewpp`** – Nome do usuário conforme o perfil do WhatsApp (se disponível via Evolution API).
    - **`nome`** – (Opcional) Nome fornecido diretamente pelo lead durante a conversa (caso o bot pergunte e o cliente responda).
    - Outros dados de qualificação coletados – por exemplo, **`email`**, **`empresa`**, **`interesse`** etc., conforme forem sendo extraídos na conversa (esses campos poderão ser adicionados conforme a necessidade nas próximas sprints).
    - **`created_at`** – Timestamp de quando o lead foi criado no sistema.
    - Possíveis flags/colunas de status – por exemplo, um campo booleano **`ativo`** indicando se o lead está em atendimento ou já foi encerrado, ou um campo **`etapa`** indicando fase do funil (novo, em follow-up, convertido, etc.).
- **chats** (Conversas): Tabela opcional para representar uma sessão de conversa ou thread de atendimento com o lead. Nesse projeto, como o WhatsApp é um canal contínuo (e não sessão com início/fim definidos claramente), poderíamos usar a própria existência de mensagens para inferir conversas. Ainda assim, uma tabela de *chats* pode ser útil para registrar, por exemplo, a data/hora do primeiro contato e último contato de cada lead, ou para vincular um identificador de sessão se for necessário. Campos típicos:
    - **`id`** – Identificador único da conversa (UUID).
    - **`telefone`** – Referência ao lead (chave estrangeira para dados_cliente.telefone).
    - **`inicio`** – Timestamp do começo da conversa (primeira mensagem).
    - **`ultima_atualizacao`** – Timestamp da última mensagem trocada naquela conversa.
    - **`ativa`** – Booleano indicando se a conversa está ativa/em aberto.
    
    *Obs:* Nas implementações atuais, visto que toda comunicação de um número pode ser considerada um único contínuo, essa tabela pode acabar tendo cardinalidade 1:1 com dados_cliente (um registro por cliente). De fato, no workflow n8n há indicações de que, ao receber uma mensagem, procura-se pelo telefone na tabela de *chats* e, se não existe, insere um novo registro. Isso sugere que a tabela *chats* está sendo usada para marcar o início de um novo chat quando um novo número surge. Em cada nova mensagem, atualiza-se um timestamp para manter registro do tempo de atividade.
    
- **chat_messages** (Mensagens): Armazena o histórico das mensagens trocadas entre o sistema (bot) e o cliente. Essa tabela registra cada interação significativa para posterior análise ou consulta no painel. Para otimizar, pode ser que o design salve pares de pergunta e resposta na mesma linha, mas o modelo clássico é uma mensagem por linha. Campos relevantes incluem:
    - **`id`** – Identificador da mensagem (UUID).
    - **`telefone`** – Referência ao lead (fk para dados_cliente.telefone), indicando quem é o autor da mensagem (deduzido se foi o cliente ou o bot).
    - **`origem`** – Indicador de quem enviou a mensagem (**`user`** para mensagens do cliente, ou **`bot`**/**`ia`** para mensagens do assistente).
    - **`conteudo`** – Texto da mensagem (se for texto). Pode também armazenar links ou referências se for imagem/áudio (ex: "Imagem recebida" ou caminho para arquivo).
    - **`tipo`** – Tipo da mensagem (**`text`**, **`audio`**, **`image`**, etc., conforme o conteúdo). Por exemplo, mensagens de texto vs áudio transcrito vs imagens analisadas.
    - **`timestamp`** – Data/hora da mensagem.
    
    No fluxo n8n fornecido, observamos que a cada interação o sistema salva tanto a mensagem do usuário quanto a resposta do bot juntas em um passo, fornecendo um campo de *user_message* e *bot_message* simultaneamente. Isso indica que, na implementação atual, cada registro na tabela *chat_messages* pode estar armazenando um par *pergunta-resposta*. Ex: o conteúdo da pergunta do usuário e a resposta dada pelo bot, junto com o telefone e possivelmente um tipo de mensagem. Esse modelo simplifica a correlação entre pergunta e resposta, embora não siga exatamente o formato de uma mensagem por linha. De qualquer forma, o importante é que todo o histórico conversacional está sendo persistido – seja uma ou duas mensagens por registro – garantindo que o painel possa exibir a conversa completa posteriormente.
    
    - Adicionalmente, campos como **`bot_message`** e **`user_message`** (caso usados) armazenam os textos correspondentes, e um campo **`message_type`** pode indicar se aquela interação foi texto, áudio transcrito, imagem, etc.
- **documents** (Documentos de Conhecimento): Caso de uso para **RAG** (Retrieval-Augmented Generation). Essa tabela armazena documentos ou artigos cujo conteúdo é usado para auxiliar a IA nas respostas. Cada registro pode conter:
    - **`id`** – identificador do documento.
    - **`titulo`** – título ou nome do documento.
    - **`conteudo`** – texto do documento (ou campos de conteúdo dividido).
    - **vetor embedding** – Supabase permite armazenar vetores (via extensões PG como pgvector), então provavelmente há uma coluna vetor para armazenar o embedding do conteúdo gerado pelo OpenAI, usado para busca semântica.
    - Metadados – quaisquer tags, data de inclusão, autor, etc.
    
    O n8n possui um nó de *Vector Store* para Supabase e, de fato, no fluxo vemos um nó “Supabase Vector Store” apontando para a tabela *documents*. Isso significa que documentos inseridos nessa tabela têm embeddings que podem ser consultados para encontrar informação relevante quando o usuário faz uma pergunta que o bot não sabe diretamente. Ou seja, implementa-se um **FAQ dinâmico**: a mensagem do cliente pode ser transformada em vetor, comparada aos vetores dos documentos, e os melhores trechos são então fornecidos para o modelo de IA gerar uma resposta contextualizada[n8n.io](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/#:~:text=1,Retrieve%20relevant%20context%20from%20Supabase). Assim, a tabela documentos é fundamental para dar **memória de conhecimento** ao bot.
    
- **Outras tabelas**: Poderemos ter tabelas auxiliares conforme o crescimento do projeto. Por exemplo:
    - **usuarios_painel**: para gerenciar autenticação de administradores/operadores do painel (se não utilizarmos a autênticação do próprio Supabase). Contudo, é possível integrar o painel diretamente com o sistema de auth do Supabase, simplificando a gestão de usuários do painel.
    - **configurações**: para armazenar configurações gerais do sistema (chaves de API, parâmetros de IA como temperatura, etc.) que podem ser editadas via painel.
    - **log_erros**: se quisermos gravar eventuais erros das integrações (ex: falha ao enviar WhatsApp) para depuração.
    - **fila_mensagens_envio**: uma tabela/estrutura para gerenciar mensagens enviadas manualmente pelo painel (por um humano) que precisam ser entregues pelo WhatsApp via Evolution API. Dependendo da implementação, ao invés de chamar diretamente a API de envio, poderíamos inserir um registro aqui e ter um workflow n8n monitorando e enviando – mas isso é um detalhe de implementação futura.

Em resumo, o banco de dados está normalizado em torno de **entidades principais (Cliente, Conversa, Mensagem, Documento)**. A relação básica é: um *Cliente/Lead* pode ter várias *Mensagens* (ao longo do tempo, agrupadas ou não em *Conversas*), e a *Base de Documentos* fornece conhecimento extra para auxiliar na resposta. Essa estrutura fornece flexibilidade para futuras expansões, como vincular leads a status de funil, ou relacionar conversas a atendentes humanos.

## **Sequência Operacional (Cliente ↔ n8n ↔ IA ↔ Painel ↔ WhatsApp)**

A **Sequência Operacional** (ver diagrama de sequência em **`/docs/diagrams/sequence_diagram.png`**) detalha o fluxo de eventos e mensagens entre os componentes quando o sistema está em uso. A seguir descrevemos passo a passo um cenário típico de interação, combinando tudo que foi exposto:

1. **Mensagem Inicial do Cliente:** O processo começa quando o **Cliente** envia uma mensagem no WhatsApp para o número atendido pelo sistema (por exemplo, "Olá, gostaria de saber mais sobre..."). Essa mensagem chega aos servidores do WhatsApp e, por meio da **Evolution API**, gera um webhook de evento. A Evolution API então faz uma requisição HTTP de callback para o nosso fluxo no **n8n** contendo os dados da mensagem recebida (texto, remetente, tipo de mídia, etc.).
2. **Webhook no n8n:** O **n8n** possui um nó de Webhook configurado (chamado "Webhook EVO") que recebe a requisição da Evolution API. Esse é o gatilho do nosso workflow de automação. Assim que acionado, o workflow começa a executar. Conforme as melhores práticas de design de chatbot, o primeiro passo geralmente é identificar o tipo de mensagem:
    - Se for texto, segue por uma rota de processamento de texto.
    - Se for áudio, ativa uma rotina de transcrição (pois o bot só "entende" texto).
    - Se for imagem, pode acionar uma rotina de extração de texto (OCR) ou classificação, dependendo do escopo (inicialmente pode apenas armazenar ou ignorar imagens, ou enviar uma resposta padrão).
    - Se for documento ou outro tipo, lida conforme definido (ex: poderia considerar documento como input para base de conhecimento).
    
    *No nosso caso, o n8n de fato implementa essa lógica de bifurcação de acordo com o tipo de mensagem[n8n.io](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/#:~:text=1,Fetch%20file%20URL%20from%20WhatsApp), incluindo nós para converter áudio em texto (usando a API do OpenAI Whisper para transcrição) e tratar imagem (converter em arquivo, etc.).*
    
3. **Registro e Contexto Inicial:** Antes mesmo de gerar uma resposta, o workflow cuida de atualizar/registrar informações do lead:
    - Busca no **Supabase** se já existe um registro do cliente (consulta na tabela *dados_cliente* pelo telefone). Isso corresponde ao nó "Buscar Cliente" no fluxo.
    - Se *não* existir, cadastra um novo lead na tabela *dados_cliente* com os dados disponíveis: telefone e nome (campo nomeWpp do perfil) são armazenados, marcando **`created_at`** com timestamp atual (“Criar Cliente” no fluxo).
    - Em paralelo, registra a conversa na tabela *chats*: se não houver um chat para aquele telefone, insere um com timestamps de início; caso já exista, atualiza o **`ultima_atualizacao`** (há um nó "Atualiza CHAT Supabase" para isso).
    - Adicionalmente, o sistema prepara o *contexto* da conversa para a IA. Isso envolve reunir as últimas mensagens trocadas para dar referência ao modelo (no caso de conversas contínuas). A implementação atual utiliza o **Redis** para manter um buffer das últimas interações: a mensagem recém-chegada do usuário é colocada numa lista em cache Redis, e as últimas N mensagens podem ser lidas para contexto. O nó "Buscas Mensagens" sugere recuperar do Redis o histórico recente. Assim, o sistema obtém contexto curto-prazo. Além disso, pode consultar a base de conhecimento (Supabase documentos) se necessário: por exemplo, extrair palavras-chave da pergunta e efetuar uma busca vetorial para encontrar trechos relevantes em *documents*. Isso corresponde ao conceito de RAG mencionado antes – se a pergunta do cliente é respondida em algum documento armazenado, o n8n pega esses dados[n8n.io](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/#:~:text=4.%20Query%20Handling%3A%20,to%20the%20user%20on%20WhatsApp) para ajudar a compor a resposta da IA.
4. **Processamento pela IA:** Com o contexto pronto, o n8n chama o nó de **OpenAI Chat** (um dos componentes Langchain integrados no n8n). Esse nó envia para a API de IA um prompt que inclui possivelmente:
    - Uma mensagem do usuário (conteúdo da pergunta ou requisição do cliente, possivelmente já convertida para texto se veio de áudio).
    - Instruções de sistema ou contexto, que podem incluir: partes relevantes dos documentos encontrados (se RAG), o histórico recente de conversa (para manter continuidade), e uma instrução do tipo "Você é um assistente que deve responder conforme XYZ...".
    - Parâmetros como temperatura (controle de criatividade), tamanho máximo da resposta, etc., pré-configurados.
    
    A IA então gera uma **resposta**. Por exemplo, o cliente pergunta "Quais são os serviços oferecidos?" e o bot (IA) retorna uma resposta elaborada listando os serviços, com base em informações presentes nos documentos ou em uma resposta padrão configurada. Esse resultado é obtido pelo n8n e repassado adiante no fluxo como a mensagem de saída do bot. *(No workflow, o nó "OpenAI Chat Model" cumpre esse papel, alimentado por contexto e consulta prévia; também há menção a um nó "Supervisor" cuja saída é utilizada – possivelmente uma etapa intermediária de processamento ou filtragem do output da IA, mas para fins de documentação consideramos apenas a resposta final.)*
    
5. **Envio da Resposta ao Cliente:** De posse da resposta gerada pela IA, o n8n agora utiliza a **Evolution API** para enviar essa mensagem de volta ao cliente no WhatsApp. O fluxo chama o nó da Evolution API (ex: "Send Message" via Evolution API) com os parâmetros adequados: número do destinatário e conteúdo da mensagem (texto, ou mesmo áudio se quisermos sintetizar voz, etc.). A Evolution API então transmite a mensagem para o WhatsApp, que a entrega ao cliente. Assim, do ponto de vista do lead, ele recebe uma resposta quase em tempo real, como se estivesse conversando com um atendente bem informado. (Tempo total típico entre mensagem do usuário e resposta do bot: poucos segundos, dependendo da latência da IA e chamadas de API.)
6. **Gravação do Histório da Resposta:** Após enviar, o workflow registra a interação no banco de dados. Assim como feito com a mensagem recebida, agora a **mensagem de resposta do bot** também é armazenada. Caso a modelagem seja uma linha por mensagem, insere-se um novo registro na tabela *chat_messages* com telefone, conteúdo, origem="bot" etc. No caso da implementação atual que junta pergunta e resposta, o registro inserido anteriormente pode já ter incluído o campo da resposta do bot. De qualquer forma, o histórico completo fica salvo: a pergunta do usuário e a resposta dada pelo sistema, vinculadas ao lead. Atualiza-se também a tabela *chats* (última atualização timestamp, etc.) e, se utilizado Redis para contexto, a resposta do bot pode ser adicionada ao cache também, para que o contexto de próximas interações conheça o que já foi dito.
7. **Exibição no Painel:** Enquanto tudo isso acontece (em questão de segundos), o **Painel Frontend** pode estar mostrando dados quase em tempo real à equipe interna. Graças ao Supabase, podemos utilizar recursos de *Subscriptions (realtime)* ou simplesmente consultas periódicas via API para atualizar a interface. Por exemplo, suponha que um operador tenha aberto a página de detalhe de um certo lead/conversa – assim que a nova mensagem chega e é registrada no banco, o painel poderia atualizar a visualização (exibindo a pergunta do cliente e a resposta do bot). Isso permite que, mesmo sem intervenção, o time veja como o bot está interagindo. No painel, a tela de **Conversas** listará talvez o lead recém-adicionado como tendo uma nova interação, e a tela de **Detalhe da Conversa** mostrará as mensagens na ordem. (Se implementarmos via supabase subscriptions, essa atualização é quase instantânea; caso contrário, um refresh manual ou polling periódica poderia ser usada).
8. **Interação Humana (Opcional):** Se o operador decide que precisa intervir (por exemplo, o bot não entendeu algo e deu uma resposta genérica, ou o cliente explicitamente pediu para falar com humano), ele pode acionar um comando no painel. Dependendo do design escolhido:
    - O operador pode **assumir o chat** diretamente: o painel permitiria enviar uma mensagem. Essa ação acionaria o **Backend**, que chamaria a Evolution API para enviar a mensagem do humano via WhatsApp. Alternativamente, poderíamos criar um novo webhook/nó no n8n para mensagens manuais: o backend faz uma requisição ao n8n, que então envia via Evolution API e marca que foi humano. Independentemente do método, a mensagem do operador também seria registrada (podendo marcar origem "admin" ou algo assim) e entregue ao cliente.
    - Outra forma de intervir é finalizar o atendimento automatizado: o operador marca o lead como necessitando contato humano, e passa a conversar com ele pelo meio tradicional (WhatsApp Web ou outro). Nesse caso, o bot poderia ser silenciado para aquele contato até que o humano termine. Esse fluxo implicaria atualizar algum status no banco (ex: **`atendimento_ia = false`** ou **`ativo = false`** em chat/cliente), que o n8n verificaria antes de responder a novas mensagens daquele cliente. De fato, poderíamos ter uma condição no workflow para não responder se um campo de "intervenção humana" estiver marcado.
    
    Ambos cenários fazem parte das tratativas de escalonamento para atendimento humano. Na versão inicial, talvez o escopo seja apenas notificar o humano e parar o bot, mas deixamos o design pronto para implementar o envio via painel numa sprint futura.
    
9. **Encerramento e Follow-up:** Após a interação (seja somente com o bot, ou com intervenção humana), o lead agora está registrado e qualificado. A conversa pode ser marcada como encerrada no painel (por ex., operador define status "Concluído" ou "Convertido"). Poderão haver automações adicionais, como:
    - Envio de um resumo da conversa por email para o time (poderia ser um node de email no final do workflow n8n).
    - Geração de tarefa de follow-up em um CRM externo.
    - Agendamento de uma mensagem futura (ex: "Olá, só passando para lembrar..." via workflow).
    
    Esses extras podem ser integrados conforme necessidade. O importante é que o sistema garantiu que nenhum lead caiu no esquecimento: todo cliente que escreveu tem seus dados salvos e visíveis, e recebeu atendimento imediato.
    

Em termos de sequência, do passo 1 ao 5 estamos essencialmente executando o **ciclo pergunta-resposta automatizado**. Os passos 6-7 são **persistência e monitoração**, e 8-9 cobrem **interações manuais e pós-atendimento**. O diagrama de sequência anexo reflete principalmente o fluxo 1-5, mostrando as chamadas entre Cliente -> WhatsApp/Evolution -> n8n -> OpenAI -> n8n -> Evolution/WhatsApp -> Cliente, e as interações do painel via banco de dados em paralelo.

*(Referência: Um template similar demonstra esse fluxo integrado, onde uma nova mensagem WhatsApp aciona o webhook, e após processamento com OpenAI e contexto do Supabase, envia-se a resposta de volta ao usuário[n8n.io](https://n8n.io/workflows/6771-whatsapp-rag-chatbot-with-supabase-gemini-25-flash-and-openai-embeddings/#:~:text=1,Retrieve%20relevant%20context%20from%20Supabase).)*

## **Navegação do Frontend (Sitemap de Telas)**

No **Mapa de Telas do Frontend** (ver **`/docs/diagrams/screens_map.png`**), definimos a estrutura básica da aplicação web (painel) que permitirá a navegação entre as principais funcionalidades. A seguir está um descritivo dessas telas e sua hierarquia de navegação esperada:


- **Login** – Tela inicial de autenticação. Se o sistema for privado, o usuário (administrador/operador) deve fazer login aqui para acessar o painel. Podemos integrar com o sistema de autenticação do Supabase (por exemplo, magic link, email e senha, etc.). Após login bem-sucedido, redireciona para o dashboard principal.
- **Dashboard (Home)** – Tela de visão geral, mostrada logo após o login. Aqui seriam apresentados alguns **indicadores-chave** e atalhos:
    - Quantidade de novos leads atendidos hoje/semana.
    - Número de conversas em andamento (não encerradas).
    - Talvez um pequeno log das interações recentes ou notificações (ex: "3 novos leads aguardando follow-up").
    - Botões de atalho para as seções principais (Leads, Conversas, etc.).
    
    O dashboard serve como um painel de controle resumido para o admin saber a situação atual do atendimento.
    
- **Leads (Lista de Clientes)** – Tela que lista todos os leads cadastrados. Poderá ser apresentada em formato de tabela ou cards:
    - Colunas como Nome, Telefone, Data do primeiro contato, Status (novo, em andamento, convertido, etc.).
    - Permite ordenar e filtrar (ex: ver apenas novos, ou buscar por nome/telefone).
    - Cada item da lista tem um link para a página de detalhes do lead.
- **Detalhe do Lead** – Ao clicar em um lead específico na lista, abre-se a página de detalhes:
    - Exibe as informações do lead (campos salvos: telefone, nome, email, etc.).
    - Mostra um histórico das conversas **com aquele lead**. Aqui essencialmente incorpora a visão de chat (pode ser uma lista de mensagens trocadas).
    - Se o sistema permitir enviar mensagem manual, poderia haver um campo de entrada de texto e botão "Enviar" para mandar uma mensagem no WhatsApp para o cliente diretamente desta tela (usando o backend). Caso contrário, ao menos poderia ter um botão "Assumir no WhatsApp" que instrui o operador a contatar via telefone.
    - Campos de atualização: possibilidade de editar dados do lead (corrigir nome, adicionar alguma observação, marcar status).
    - Ações: marcar lead como concluído/convertido, ou encaminhar para outro sistema (ex: exportar para CRM).
- **Conversas** – Alternativamente ao conceito de Leads, podemos ter uma seção centrada em **Conversas**:
    - Lista de conversas ativas ou recentes. Similar à lista de leads, mas pode listar múltiplas entradas para o mesmo lead se as conversas forem distintas (caso usemos conceito de thread).
    - Cada entrada mostra talvez o último trecho da conversa, hora da última mensagem, e o nome do lead.
    - Clicando em uma conversa, levaria para uma tela muito parecida com Detalhe do Lead, exibindo a conversa e permitindo interações. De fato, essa pode ser apenas outra forma de navegar para o mesmo detalhe, filtrando a visão nas mensagens.
- **Base de Conhecimento (Documentos)** – Tela para gerenciar os documentos usados pelo bot (caso implementemos a funcionalidade RAG via painel). Aqui o admin poderia:
    - Visualizar lista de documentos cadastrados (título, última atualização).
    - Upload de novos documentos (PDFs, textos) para a base de conhecimento.
    - Editar ou remover documentos existentes.
    - Talvez um campo de busca para testar se determinado conteúdo está sendo indexado.
    
    *Nota:* Essa seção pode não estar presente na versão inicial, se optarmos por gerenciar documentos via outros meios. Mas está prevista na estrutura caso seja necessário editar a base de conhecimento do bot facilmente.
    
- **Configurações** – Tela de configurações do sistema:
    - Gerenciar usuários do painel (convidar novos membros, alterar senhas, papéis).
    - Configurações de integração: inserir ou visualizar chaves da OpenAI, configurações da Evolution API (endereço, token), variáveis do n8n (URLs de webhook) – muitas dessas configurações podem estar em arquivos env no backend, mas uma interface pode ajudar em ajustes rápidos.
    - Parâmetros do bot: por exemplo, habilitar/desabilitar atendimento automático para novos números, mensagens de saudação personalizadas, etc.
    - Template de mensagens: configurar textos prontos (saudação inicial, mensagem de espera, encerramento).
    
    Essa tela consolida ajustes que afetam o sistema como um todo. No commit inicial, pode estar vazia ou simples, mas considerada para expansões.
    
- **Outras Telas**: Podemos ter outras páginas de apoio, como:
    - *Sobre/Help*: informações da versão do sistema, documentação para o usuário admin.
    - *Logs/Monitoramento*: uma página para ver eventos do sistema (ex: erros recentes, tentativas de envio falhas, etc.), útil para depuração.

A navegação entre essas telas é pensada de forma simples e intuitiva:

- Do Dashboard, o usuário pode clicar em métricas ou menus para ir a Leads, Conversas, etc.
- De Leads -> Detalhe do Lead -> (talvez dali possa ir para a conversa específica, embora seja a mesma página).
- Um menu principal (sidebar ou topo) disponível em todas as páginas, com opções: **Leads**, **Conversas**, **Conhecimento**, **Configurações**, e opção de Logout.

Em suma, o frontend deve fornecer ao usuário administrativo uma visão clara de **quem são os leads e o que foi conversado** e ferramentas para **agir sobre esses leads**. O sitemap define essa espinha dorsal de telas para que o desenvolvimento siga uma organização coerente.

## **Descrição dos Componentes Técnicos**

Este projeto envolve diversos componentes técnicos, cada qual com uma função específica dentro do ecossistema. Abaixo listamos esses componentes e uma breve descrição de cada um, esclarecendo seu papel:

- **n8n (Workflow Automation)**: O n8n é a plataforma de automação de fluxo de trabalho utilizada no afixgraf-leadmaster. Ele é responsável por coordenar toda a lógica de atendimento automatizado: recebe as mensagens via webhook, chama os serviços externos (IA, banco, API do WhatsApp) e decide o fluxo de conversa. O n8n oferece mais de 400 integrações e combina automação com flexibilidade de código[n8n.io](https://n8n.io/#:~:text=n8n%20is%20a%20workflow%20automation,teams%20the%20flexibility%20of), o que nos permite implementar regras personalizadas quando necessário. Resumindo, ele atua como **cérebro orquestrador**, garantindo que, para cada mensagem do cliente, todas as etapas (registro, processamento por IA, resposta) ocorram na ordem e condições certas.
- **Evolution API (Integração WhatsApp)**: A Evolution API é uma solução utilizada para conectar o nosso sistema ao WhatsApp de forma não-oficial. Ela funciona como um servidor intermediário que se conecta a uma instância do WhatsApp (geralmente via técnicas de Web WhatsApp ou bibliotecas como Baileys) e expõe uma **API HTTP** para enviar e receber mensagens. No nosso projeto, a Evolution API permite que o n8n receba mensagens entrantes (via webhooks) e envie mensagens de resposta, sem a complexidade de homologar o WhatsApp Business API oficial. Trata-se de um recurso gratuito e comunitário para integração com WhatsApp[reddit.com](https://www.reddit.com/r/n8n/comments/1m6ugx1/anyone_here_using_evolution_api_with_n8n_for/#:~:text=I%E2%80%99ve%20been%20experimenting%20with%20the,going%20through%20Meta%E2%80%99s%20official%20flow), amplamente usado em automações com n8n. No entanto, vale destacar que por ser não-oficial, existem riscos (por exemplo, possibilidade de o WhatsApp bloquear o número se uso indevido for detectado). Em termos de infraestrutura, a Evolution API geralmente é auto-hospedada (pode rodar em um contêiner Docker) e requer a leitura do QR Code de emparelhamento do WhatsApp na inicialização. Uma vez configurada, ela fornece endpoints que usamos no n8n: um webhook de recebimento de mensagens e ações para envio de mensagens, entre outras (como obter perfil, baixar mídia, etc.). Esse componente é crucial para o canal de comunicação, fazendo a ponte entre o mundo do WhatsApp e nossa lógica interna.
- **OpenAI API (Serviço de IA)**: A plataforma OpenAI fornece os modelos de linguagem usados para dar inteligência ao bot. Usamos a API do GPT (por exemplo GPT-4 ou GPT-3.5-turbo) para interpretar e gerar textos. No fluxo do n8n, a mensagem do usuário é enviada para o OpenAI junto com contexto, e a resposta retornada é o que o bot envia de volta. Também utilizamos recursos de IA para **transcrição de áudio** (serviço Whisper via OpenAI) e possivelmente para **embedding de textos** (obter vetores para busca semântica de documentos). Assim, a OpenAI API ocupa o papel de **motor de inteligência** do sistema – seja entendendo uma pergunta em linguagem natural, convertendo áudio em texto, ou procurando a melhor resposta com base em conhecimento fornecido. Vale notar que a arquitetura é flexível para acomodar outros serviços de IA se necessário (por exemplo, modelos open-source ou de outros provedores) no futuro, mas inicialmente a escolha pelo OpenAI se deve à sua eficácia e facilidade de integração.
- **Supabase (BaaS com Postgres)**: O Supabase é utilizado como o **back-end como serviço** do projeto, oferecendo uma gama de funcionalidades sobre um banco de dados PostgreSQL[docs.expo.dev](https://docs.expo.dev/guides/using-supabase/#:~:text=Using%20Supabase%20,database%2C%20user%20authentication%2C%20file). Essencialmente, toda a persistência de dados do afixgraf-leadmaster está no banco Postgres provido pelo Supabase. A razão de escolher Supabase é que ele simplifica muito a interação com o banco, fornecendo:
    - **API REST automática**: para cada tabela ou função definida, podemos acessar via requisições HTTP (usando a biblioteca supabase-js no frontend, por exemplo). Isso permitiu, por exemplo, que integrássemos o n8n rapidamente com o banco usando o nó genérico do Supabase (em vez de precisar configurar um servidor para isso).
    - **Autenticação e Autorização**: caso necessário, o Supabase gerencia usuários e regras de acesso (RLS) facilmente, o que podemos aproveitar para o painel.
    - **Realtime**: Supabase tem um recurso de enviar atualizações em tempo real para o frontend via WebSockets quando dados mudam, útil para atualizar o painel com novas mensagens sem precisar de polling constante.
    - **Armazenamento de Arquivos**: embora não citado antes, o Supabase também oferece storage de arquivos; poderíamos usar para salvar mídias (áudios, imagens enviados pelos leads) caso desejarmos armazenar fora do WhatsApp.
    - **Funcionalidades de cloud**: hospedagem serverless de funções (Edge Functions), logs, dashboard web do banco, etc., que agilizam o desenvolvimento.
    
    Em resumo, o Supabase/Postgres é o **repositório central de dados** – tudo que o bot faz (cadastrar lead, salvar conversa, armazenar conhecimento) acaba consolidado no banco. E o Supabase nos dá as ferramentas para acessar esses dados de forma segura e rápida, tanto do lado do n8n/backend quanto direto do frontend.
    
- **PostgreSQL**: Digno de nota separado, o PostgreSQL é o sistema de gerenciamento de banco de dados relacional subjacente ao Supabase. Toda a estrutura de tabelas descrita (leads, chats, mensagens, documentos) é implementada em Postgres. A escolha do Postgres traz robustez, suporte a SQL rico, e extensão para dados JSON e vetoriais (essencial para embeddings de IA). Além disso, Postgres garante confiabilidade para armazenar nossos dados de clientes. Como o Supabase é essencialmente um *wrapper* do Postgres, desenvolvedores podem interagir diretamente com o banco via SQL quando necessário (usando o cliente Postgres ou via console do Supabase). Por exemplo, para análises avançadas ou queries complexas, podemos escrever *views* ou *stored procedures* no Postgres e chamá-las via Supabase. A capacidade transacional e de integridade referencial do Postgres assegura que nossos dados de leads e mensagens permanecem consistentes.
- **Backend (API e Lógica de Negócio)**: Além do n8n, foi estruturado um backend personalizado (provavelmente em Node.js com Express ou NestJS) dentro do repositório (pasta **`/backend`**). Esse serviço backend complementa o n8n em algumas áreas:
    - Fornece **APIs REST** específicas para o frontend consumir, por exemplo: uma rota para obter listagem de leads com campos agregados, ou uma rota para o painel solicitar que o bot pare de responder a um certo lead (atualizando um flag no banco).
    - Implementa lógica que não esteja confortável de fazer no n8n. Embora o n8n seja poderoso, às vezes regras de negócio complexas ou integrações customizadas podem ser mais fáceis de manter em um código de backend tradicional. Por exemplo, consolidar dados de múltiplas tabelas e enviar em uma única resposta ao frontend, ou integrar com outro sistema externo (como um CRM) de forma mais elaborada.
    - Cuida da **autenticação/autorização** do painel se decidirmos não depender totalmente do Supabase para isso. Pode haver endpoints protegidos que verificam sessão JWT dos usuários do painel e retornam dados filtrados.
    - Possivelmente orquestra o envio de mensagens manuais: quando o operador envia algo pelo painel, o frontend chama o backend, que então decide usar a Evolution API para entregar a mensagem e atualizar o banco (podemos integrar isso diretamente no n8n também, mas ter no backend dá mais controle sobre validações e registro de auditoria).
    
    A estrutura inicial do backend (com pastas para **`routes`**, **`controllers`**, **`models`**) sugere uma organização MVC simples. Não há muita lógica implementada ainda, mas os arquivos vazios servem como ponto de partida para futuras sprints. Por exemplo, poderemos ter em **`routes/leadRoutes.js`** rotas como GET **`/leads`**, POST **`/leads/:id/message`**, etc.; em **`models/Lead.js`** uma definição ORM/ODM se usado; e os **`controllers`** implementando as funções chamadas por essas rotas.
    
- **Frontend (Painel Web)**: O frontend é uma aplicação web (provavelmente usando React com Next.js, dado a estrutura de diretórios com **`/pages`** e **`/components`**). Ele é responsável pela experiência do usuário administrador:
    - **Componentes (`/frontend/components`)**: contém componentes reutilizáveis da UI (por exemplo, componente de tabela de leads, componente de chat/mensagem, input de formulário, etc.).
    - **Páginas (`/frontend/pages`)**: define as páginas/rotas do painel. Em Next.js, cada arquivo em **`pages`** seria uma rota. Teremos por exemplo **`pages/index.js`** (dashboard), **`pages/leads/index.js`** (lista de leads), **`pages/leads/[id].js`** (detalhe do lead), etc. Estas páginas compõem as telas descritas no item anterior.
    - **Serviços (`/frontend/services`)**: aqui ficarão módulos para integração com APIs – por exemplo, um **`api.js`** ou **`supabaseClient.js`** que configura a conexão com Supabase, funções para chamar o backend (fetch/axios para nossas rotas Express), ou até contextos para gerenciar estado global (como contexto de autenticação).
    
    O front se comunica principalmente com o backend e/ou direto com Supabase. Em muitos casos, poderemos chamar o Supabase diretamente do front (por ex., usar o cliente supabase-js para obter a lista de leads com **`supabase.from('dados_cliente').select(...)`**), especialmente para operações simples. Entretanto, ainda manteremos chamadas ao backend para operações que exigem lógica extra ou precisam ser protegidas de forma diferente.
    
    Do ponto de vista técnico, este frontend provavelmente será configurado para uma fácil implantação (poderia ser hospedado no Vercel, por exemplo, se Next.js, ou em static hosting se SPA). Na estrutura inicial, não há código implementado, mas já separamoss os diretórios para ir desenvolvendo componente por componente nas próximas sprints.
    

Em resumo, cada componente técnico – **n8n**, **Evolution API**, **OpenAI**, **Supabase/Postgres**, **Backend**, **Frontend** – desempenha um papel claro e integra-se aos demais de maneira coesa. Essa separação também facilita a manutenção e evolução do projeto: podemos trabalhar em melhorias do fluxo no n8n separadamente da interface do painel, ou trocar o provedor de IA sem afetar o restante, etc. Abaixo, resumimos a estrutura de diretórios que reflete essa arquitetura e preparação do repositório.

## **Estrutura de Diretórios do Repositório**

A seguir está a estrutura inicial do repositório **`afixgraf-leadmaster`**, incluindo diretórios para código-fonte do backend, frontend, documentação e diagramas. Esta organização visa separar as preocupações de cada camada e facilitar a localização de arquivos durante o desenvolvimento:

```
afixgraf-leadmaster/
├── README.md               # Documentação principal (visão geral, arquitetura, etc. - conforme descrito acima)
├── backend/                # Backend do sistema (API e lógica de negócio)
│   ├── src/                # Código-fonte (implementações auxiliares, utilitários)
│   ├── routes/             # Definições das rotas/endpoints da API
│   ├── controllers/        # Lógica das rotas (controladores manipulando requisições e respostas)
│   └── models/             # Definição dos modelos de dados/ORM (ex: esquemas, classes que representam tabelas)
├── frontend/               # Frontend (painel web)
│   ├── components/         # Componentes reutilizáveis da interface (botões, formulários, lista de mensagens, etc.)
│   ├── pages/              # Páginas (rotas) do app frontend, cada uma correspondente a uma tela/sessão
│   └── services/           # Serviços de integração (ex: cliente Supabase, funções de chamada à API backend)
├── docs/                   # Documentação adicional do projeto
│   ├── diagrams/           # Diagramas UML e de arquitetura do sistema
│   │   ├── architecture.png        # Diagrama de Arquitetura Macro do sistema
│   │   ├── component_diagram.png   # Diagrama de Componentes (opcional, detalhando módulos internos e integrações)
│   │   ├── use_case_diagram.png    # Diagrama de Casos de Uso (atores e ações principais)
│   │   ├── class_diagram.png       # Diagrama de Classes/Dados (modelo de dados, tabelas e relacionamentos)
│   │   ├── sequence_diagram.png    # Diagrama de Sequência (fluxo operacional entre cliente, sistema e painel)
│   │   └── screens_map.png         # Mapa de Telas do frontend (sitemap da aplicação web)
│   └── README.md           # (Opcional) Documentação detalhada em múltiplos arquivos, se necessário no futuro
└── .gitignore              # Arquivos e pastas a serem ignorados pelo Git (ex: node_modules, .env, builds, etc.)

```

**Observações sobre a estrutura:**

- Todos os arquivos mencionados (incluindo os diagramas e o README) farão parte do **commit inicial**, garantindo que o repositório já nasça documentado e com diretrizes para o desenvolvimento.
- Nas pastas vazias do backend/frontend foram adicionados arquivos placeholder (por exemplo, um simples README.md ou arquivo **`.gitkeep`**) apenas para o Git versionar essas pastas desde o início, já que diretórios vazios não são comitados por padrão. Dessa forma, a estrutura fica explícita mesmo antes de conter código.
- Os nomes dos diagramas na pasta **`diagrams`** estão em inglês para facilidade, mas foram descritos acima em português para clareza. Esses diagramas devem ser atualizados conforme o projeto evoluir. Por ora, servem para comunicar a visão arquitetural e de design do sistema conforme planejado nesta fase inicial.
- O arquivo principal **`README.md`** (no root) é exatamente este documento estruturado com visão geral, assim qualquer desenvolvedor ou interessado que acessar o repositório no GitHub terá imediatamente acesso a toda a informação necessária para entender o propósito e arquitetura do projeto.
- Conforme o projeto avançar, a pasta **`/backend`** será preenchida com a implementação da API (por exemplo, poderíamos adicionar imediatamente uma estrutura básica de um projeto Node.js, com um **`package.json`**, talvez um boilerplate de Express ou NestJS). Similarmente, o **`/frontend`** pode ser iniciado com um boilerplate de Next.js ou Create React App. Nesta entrega inicial, o foco é a documentação e organização – o código virá nas próximas sprints, guiado por essa documentação.
- O projeto está configurado para ser **open-source (público)** neste primeiro momento, permitindo compartilhamento do conhecimento e eventualmente colaboração externa. Caso necessário, futuramente o repositório poderá ser tornado privado sem afetar a estrutura interna.

Em conclusão, o commit inicial do **`afixgraf-leadmaster`** fornecerá uma base sólida tanto em **documentação** quanto em **estrutura de pastas/código**, facilitando a comunicação da visão do projeto e servindo de ponto de partida organizado para as próximas etapas de desenvolvimento. Com todas essas peças no lugar, a equipe poderá avançar para as sprints de implementação com um entendimento claro do objetivo e do caminho arquitetural traçado.

  
