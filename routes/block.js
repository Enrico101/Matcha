//checked
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

router.post('/block', (req, res) => {
    if (req.body.submit == "block")
    {
        db.query("INSERT INTO blocked_users (blocked_user, blocker) VALUES (?, ?)", [req.body.block_this_user, req.session.user_id], (err, succ) => {
            if (err)
                console.log("An error has occured!");
            else
                res.redirect('/profile');
        })
    }
    else
        res.redirect('/profile');
});

module.exports = router;