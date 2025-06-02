const authService = require('../services/authService');

async function signup(req, res) {
    try {
        const user = await authService.signup(req.body);
        res.status(201).json({ message: 'User created', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function login(req, res) {
    try {
        const success = await authService.login(req.body);
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(401).json({ error: "Wrong username or password" });
    }
}

async function logout(req, res) {
    try {
        // Since we don't have session management in this simple app,
        // we just return a success response
        // In a real app with sessions/tokens, we would invalidate them here
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { signup, login, logout };
