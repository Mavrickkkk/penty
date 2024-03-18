const express = require('express');
const router = express.Router();
const connection = require('../database');

router.get('/', (req, res) => {
  console.log('Statut de la connexion avant la requête :', connection);

  // Récupérer tous les dessins depuis la base de données
  connection.query('SELECT * FROM dessin LIMIT 5', (err, resultats) => {
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

        // Envoyer la liste des dessins à la vue Pug avec l'username et le nom
        res.render('index', { title: 'Penty.', dessins: resultats, username: username, name: name });
      });
    } else {
      // Envoyer la liste des dessins à la vue Pug sans l'username et le nom
      res.render('index', { title: 'Penty.', dessins: resultats, username: username });
    }
  });
});

module.exports = router;
