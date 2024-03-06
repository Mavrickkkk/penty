var express = require('express');
const connection = require("../database");
var router = express.Router();

router.get('/regles', (req, res) => {
        res.render('regles', { title: 'Les règles', username: req.session.username });
});

module.exports = router;
