// routes/index.js
const express = require('express');
const connection = require("../database");
const router = express.Router();
const bcrypt = require('bcrypt');

// Affiche la page de connexion
router.get('/login', (req, res) => {
    res.render('login', { title: 'Se connecter' });
});

router.post('/searchUser', (req, res) => {
    const { username, password } = req.body; // Accès aux champs du formulaire

    // Rechercher l'utilisateur dans la table 'utilisateur'
    const sql = 'SELECT * FROM utilisateur WHERE username = ?';
    connection.query(sql, [username], async (err, result) => {
        if (err) {
            console.error('Erreur lors de la recherche de l\'utilisateur :', err);
            console.log({password});
            res.status(500).send('Erreur serveur');
            return;
        }

        if (result.length > 0) {
            const hashedPassword = result[0].password;
            const type = result[0].type;

            // Comparer les mots de passe hachés avec bcrypt
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (passwordMatch) {
                console.log('Connexion réussie pour l\'utilisateur :', {username});
                req.session.username = username;
                req.session.type = type;
                res.redirect('/'); // Redirection vers la page d'accueil
            } else {
                console.log('Mot de passe incorrect pour l\'utilisateur :', {username});
                res.status(401).send('Mot de passe incorrect');
            }
        } else {
            console.log('Utilisateur non trouvé :', {username});
            res.status(401).send('Nom d\'utilisateur incorrect');
        }
    });
});

module.exports = router;
