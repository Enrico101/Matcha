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

router.post('/unlike', (req, res) => {
    if (req.session.username)
    {
        db.query("UPDATE likes SET like_back = ? WHERE username = ? AND likes = ?", [0, req.body.unlike_this_user, req.session.username]);
        db.query("UPDATE likes SET room_id = ? WHERE username = ? AND likes = ?", ["not_staged", req.body.unlike_this_user, req.session.username], (err, succ) => {
            if (err)
                res.send("An error has occured!");
        })
        db.query("DELETE FROM likes WHERE username = ? AND likes = ?", [req.session.username, req.body.unlike_this_user], (err, succ) => {
            if (err)
                res.send(err);
            else
                res.redirect('/chat_screen');
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
module.exports = router;