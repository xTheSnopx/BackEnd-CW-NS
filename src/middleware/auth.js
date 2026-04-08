const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

const authMiddleware = async (req, res, next) => {
    // 1. Check Authorization Header for Token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ error: 'Malformed token' });
    }

    try {
        // 2. Verify Token with JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username }

        // 3. Optional: Verify Plan (Subscription Validity)
        const user = await userRepository.findByUsername(decoded.username);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const now = new Date();
        if (user.plan_expires_at && new Date(user.plan_expires_at) < now) {
            return res.status(403).json({ error: 'Su plan ha expirado. Por favor, renueve para continuar.' });
        }

        next(); // Proceed to endpoint
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
