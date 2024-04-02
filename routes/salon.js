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
        connection.query('SELECT name FROM utilisateur WHERE username = ?', [req.session.username], (err, rows2) => {
            if (err) {
                console.error('Erreur lors de la récupération du nom associé à l\'username :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            // Si l'username existe dans la base de données, mettre à jour la variable name
            if (rows2.length > 0) {
                name = rows2[0].name;
            }
            res.render('salon', {parties: rows, username: req.session.username, name: name });
        });
    });
});

router.post('/creer', (req, res) => {
    const joueur1 = req.session.username;
    let code = req.body.code; // Si mdp est null, la partie est publique

    connection.query('SELECT mot FROM mot ORDER BY RAND() LIMIT 2', (err, rowsWord) => {
        if (err) {
            console.error('Erreur lors de la récupération du mot aléatoire:', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        let randomWord1 = rowsWord[0].mot;
        let randomWord2 = rowsWord[1].mot;

        // Vérifier si les deux mots sont les mêmes et sélectionner un nouveau randomWord2 si c'est le cas
        while (randomWord1 === randomWord2) {
            connection.query('SELECT mot FROM mot ORDER BY RAND() LIMIT 1', (err, rowsWord) => {
                if (err) {
                    console.error('Erreur lors de la récupération du mot aléatoire:', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }
                randomWord2 = rowsWord[0].mot;
            });
        }

        if (!code)
            code= null;
        let sqlQuery = 'INSERT INTO partie SET randomWord1 = ?, randomWord2 = ?, joueur1 = ?, mdp = ?';
        let sqlParams = [randomWord1, randomWord2, joueur1, code];

        // Exécution de la requête SQL
        connection.query(sqlQuery, sqlParams, (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de la partie:', err);
                res.status(500).send('Erreur serveur');
                return;
            }
            console.log('Nouvelle partie insérée avec succès');
            const partieId = result.insertId; // Récupérer l'ID de la partie nouvellement créée
            res.redirect(`/jeu/${partieId}`); // Rediriger vers la page de jeu correspondante
        });
    });
});

router.get('/rejoindre/:partieId', (req, res) => {
    const joueur = req.session.username;
    const partieId = req.params.partieId;

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
            res.redirect(`/jeu/${partieId}`);
        });
    });
});


module.exports = router;