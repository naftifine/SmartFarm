const bcrypt = require('bcrypt');
const { getDB } = require('../config/db');

async function signup({ username, password }) {
    const db = getDB();
    const users = db.collection('users');

    const existingUser = await users.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };

    const result = await users.insertOne(newUser);
    return { id: result.insertedId, username };
}

async function login({ username, password }) {
    const db = getDB();
    const users = db.collection('users');

    const user = await users.findOne({ username });
    if (!user) {
        throw new Error('Invalid username or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid username or password');
    }

    return true;
}

module.exports = { signup, login };
