const express = require('express');
const { authenticateToken } = require('../auth');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

router.post('/', authenticateToken, sendMessage);
router.get('/', authenticateToken, getMessages);

module.exports = router;
