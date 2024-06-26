const express = require('express');
const session = require('express-session');
const http = require('http');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const connection = require('./database.js');


const gameStartHandler = (socket) => {
    console.log('Un client a rejoint la partie');
    socket.emit('gameStart'); // émettre l'événement sur socket plutôt que sur io
};

const joinGameHandler = (socket, gameId, playerId) => {
    // Vérifier s'il existe déjà une entrée dans la table des parties en cours pour cette partie
    const sql = 'SELECT * FROM partie WHERE id = ?';
    console.log("je suis bien dans joingame");
    connection.query(sql, [gameId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de la partie en cours :', err);
            return;
        }
        // Une entrée trouvée, mettre à jour l'entrée avec le joueur actuel en tant que joueur 2
        const sql = 'UPDATE partie SET joueur2 = ? WHERE id = ?';
        connection.query(sql, [playerId, gameId], (err, result3) => {
            if (err) {
                console.error('Erreur lors de la mise à jour de la partie en cours :', err);
                return;
            }
            console.log('Partie en cours mise à jour avec succès.');
            socket.emit('gameStart');
        });
    });
};


io.on('connection', (socket) => {
    console.log('Un client est connecté');

    socket.emit('welcome', 'Bienvenue sur le serveur Socket.io');
    //socket.emit('gameStart');

    socket.on('newUser', (username) => {
        console.log('Nouvel utilisateur :', username);
        // Insérer l'username dans la base de données
        const sql = 'INSERT INTO utilisateur (username) VALUES (?)';
        connection.query(sql, [username], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion dans la base de données :', err);
                res.status(500).send('Erreur serveur');
                return;
            }
            console.log('Nom d\'utilisateur inséré avec succès dans la base de données.');
        });
    });

    socket.on('newMessage', (data) => {
        const {message, joueur1, joueur2} = data;
        // Insérer un message dans la base de données
        const sql = 'INSERT INTO message (message, joueur1, joueur2, date) VALUES (?, ?, ?, NOW())';
        connection.query(sql, [message, joueur1, joueur2], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion dans la base de données :', err);
                return;
            }
            console.log('Message inséré avec succès dans la base de données.');
            io.emit('messageReceived', {
                message: data.message,
                date: new Date().toISOString(),
                joueur1: data.joueur1,
                joueur2: data.joueur2
            });
        });
    });
    socket.on('joinGame', (gameId, playerId) => {
        joinGameHandler(socket, gameId, playerId);
    });

    /*socket.on('joinGame', (gameId, playerId) => {
        // Vérifier s'il existe déjà une entrée dans la table des parties en cours pour cette partie
        const sql = 'SELECT * FROM partie WHERE id = ?';
        console.log("je suis bien dans joingame");
        connection.query(sql, [gameId], (err, result) => {
            if (err) {
                console.error('Erreur lors de la vérification de la partie en cours :', err);
                return;
            }
            // Une entrée trouvée, mettre à jour l'entrée avec le joueur actuel en tant que joueur 2
            const sql = 'UPDATE partie SET joueur2 = ? WHERE id = ?';
            connection.query(sql, [playerId, gameId], (err, result3) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour de la partie en cours :', err);
                    return;
                }
                console.log('Partie en cours mise à jour avec succès.');

                io.emit('gameStart');
                console.log(result[0].joueur1);
                // Émettre un événement 'gameStart' vers les deux joueurs pour démarrer la partie
                const player1Socket = io.sockets.sockets.get(result[0].joueur1);
                const player2Socket = io.sockets.sockets.get(playerId);
                player1Socket.emit('gameStart');
                player2Socket.emit('gameStart');
            });
        });
    });*/

    socket.on('disconnect', () => {
        console.log('Un client s\'est déconnecté');
    });
});

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
const jeu = require('./routes/jeu.js');
const message = require('./routes/message.js');
const regles = require('./routes/regles.js');
const parcourir = require('./routes/parcourir.js');
const compte = require('./routes/compte.js');
const dessin = require('./routes/dessin.js');
const salon = require('./routes/salon.js')

app.use(index);
app.use(login);
app.use(register);
app.use(jeu);
app.use(message);
app.use(regles);
app.use(parcourir);
app.use(compte);
app.use(dessin);
app.use(salon);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
