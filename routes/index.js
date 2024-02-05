var express = require('express');
const connection = require("../database");
var router = express.Router();

router.get('/', (req, res) => {
  console.log('Statut de la connexion avant la requête :', connection);

  // Récupérer tous les dessins depuis la base de données
  connection.query('SELECT * FROM dessin', (err, resultats) => {
    if (err) {
      console.error('Erreur lors de la récupération des dessins :', err);
      res.status(500).send('Erreur serveur');
      return;
    }

    // Envoyer la liste des dessins à la vue Pug
    res.render('index', { title: 'Ma Page', dessins: resultats, username: req.session.username });
  });
});

module.exports = router;
