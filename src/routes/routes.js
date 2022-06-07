const express = require('express');
const router = express.Router();
const { game, postHighScore, getHighScore } = require('./game.js');

// GET Requests

router.get('/', game);

router.post('/highScore', postHighScore);

router.get('/highScore', getHighScore);

module.exports = router;