const express = require('express');
const router = express.Router();
const connection = require('../database');

router.get('/compte/:profile', (req, res) => {
    let profile = req.params.profile;
    let username = req.session.username;

    let filtre = req.query.filtre || 'jaime'; // Par défaut, filtre sur "jaime" s'il n'y a pas de filtre spécifique

    // Récupérer tous les dessins faits par l'utilisateur depuis la base de données avec le filtre approprié
    let query = `
        SELECT dessin.* 
        FROM dessin 
        INNER JOIN partie 
        ON dessin.idPartie = partie.id
        WHERE partie.joueur1 = ? OR partie.joueur2 = ?
    `;

    if (filtre === 'jaime') {
        query += ' ORDER BY dessin.likes DESC';
    } else if (filtre === 'plus-recent') {
        query += ' ORDER BY dessin.date DESC';
    }

    connection.query(query, [profile, profile], (err, resultats) => {
        if (err) {
            console.error('Erreur lors de la récupération des dessins de l\'utilisateur :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        // Récupérer le nom de l'utilisateur
        let name = '';
        connection.query('SELECT name FROM utilisateur WHERE username = ?', [profile], (err, rows) => {
            if (err) {
                console.error('Erreur lors de la récupération du nom de l\'utilisateur :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            // Si l'username existe dans la base de données, mettre à jour la variable name
            if (rows.length > 0) {
                name = rows[0].name;
            }
            let nameUser = '';
            connection.query('SELECT name FROM utilisateur WHERE username = ?', [username], (err, rows) => {
                if (err) {
                    console.error('Erreur lors de la récupération du nom de l\'utilisateur :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                // Si l'username existe dans la base de données, mettre à jour la variable name
                if (rows.length > 0) {
                    nameUser = rows[0].name;
                }

                // Envoyer la liste des dessins à la vue Pug avec l'username, le nom et le filtre
                res.render('compte', {
                    title: 'Penty.',
                    dessins: resultats,
                    profile: profile,
                    username: username,
                    name: nameUser,
                    nameProfile: name,
                    filtre: filtre
                });
            });
        });
    });
});

module.exports = router;
