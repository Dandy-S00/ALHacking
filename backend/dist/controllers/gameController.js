"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logGameResult = exports.handleVault = void 0;
const db_1 = require("../db");
const handleVault = async (req, res) => {
    const { amount, action } = req.body;
    if (action === 'deposit') {
        await (0, db_1.query)('UPDATE users SET balance = balance - $1, vault_balance = vault_balance + $1 WHERE id = $2', [amount, req.user.id]);
    }
    else {
        await (0, db_1.query)('UPDATE users SET balance = balance + $1, vault_balance = vault_balance - $1 WHERE id = $2', [amount, req.user.id]);
    }
    res.json({ message: 'Success' });
};
exports.handleVault = handleVault;
const logGameResult = async (req, res) => {
    const { gameType, betAmount, winAmount } = req.body;
    await (0, db_1.query)('INSERT INTO game_sessions (user_id, game_type, bet_amount, win_amount) VALUES ($1, $2, $3, $4)', [req.user.id, gameType, betAmount, winAmount]);
    await (0, db_1.query)('UPDATE users SET balance = balance + $1 WHERE id = $2', [winAmount - betAmount, req.user.id]);
    res.json({ message: 'Logged' });
};
exports.logGameResult = logGameResult;
