const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const result = await authService.login(email, password);
            return res.json(result);

        } catch (error) {
            if (error.message === 'Credenciais inválidas') {
                return res.status(401).json({ error: error.message });
            }
            logger.error(`Login Controller Error: ${error.message}`);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = new AuthController();
