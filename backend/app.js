require('dotenv').config();
const express = require('express');
const atendimentoController = require('./controllers/atendimentoController');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar JSON
app.use(express.json());

// Rotas
app.post('/assumir-atendimento', atendimentoController.assumirAtendimento);
app.post('/enviar-mensagem', atendimentoController.enviarMensagem);
app.post('/reativar-atendimento', atendimentoController.reativarAtendimento);

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
