// app.js
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const crypto = require('crypto');

function generateSecretKey(length) {
    return crypto.randomBytes(length).toString('hex');
}

// Générer une clé secrète de 32 caractères (256 bits)
const secretKey = generateSecretKey(16);
console.log('Clé secrète générée : ', secretKey);

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

// Configurer le moteur de modèles Pug
app.set('view engine', 'pug');

// Servir le répertoire statique public
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const index = require('./routes/index.js');
const login = require('./routes/login.js');
const register = require('./routes/register.js');

app.use(index);
app.use(login);
app.use(register);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
