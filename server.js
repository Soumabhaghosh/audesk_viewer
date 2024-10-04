const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { PORT } = require('./config.js');

let app = express();
app.use(session({
    secret: 'yourSecretKey',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Save uninitialized sessions
    cookie: {
        maxAge: 3600000*24, // 1 day in milliseconds
        httpOnly:true
    }
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));
app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
