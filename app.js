// app.js
const express = require('express');
const connection = require("./database");
const app = express();
const port = 3000;

// Configurer le moteur de modèles Pug
app.set('view engine', 'pug');

// Servir le répertoire statique public
app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log('Statut de la connexion avant la requête :', connection);

    // Récupérer tous les dessins depuis la base de données
    connection.query('SELECT * FROM dessin', (err, resultats) => {
        if (err) {
            console.error('Erreur lors de la récupération des dessins :', err);
            res.status(500).send('Erreur serveur');
            return;
        }

        // Envoyer la liste des dessins à la vue Pug
        res.render('index', { title: 'Ma Page', dessins: resultats });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
