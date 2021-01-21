var mysql = require('mysql');

//database connection
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root444@',
    database: 'matcha'
});

module.exports = db;
