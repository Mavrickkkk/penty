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

router.post('/dessinEnvoie/:partieId', upload.single('image'), (req, res) => {
    const partieId = req.params.partieId;
    const imageName = req.file.filename;

    // Enregistrer le nom de l'image dans la base de données
    connection.query('INSERT INTO dessin (picPath, idPartie, date) VALUES (?, ?, NOW())', [imageName, partieId], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'enregistrement du dessin :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.redirect('/');
    });
});

// Définir la route pour la page de jeu
router.get('/jeu/:partieId', (req, res) => {
    const partieId = req.params.partieId;
    const joueurCourant = req.session.username;

    connection.query('SELECT randomWord1, randomWord2, joueur1 FROM partie WHERE id=?', [partieId], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération du mot aléatoire:', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        let mot;
        if (rows[0].joueur1 === joueurCourant) {
            mot = rows[0].randomWord1;
        } else {
            mot = rows[0].randomWord2;
        }

        // Rendu de la page avec le mot aléatoire
        res.render('jeu', { mot: mot });
    });
});

router.get('/jeu/:partieId/checkPlayer2', (req, res) => {
    const partieId = req.params.partieId;

    connection.query('SELECT joueur2 FROM partie WHERE id=?', [partieId], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération du joueur 2:', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        res.json({ player2: rows[0].joueur2 !== null });
    });
});

module.exports = router;