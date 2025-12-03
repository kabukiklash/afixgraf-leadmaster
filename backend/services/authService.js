const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { supabase } = require('../db/supabaseClient');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Fallback for dev, should be in env
const JWT_EXPIRES_IN = '1h';

class AuthService {
    async login(email, password) {
        try {
            // 1. Buscar usuário no banco (tabela vendedoras)
            const { data: user, error } = await supabase
                .from('vendedoras')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                logger.warn(`Login failed: User not found for email ${email}`);
                throw new Error('Credenciais inválidas');
            }

            // 2. Verificar senha
            // Nota: Assumindo que a tabela tem um campo password_hash
            // Se não tiver, precisaremos criar ou usar um mock temporário se a tabela estiver vazia/sem senha
            if (!user.password_hash) {
                logger.warn(`User ${email} has no password hash set.`);
                throw new Error('Erro de configuração de conta');
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                logger.warn(`Login failed: Invalid password for email ${email}`);
                throw new Error('Credenciais inválidas');
            }

            // 3. Gerar Token
            const token = jwt.sign(
                { id: user.id, email: user.email, nome: user.nome },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return {
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            };

        } catch (error) {
            logger.error(`Auth Service Error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AuthService();
