const express = require('express');
const router = express.Router();
const connection = require("../database");

function requireLogin(req, res, next) {
    if (req.session && req.session.username) {
        // L'utilisateur est authentifié, continuez avec la requête suivante
        return next();
    } else {
        // Redirigez l'utilisateur vers la page de connexion
        res.redirect('/login');
    }
}

// Route pour la recherche de parties par nom de joueur
router.get('/salon', requireLogin, (req, res) => {
    const query = req.query.query; // Récupérer le nom du joueur à rechercher

    // Construction de la requête SQL pour rechercher les parties correspondantes
    let sqlQuery = 'SELECT * FROM partie WHERE joueur2 IS NULL';
    let sqlParams = [];

    if (query) {
        sqlQuery += ' WHERE joueur1 LIKE ?';
        sqlParams.push('%' + query + '%');
    }

    connection.query(sqlQuery, sqlParams, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la recherche des parties:', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        // Rendu de la page avec les données récupérées
        res.render('salon', { parties: rows });
    });
});

// Route pour créer une nouvelle partie
router.post('/creer', (req, res) => {
    const randomWord1 = "Tapis";
    const randomWord2 = "Souris";
    const joueur1 = req.session.username;
    let code = req.body.code; // Si mdp est null, la partie est publique

    if (!code)
        code= null;
    // Requête d'insertion SQL
    let sqlQuery = 'INSERT INTO partie (randomWord1, randomWord2, joueur1, mdp) VALUES (?, ?, ?, ?)';
    let sqlParams = [randomWord1, randomWord2, joueur1, code];

    // Exécution de la requête SQL
    connection.query(sqlQuery, sqlParams, (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion de la partie:', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        console.log('Nouvelle partie insérée avec succès');
        res.redirect('/jeu'); // Redirigez l'utilisateur vers la page du salon
    });
});

router.post('/rejoindre', (req, res) => {
    const joueur = req.session.username;
    const partieId = req.body.partieId;

    // Vérifie que la partie existe et qu'elle n'a qu'un seul joueur
    connection.query('SELECT * FROM partie WHERE id = ? AND joueur2 IS NULL', [partieId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de la partie:', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        if (result.length === 0) {
            // La partie n'existe pas ou a déjà deux joueurs
            res.redirect('/salon');
            return;
        }
        connection.query('UPDATE partie SET joueur2 = ?, type = 2 WHERE id = ?', [joueur, partieId], (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour de la partie:', err);
                res.status(500).send('Erreur serveur');
                return;
            }
            console.log(`Le joueur ${joueur} a rejoint la partie ${partieId}`);
            res.redirect('/jeu');
        });
    });
});

module.exports = router;