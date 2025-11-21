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

  
