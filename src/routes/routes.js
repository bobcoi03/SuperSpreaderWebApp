const express = require('express');
const router = express.Router();
const { game } = require('./game.js');

// GET Requests

router.get('/', game);

module.exports = router;