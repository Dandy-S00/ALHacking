"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken, auth_1.isAdmin);
router.post('/players', adminController_1.createPlayer);
router.post('/balance', adminController_1.updatePlayerBalance);
router.get('/players', adminController_1.getAllPlayers);
router.get('/transactions', adminController_1.getTransactions);
exports.default = router;
