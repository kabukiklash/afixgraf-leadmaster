const leadsService = require('../services/leadsService');
const logger = require('../utils/logger');

class LeadsController {
    async listLeads(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const search = req.query.search;

            const result = await leadsService.getLeads(page, limit, status, search);
            return res.json(result);
        } catch (error) {
            logger.error(`Leads Controller Error: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao buscar leads' });
        }
    }

    async getMessages(req, res) {
        try {
            const { telefone } = req.params;
            if (!telefone) {
                return res.status(400).json({ error: 'Telefone é obrigatório' });
            }

            const messages = await leadsService.getLeadMessages(telefone);
            return res.json(messages);
        } catch (error) {
            logger.error(`Messages Controller Error: ${error.message}`);
            return res.status(500).json({ error: 'Erro ao buscar mensagens' });
        }
    }
}

module.exports = new LeadsController();
