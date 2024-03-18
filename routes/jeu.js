const express = require('express');
const router = express.Router();
const connection = require("../database");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'public', 'dessin');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const filename = `dessin${now.getTime()}.png`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.post('/dessinEnvoie', upload.single('image'), (req, res) => {
    const idPartie = 1;
    const imageName = req.file.filename;

    // Enregistrer le nom de l'image dans la base de données
    connection.query('INSERT INTO dessin (picPath, idPartie, date) VALUES (?, ?, NOW())', [imageName, idPartie], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'enregistrement du dessin :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.redirect('/');
    });
});

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

module.exports = router;