// database.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'penty',
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');

    // Test de connexion
    testConnection();
});

function testConnection() {
    connection.query('SELECT 1 + 1 AS solution', (err, result) => {
        if (err) {
            console.error('Erreur lors du test de connexion :', err);
            return;
        }
        console.log('Test de connexion réussi. Résultat :', result[0].solution);
    });
}
module.exports = connection;