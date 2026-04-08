const authService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.authService = authService;
    }

    async register(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const user = await this.authService.register(username, password);
            return res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const result = await this.authService.login(username, password);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }
}

module.exports = new AuthController(); // Singleton instance
