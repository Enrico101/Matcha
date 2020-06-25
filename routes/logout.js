const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');
var Objects = require('../objects');
var geo_tools = require('geolocation-utils');
var get_date = require('get-date');

var router = express.Router();
var secretString = Math.floor((Math.random() * 10000) + 1);
router.use(session({
    secret: secretString.toString(),
    resave: false,
    saveUninitialized: false
}));
router.use(bodyParser.urlencoded({
    extended: 'true'
}));

router.get('/logout', (req, res) => {
    db.query("UPDATE user_profile SET date_of_last_connection = ? WHERE username = ?", [get_date(), req.session.username]);
    db.query("UPDATE user_profile SET status = ? WHERE username = ?", ["offline", req.session.username], (err, succ) => {
        if (err)
            res.send("An error has occcured!");
        else
        {
            req.session.destroy;
            res.render('login', {info: "", verified: "", login: ""});
        }
    })
});

module.exports = router;