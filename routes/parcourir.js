const express = require('express');
const router = express.Router();
const connection = require('../database');

router.get('/parcourir', (req, res) => {
    console.log('Statut de la connexion avant la requête :', connection);

    let filtre = req.query.filtre || 'jaime'; // Par défaut, filtre sur "jaime" s'il n'y a pas de filtre spécifique

    // Récupérer tous les dessins depuis la base de données avec le filtre approprié
    let query = 'SELECT * FROM dessin';
    if (filtre === 'jaime') {
        query = 'SELECT * FROM dessin';
    } else if (filtre === 'plus-recent') {
        query = 'SELECT * FROM dessin ORDER BY date DESC';
    }

    connection.query(query, (err, resultats) => {
        if (err) {
            console.error('Erreur lors de la récupération des dessins :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        let username = req.session.username;
        let name = '';

        // Vérifier si l'utilisateur est connecté et récupérer le nom associé à l'username
        if (username) {
            connection.query('SELECT name FROM utilisateur WHERE username = ?', [username], (err, rows) => {
                if (err) {
                    console.error('Erreur lors de la récupération du nom associé à l\'username :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }

                // Si l'username existe dans la base de données, mettre à jour la variable name
                if (rows.length > 0) {
                    name = rows[0].name;
                }

                // Envoyer la liste des dessins à la vue Pug avec l'username, le nom et le filtre
                res.render('parcourir', { title: 'Penty.', dessins: resultats, username: username, name: name, filtre: filtre });
            });
        } else {
            // Envoyer la liste des dessins à la vue Pug sans l'username, le nom et le filtre
            res.render('parcourir', { title: 'Penty.', dessins: resultats, username: username, filtre: filtre });
        }
    });
});



module.exports = router;
