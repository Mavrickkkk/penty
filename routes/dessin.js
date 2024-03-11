const express = require('express');
const router = express.Router();
const connection = require('../database');

router.get('/dessin/:id', (req, res) => {
    const id = req.params.id;
    const username = req.session.username;

    // Récupérer le dessin spécifique depuis la base de données en fonction de l'id
    let query = `
    SELECT dessin.*, partie.joueur1, partie.joueur2
    FROM dessin
    JOIN partie ON dessin.idPartie = partie.id
    WHERE dessin.id = ?
  `;

    connection.query(query, [id], (err, resultats) => {
        if (err) {
            console.error('Erreur lors de la récupération du dessin :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        if (resultats.length === 0) {
            res.status(404).send('Dessin non trouvé');
            return;
        }

        const dessin = resultats[0];

        // Récupérer le nom et l'username des joueurs 1 et 2
        let queryJoueurs = `
      SELECT utilisateur.name AS joueur1Name, utilisateur.username AS joueur1Username,
             utilisateur2.name AS joueur2Name, utilisateur2.username AS joueur2Username
      FROM partie
      JOIN utilisateur ON partie.joueur1 = utilisateur.username
      JOIN utilisateur AS utilisateur2 ON partie.joueur2 = utilisateur2.username
      WHERE partie.id = ?
    `;

        connection.query(queryJoueurs, [dessin.idPartie], (err, rows) => {
            if (err) {
                console.error('Erreur lors de la récupération des noms des joueurs :', err);
                res.status(500).send('Erreur serveur');
                return;
            }

            const nomJoueur1 = rows[0]?.joueur1Name || '';
            const usernameJoueur1 = rows[0]?.joueur1Username || '';
            const nomJoueur2 = rows[0]?.joueur2Name || '';
            const usernameJoueur2 = rows[0]?.joueur2Username || '';

            // Envoyer les données du dessin à la vue Pug avec l'username et les noms et usernames des joueurs
            res.render('dessin', {
                title: 'Penty.',
                dessin: dessin,
                username: username,
                nomJoueur1: nomJoueur1,
                usernameJoueur1: usernameJoueur1,
                nomJoueur2: nomJoueur2,
                usernameJoueur2: usernameJoueur2
            });
        });
    });
});

module.exports = router;
