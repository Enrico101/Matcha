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

router.get('/block_requests', (req, res) => {
    db.query("SELECT * FROM blocked_users", (err, blocked_users) => {
        if (err)
            res.send("An error  has occured!");
        else
        {
            res.render('blocked_users', {blocked_users: blocked_users});
        }
    })
})

router.post('/block_requests', (req, res) => {
    if (req.body.submit)
    {
        if (req.body.submit == "block")
        {
            let blocked_user = req.body.blocked_user;
            let blocker = req.body.blocker;
            console.log(blocker+" "+blocked_user);

            db.query("UPDATE likes SET like_back = ? WHERE user_id = ? AND likes = ?", [0, blocker, blocked_user], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("UPDATE likes SET room_id = ? WHERE user_id = ? AND likes = ?", ['not_staged', blocker, blocked_user], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("UPDATE likes SET status = ? WHERE user_id = ? AND likes = ?", ['blocker', blocker, blocked_user], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("UPDATE likes SET like_back = ? WHERE user_id = ? AND likes = ?", [0, blocked_user, blocker], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("UPDATE likes SET room_id = ? WHERE user_id = ? AND likes = ?", ['not_staged', blocked_user, blocker], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("UPDATE likes SET status = ? WHERE user_id = ? AND likes = ?", ['blocked', blocked_user, blocker], (err, succ) => {
                if (err)
                    res.send(err);
                else if (succ)
                    console.log(succ);
            })
            db.query("DELETE FROM blocked_users WHERE blocked_user = ? AND blocker = ?", [blocked_user, blocker], (err, succ) => {
                if (err)
                    res.send(err);
                else
                {
                    res.redirect('/block_requests');
                }
            })
        }
        else
        {
            let blocked_user = req.body.blocked_user;
            let blocker = req.body.blocker;
            db.query("DELETE FROM blocked_users WHERE blocked_user = ? AND blocker = ?", [blocked_user, blocker], (err, succ) => {
                if (err)
                    res.send(err);
                else
                {
                    res.redirect('/block_requests');
                }
            })
        }
    }
})

module.exports = router;