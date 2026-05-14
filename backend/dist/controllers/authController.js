"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.changePassword = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const login = async (req, res) => {
    const { username, password } = req.body;
    const result = await (0, db_1.query)('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user || password !== user.plain_password)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, isAdmin: user.is_admin }, process.env.JWT_SECRET || 'lone_star_secret');
    res.json({ token, user: { id: user.id, username: user.username, balance: user.balance, vaultBalance: user.vault_balance, isAdmin: user.is_admin } });
};
exports.login = login;
const changePassword = async (req, res) => {
    await (0, db_1.query)('UPDATE users SET plain_password = $1, password_changed_by_user = TRUE WHERE id = $2', [req.body.newPassword, req.user.id]);
    res.json({ message: 'Updated' });
};
exports.changePassword = changePassword;
const getMe = async (req, res) => {
    const result = await (0, db_1.query)('SELECT id, username, balance, vault_balance, is_admin FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
};
exports.getMe = getMe;
