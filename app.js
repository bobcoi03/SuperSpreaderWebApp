const express = require('express');
const app = express();
const PORT_NUMBER = process.env.PORT || 5000;
const router = require('./src/routes/routes.js');
const path = require('path');
const body_parser = require('body-parser');
// const sequelizer = require('./src/utils/database.js');

const session = require('express-session');
app.use(session({
	secret: 'super fucking secret',
	resave: true,
	saveUninitialized: true,
}));

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

app.use(express.static(__dirname + '/src/public'));

app.use(router);

// sequelizer.sync();

app.listen(PORT_NUMBER, '0.0.0.0', () => {
  console.log(`server started at port ${PORT_NUMBER}`);
})