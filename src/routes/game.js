const express = require('express');
const router = express.Router();
const path = require('path');

exports.game = (req, res) => {
	res.sendFile(path.join(__dirname, '../public/templates', 'game.html'));
}