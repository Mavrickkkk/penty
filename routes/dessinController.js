const connection = require("../database");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/dessin';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, 'public/dessin/');
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const filename = `dessin${now.getTime()}.png`;
        req.filename = filename; // Save the filename in the request object
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

exports.getJeu = async (req, res) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            connection.query('SELECT mot FROM mot ORDER BY RAND() LIMIT 1', (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        res.render('jeu', { mot: rows[0].mot });
    } catch (err) {
        console.error('Erreur lors de la récupération du mot aléatoire:', err);
        res.status(500).send('Erreur serveur');
    }
};

exports.postDessin = [
    upload.single('image'),
    async (req, res) => {
        try {
            const idPartie = 1;
            await new Promise((resolve, reject) => {
                connection.query('INSERT INTO dessin (picPath, idPartie, date) VALUES (?, ?, NOW())', [req.filename, idPartie], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
            res.send('Dessin enregistré avec succès');
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du dessin :', err);
            res.status(500).send('Erreur serveur');
        }
    }
];
