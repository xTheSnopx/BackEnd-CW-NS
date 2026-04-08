const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

class AuthService {
    constructor() {
        this.userRepository = userRepository;
    }

    async register(username, password) {
        // 1. Check if user already exists
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create defaults (e.g., 3 days of trial plan)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 3); // 3 days trial

        const newUser = {
            username,
            password: hashedPassword,
            plan_expires_at: expirationDate.toISOString()
        };

        // 4. Save to Repository
        return await this.userRepository.create(newUser);
    }

    async login(username, password) {
        // 1. Find User by name
        const user = await this.userRepository.findByUsername(username);
        if (!user) throw new Error('Invalid credentials');

        // 2. Comapre password hashes
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        // 3. Generate JWT Access token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { token, user: { username: user.username, plan_expires_at: user.plan_expires_at } };
    }

    async verifyPlan(id) {
        const user = await this.userRepository.findByUsername(id); // Usually avoid directly looking up like this but placeholder
        const expiration = new Date(user.plan_expires_at);
        return expiration > new Date(); // True if greater (still active)
    }
}

module.exports = new AuthService(); // Singleton instance
