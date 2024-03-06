// routes/jeu.js
const express = require('express');
const connection = require("../database");
const router = express.Router();

// Définir la route pour la page de jeu
router.get('/jeu', (req, res) => {
    // Requête pour récupérer un mot aléatoire
    connection.query('SELECT mot FROM mot ORDER BY RAND() LIMIT 1', (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération du mot aléatoire:', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        // Rendu de la page avec le mot aléatoire
        res.render('jeu', { mot: rows[0].mot });
    });
});

module.exports = router; // Ne pas oublier cette ligne
