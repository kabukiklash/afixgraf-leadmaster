# Backend de Atendimento - Sprint 2

Este projeto fornece uma API para gerenciar o atendimento, permitindo assumir conversas, enviar mensagens e reativar o atendimento via IA.

## Estrutura do Projeto

```
backend/
├── app.js                      # Ponto de entrada da aplicação
├── controllers/
│   ├── atendimentoController.js # Controladores de ações (assumir, pausar, enviar)
│   ├── authController.js        # Controlador de autenticação
│   └── leadsController.js       # Controlador de listagem de leads
├── services/
│   ├── atendimentoService.js    # Lógica de negócios de atendimento
│   ├── authService.js           # Lógica de autenticação
│   └── leadsService.js          # Lógica de busca de leads
├── middleware/
│   └── authMiddleware.js        # Middleware de proteção de rotas (JWT)
├── utils/
│   └── logger.js                # Utilitário de log
├── db/
│   └── supabaseClient.js        # Configuração do cliente Supabase
├── database.sql                 # Scripts SQL iniciais
└── update_db_sprint2.sql        # Scripts SQL da Sprint 2
```

## Configuração

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env` e preencha:
     - `SUPABASE_URL`: URL do seu projeto Supabase.
     - `SUPABASE_SERVICE_KEY`: Chave de serviço (service_role) do Supabase.
     - `N8N_WEBHOOK_URL`: URL do webhook do n8n.
     - `JWT_SECRET`: Segredo para assinatura de tokens (ex: uma string aleatória longa).

3. **Atualizar Banco de Dados:**
   - Execute o script `update_db_sprint2.sql` no SQL Editor do Supabase para adicionar a coluna `password_hash` à tabela `vendedoras`.

## Execução

- **Modo de desenvolvimento:**
  ```bash
  npm run dev
  ```

- **Modo de produção:**
  ```bash
  npm start
  ```

## Endpoints

### Autenticação
- **POST** `/login`: `{ "email": "...", "password": "..." }` -> Retorna Token JWT.

### Leads (Protegido)
- **GET** `/leads`: Lista leads paginados. Query params: `page`, `limit`, `search`.
- **GET** `/leads/:telefone/messages`: Histórico de mensagens.

### Ações (Protegido)
- **POST** `/assumir-atendimento`: `{ "telefone": "..." }`
- **POST** `/pausar-atendimento`: `{ "telefone": "..." }`
- **POST** `/reativar-atendimento`: `{ "telefone": "..." }`
- **POST** `/enviar-mensagem`: `{ "telefone": "...", "mensagem": "..." }`

## Testes
Para rodar os testes (se configurados):
```bash
npm test
```
