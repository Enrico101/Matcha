const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var db = require('../database');

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

router.get('/check_profile', function(req, res) {
    if (req.session.username)
    {
        var username = req.session.username;
        db.query("SELECT * FROM ghost_mode WHERE username = ?", [username], (err, ghost_mode) => {
            if (err)
                res.send("An error occurred!");
            else if (ghost_mode.length > 0)
                res.render('set_profile', {username: username, image: "Image found", info: "", bad_image: "", large_amount_of_uploads: ""});
            else
            {
                db.query("SELECT * FROM user_profile WHERE username = ?", [username], function(err, results) {
                    console.log(results);
                    if (results.length > 0)
                    {
                        res.redirect('/profile');
                    }
                    else
                    {
                        res.render('set_profile', {username: username, image: "Image found", info: "", bad_image: "", large_amount_of_uploads: ""});
                    }
                })
            }
        })
    }
    else
        res.redirect('/login');
});

module.exports = router;