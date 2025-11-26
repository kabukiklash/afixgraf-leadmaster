# Backend de Atendimento

Este projeto fornece uma API para gerenciar o atendimento, permitindo assumir conversas, enviar mensagens e reativar o atendimento via IA.

## Estrutura do Projeto

```
backend/
├── app.js                      # Ponto de entrada da aplicação
├── controllers/
│   └── atendimentoController.js # Controladores das rotas
├── services/
│   └── atendimentoService.js    # Lógica de negócios e integração com Supabase/n8n
├── db/
│   └── supabaseClient.js        # Configuração do cliente Supabase
├── database.sql                 # Scripts SQL para criação das tabelas
└── .env.example                 # Exemplo de variáveis de ambiente
```

## Configuração

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Preencha as variáveis no arquivo `.env`:
     - `SUPABASE_URL`: URL do seu projeto Supabase.
     - `SUPABASE_SERVICE_KEY`: Chave de serviço (service_role) do Supabase.
     - `N8N_WEBHOOK_URL`: URL do webhook do n8n para envio de mensagens.

3. **Configurar Banco de Dados:**
   - Execute o script `database.sql` no SQL Editor do seu projeto Supabase para criar as tabelas necessárias.

## Execução

- **Modo de desenvolvimento (com hot-reload):**
  ```bash
  npm run dev
  ```

- **Modo de produção:**
  ```bash
  npm start
  ```

## Endpoints

### 1. Assumir Atendimento
**POST** `/assumir-atendimento`
- **Body:**
  ```json
  {
    "telefone": "5511999999999",
    "responsavel": "Nome do Atendente"
  }
  ```

### 2. Enviar Mensagem
**POST** `/enviar-mensagem`
- **Body:**
  ```json
  {
    "telefone": "5511999999999",
    "mensagem": "Olá, como posso ajudar?",
    "responsavel": "Nome do Atendente"
  }
  ```

### 3. Reativar Atendimento (IA)
**POST** `/reativar-atendimento`
- **Body:**
  ```json
  {
    "telefone": "5511999999999"
  }
  ```
