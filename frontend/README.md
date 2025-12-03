# Frontend Painel Vendedoras - Sprint 2

Painel administrativo e de atendimento para vendedoras, construído com React, Vite, TypeScript e Tailwind CSS.

## Pré-requisitos
- Node.js 18+
- Backend rodando na porta 3000 (ou configurado via VITE_API_URL)

## Instalação

1. Entre na pasta frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o ambiente (opcional):
   - Crie um arquivo `.env` se precisar alterar a URL da API:
     ```
     VITE_API_URL=http://localhost:3000
     ```

## Execução

- **Desenvolvimento:**
  ```bash
  npm run dev
  ```
  O app estará disponível em `http://localhost:5173`.

- **Build de Produção:**
  ```bash
  npm run build
  ```

## Funcionalidades

- **Login:** Autenticação via email/senha.
- **Lista de Leads:** Visualização de leads com status (IA, Humano, Pausado) e busca.
- **Chat:** Interface para visualizar histórico e enviar mensagens.
- **Ações:** Botões para Assumir, Pausar e Reativar atendimento (IA).
- **Dashboard:** Visão geral de métricas (Placeholder).

## Estrutura
- `src/pages`: Componentes de página (Login, LeadsList, AdminDashboard).
- `src/components`: Componentes reutilizáveis (Layout, ChatWindow).
- `src/context`: Contexto de autenticação.
- `src/services`: Configuração do Axios.
