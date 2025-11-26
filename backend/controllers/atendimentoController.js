const atendimentoService = require('../services/atendimentoService');

const atendimentoController = {
    async assumirAtendimento(req, res) {
        try {
            const { telefone, responsavel } = req.body;

            if (!telefone || !responsavel) {
                return res.status(400).json({ error: 'Telefone e responsável são obrigatórios.' });
            }

            const result = await atendimentoService.assumirAtendimento(telefone, responsavel);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async enviarMensagem(req, res) {
        try {
            const { telefone, mensagem, responsavel } = req.body;

            if (!telefone || !mensagem || !responsavel) {
                return res.status(400).json({ error: 'Telefone, mensagem e responsável são obrigatórios.' });
            }

            const result = await atendimentoService.enviarMensagem(telefone, mensagem, responsavel);
            return res.status(200).json(result);
        } catch (error) {
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
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = atendimentoController;
