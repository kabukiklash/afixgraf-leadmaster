const atendimentoService = require('../services/atendimentoService');
const logger = require('../utils/logger');

const atendimentoController = {
    async assumirAtendimento(req, res) {
        try {
            const { telefone } = req.body;
            const user = req.user; // Injetado pelo middleware

            if (!telefone) {
                return res.status(400).json({ error: 'Telefone é obrigatório.' });
            }

            const result = await atendimentoService.assumirAtendimento(telefone, user);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Assumir Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    },

    async enviarMensagem(req, res) {
        try {
            const { telefone, mensagem } = req.body;
            const user = req.user;

            if (!telefone || !mensagem) {
                return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios.' });
            }

            const result = await atendimentoService.enviarMensagem(telefone, mensagem, user);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Enviar Mensagem Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    },

    async reativarAtendimento(req, res) {
        try {
            const { telefone } = req.body;

            if (!telefone) {
                return res.status(400).json({ error: 'Telefone é obrigatório.' });
            }

            const result = await atendimentoService.reativarAtendimento(telefone);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Reativar Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    },

    async pausarAtendimento(req, res) {
        try {
            const { telefone } = req.body;
            const user = req.user;

            if (!telefone) {
                return res.status(400).json({ error: 'Telefone é obrigatório.' });
            }

            const result = await atendimentoService.pausarAtendimento(telefone, user);
            return res.status(200).json(result);
        } catch (error) {
            logger.error(`Pausar Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = atendimentoController;
