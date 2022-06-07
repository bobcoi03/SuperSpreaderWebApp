const express = require('express');
const router = express.Router();
const path = require('path');

exports.game = (req, res) => {
	res.sendFile(path.join(__dirname, '../public/templates', 'game.html'));
}

exports.getHighScore = (req, res) => {
    res.send(req.session.highScore);
    res.end();
}

exports.postHighScore = (req,res) => {
	// logic to post high score based on current score
	if (req.session.highScore == undefined) {
		req.session.highScore = req.body.currentScore;
	} else if (req.session.highScore < req.body.currentScore) {
		req.session.highScore = req.body.currentScore;
	}
	console.log(`post req ${req.session.highScore}`);
}