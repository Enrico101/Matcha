const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');
var Objects = require('../objects');
var geo_tools = require('geolocation-utils');

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

router.get('/like_history', (req, res) => {
    if (req.session.username)
    {
        if (req.session.search_results_modifiable)
        {
            req.session.search_results_backup = "";
            req.session.search_results_modifiable = "";
        }
        db.query("SELECT * FROM ghost_mode WHERE username = ?", [req.session.username], (err, ghost_mode) => {
            if (err)
                res.send("An error has occured!");
            else if (ghost_mode.length > 0)
                res.render('like_history', {info: "user is ghosted"});
            else
            {
                db.query("SELECT * FROM likes WHERE likes = ?", [req.session.username], (err, likes) => {
                    if (err)
                        res.send(err);
                    else if (likes.length > 0)
                        res.render('like_history', {likes: likes, info: ""});
                    else
                        res.render('like_history', {likes: "", info: ""});
                })
            }
        });
    }
    else
        res.redirect('/login');
})

module.exports = router;