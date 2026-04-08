const express = require('express');
const router = express.Router();
const dataController = require('../controllers/DataController');
const authMiddleware = require('../middleware/auth');

// Protected Data Endpoints
router.get('/history', authMiddleware, (req, res) => dataController.getHistory(req, res));
router.get('/rankings', authMiddleware, (req, res) => dataController.getRankings(req, res));
router.get('/clan-gains', authMiddleware, (req, res) => dataController.getClanGains(req, res));

module.exports = router;
