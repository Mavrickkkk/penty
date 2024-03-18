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
      SELECT randomWord, utilisateur.name AS joueur1Name, utilisateur.username AS joueur1Username,
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
            connection.query(`SELECT count(*) as nombreLikes FROM likes WHERE idDessin=?`, [id], (err, likes) => {
                if (err) {
                    console.error('Erreur lors de la récupération du nombre de likes :', err);
                    res.status(500).send('Erreur serveur');
                    return;
                }
                const nombreLikes = likes[0].nombreLikes;
                const nomJoueur1 = rows[0].joueur1Name;
                const usernameJoueur1 = rows[0].joueur1Username;
                const nomJoueur2 = rows[0].joueur2Name;
                const usernameJoueur2 = rows[0].joueur2Username;
                const randomWord = rows[0].randomWord;

                // Envoyer les données du dessin à la vue Pug avec l'username et les noms et usernames des joueurs
                res.render('dessin', {
                    title: 'Penty.',
                    dessin: dessin,
                    username: username,
                    nomJoueur1: nomJoueur1,
                    usernameJoueur1: usernameJoueur1,
                    nomJoueur2: nomJoueur2,
                    usernameJoueur2: usernameJoueur2,
                    randomWord: randomWord,
                    nombreLikes: nombreLikes
                });
            });
        });
    });
});

router.get('/dessin/:id/liked', (req, res) => {
    const id = req.params.id;
    const username = req.session.username;

    if (!username) {
        res.send(false);
        return;
    }

    // Vérifier si l'utilisateur a déjà aimé le dessin
    let query = 'SELECT * FROM likes WHERE idDessin = ? AND utilisateur = ?';
    connection.query(query, [id, username], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification des likes :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.send(result.length > 0);
    });
});

router.post('/dessin/:id/like', (req, res) => {
    const id = req.params.id;
    const username = req.session.username;

    if (!username) {
        res.status(401).send('Vous devez être connecté pour ajouter un like');
        return;
    }

    // Vérifier si l'utilisateur a déjà aimé le dessin
    let query = 'SELECT * FROM likes WHERE idDessin = ? AND utilisateur = ?';
    connection.query(query, [id, username], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification des likes :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        if (result.length > 0) {
            // L'utilisateur a déjà aimé le dessin
            res.status(409).send('Vous avez déjà aimé ce dessin');
            return;
        }

        // Ajouter un like dans la base de données
        query = 'INSERT INTO likes(idDessin, utilisateur) VALUES (?, ?)';
        connection.query(query, [id, username], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'ajout d\'un like :', err);
                res.status(500).send('Erreur serveur');
                return;
            }
            res.send('OK');
        });
    });
});

router.delete('/dessin/:id/unlike', (req, res) => {
    const id = req.params.id;
    const username = req.session.username;

    if (!username) {
        res.status(401).send('Vous devez être connecté pour supprimer un like');
        return;
    }

    // Supprimer un like dans la base de données
    let query = 'DELETE FROM likes WHERE idDessin = ? AND utilisateur = ?';
    connection.query(query, [id, username], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression d\'un like :', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        res.send('OK');
    });
});

module.exports = router;
