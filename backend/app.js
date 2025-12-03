require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const atendimentoController = require('./controllers/atendimentoController');
const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

const leadsController = require('./controllers/leadsController');

// Rotas Públicas
app.post('/login', (req, res) => authController.login(req, res));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rotas Protegidas
app.get('/leads', authMiddleware, leadsController.listLeads);
app.get('/leads/:telefone/messages', authMiddleware, leadsController.getMessages);

app.post('/assumir-atendimento', authMiddleware, atendimentoController.assumirAtendimento);
app.post('/enviar-mensagem', authMiddleware, atendimentoController.enviarMensagem);
app.post('/reativar-atendimento', authMiddleware, atendimentoController.reativarAtendimento);
app.post('/pausar-atendimento', authMiddleware, atendimentoController.pausarAtendimento);

// Inicialização do servidor
app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
});
