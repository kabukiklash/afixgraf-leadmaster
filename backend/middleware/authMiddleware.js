const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (!parts.length === 2) {
        return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.warn(`Token verification failed: ${err.message}`);
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.user = decoded;
        return next();
    });
};

module.exports = authMiddleware;
