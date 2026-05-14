"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = exports.getAllPlayers = exports.updatePlayerBalance = exports.createPlayer = void 0;
const db_1 = require("../db");
const createPlayer = async (req, res) => {
    const { username, initialPassword } = req.body;
    const result = await (0, db_1.query)('INSERT INTO users (username, password, plain_password, balance) VALUES ($1, $2, $3, 0) RETURNING id, username', [username, initialPassword, initialPassword]);
    res.status(201).json(result.rows[0]);
};
exports.createPlayer = createPlayer;
const updatePlayerBalance = async (req, res) => {
    const { userId, amount, type } = req.body;
    const adjustment = type === 'load' ? amount : -amount;
    await (0, db_1.query)('UPDATE users SET balance = balance + $1 WHERE id = $2', [adjustment, userId]);
    await (0, db_1.query)('INSERT INTO transactions (user_id, amount, type, description) VALUES ($1, $2, $3, \'Admin adjustment\')', [userId, amount, type]);
    res.json({ message: 'Updated' });
};
exports.updatePlayerBalance = updatePlayerBalance;
const getAllPlayers = async (req, res) => {
    const result = await (0, db_1.query)('SELECT * FROM users WHERE is_admin = FALSE');
    res.json(result.rows);
};
exports.getAllPlayers = getAllPlayers;
const getTransactions = async (req, res) => {
    const result = await (0, db_1.query)('SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
    res.json(result.rows);
};
exports.getTransactions = getTransactions;
