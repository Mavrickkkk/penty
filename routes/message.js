const express = require('express');
const connection = require("../database");
const router = express.Router();

function requireLogin(req, res, next) {
    if (req.session && req.session.username) {
        // L'utilisateur est authentifié, continuez avec la requête suivante
        return next();
    } else {
        // Redirigez l'utilisateur vers la page de connexion
        res.redirect('/login');
    }
}

router.get('/conversationList', requireLogin,(req, res) => {
    const user = req.session.username;

    // Sélectionner le dernier message de chaque conversation
    const query = `
        SELECT DISTINCT joueur1 AS joueur, 
            (SELECT message FROM message WHERE (joueur1 = joueur OR joueur2 = joueur) AND (joueur1 = ? OR joueur2 = ?) ORDER BY date DESC LIMIT 1) AS last_message 
        FROM message 
        WHERE joueur2 = ? 
        UNION 
        SELECT DISTINCT joueur2 AS joueur, 
            (SELECT message FROM message WHERE (joueur1 = joueur OR joueur2 = joueur) AND (joueur1 = ? OR joueur2 = ?) ORDER BY date DESC LIMIT 1) AS last_message 
        FROM message 
        WHERE joueur1 = ?`;

    connection.query(query, [user, user, user, user, user, user], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des conversations :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        if (user) {
            connection.query('SELECT name FROM utilisateur WHERE username = ?', [user], (err, rows) => {
                if (err) {
                    console.error('Erreur lors de la récupération du nom associé à l\'username :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                // Si l'username existe dans la base de données, mettre à jour la variable name
                if (rows.length > 0) {
                    name = rows[0].name;
                }
                // Rendre la page avec la liste des conversations et le dernier message de chaque conversation
                res.render('conversationList', {
                    title: 'Liste des Conversations',
                    conversations: results,
                    username: user,
                    name: name
                });
            });
        }
    });
});


router.get('/message/:joueur2', (req, res) => {
    const user = req.session.username;
    const joueur2 = req.params.joueur2;

    // Récupérer toutes les conversations de l'utilisateur connecté
    connection.query('SELECT DISTINCT joueur1 AS joueur FROM message WHERE joueur2 = ? UNION SELECT DISTINCT joueur2 AS joueur FROM message WHERE joueur1 = ?', [user, user], (err, conversations) => {
        if (err) {
            console.error('Erreur lors de la récupération des conversations :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        // Récupérer les messages entre l'utilisateur connecté et le joueur2 spécifié
        connection.query('SELECT * FROM message WHERE (joueur1 = ? AND joueur2 = ?) OR (joueur1 = ? AND joueur2 = ?)', [user, joueur2, joueur2, user], (err, messages) => {
            if (err) {
                console.error('Erreur lors de la récupération des messages :', err);
                res.status(500).send('Erreur serveur');
                return;
            }
            res.render('message', { title: `Conversation avec ${joueur2}`, messages: messages, username: user, otherUser: joueur2, conversations: conversations });
        });
    });
});

// Ajouter un nouveau message à la base de données
router.post('/submitMessage/:joueur2', (req, res) => {
    const { message } = req.body;
    const joueur1 = req.session.username;
    const joueur2 = req.params.joueur2; // récupère le nom sur la barre de navigation

    connection.query('INSERT INTO message (message, joueur1, joueur2, date) VALUES (?, ?, ?, NOW())', [message, joueur1, joueur2], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'ajout du message :', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        res.redirect(`/message/${joueur2}`);
    });
});


module.exports = router;