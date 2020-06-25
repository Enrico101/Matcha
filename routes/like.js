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

router.post('/like', (req, res) => {
    if (req.session.username)
    {
        if (req.body.submit)
        {
            let username = req.session.username;
            let likes = req.body.likes;
            
            db.query("SELECT * FROM likes WHERE username = ? AND likes = ?", [username, likes], (err, succ) => {
                if (err)
                {
                    res.send("An error has occurred!");
                }
                else
                {
                    console.log(succ);
                    if (succ.length > 0)
                    {
                        res.redirect("/profile");
                    }
                    else
                    {
                        var room_id = Math.floor((Math.random() * 10000) + 1);
                        db.query("INSERT INTO likes (username, likes, like_back, room_id, status) VALUES (?, ?, ?, ?, ?)", [username, likes, 0, "not_staged", "not_staged"], (err, succ01) => {
                            if (err)
                            {
                                res.send(err);
                            }
                            else if (succ)
                            {
                                db.query("SELECT * FROM user_profile WHERE username = ?", [likes], (err, info) => {
                                    if (err)
                                        res.send("An error has occured!");
                                    else if (info)
                                    {
                                        let fame = info[0].fame_rating;
                                        if (fame < 10)
                                        {
                                            fame += 0.25;
                                        }
                                        console.log("fame: "+fame);
                                        db.query("UPDATE user_profile SET fame_rating = ? WHERE username = ?", [fame, info[0].username], (err, succ) => {
                                            if (err)
                                                res.send("An error has occured!");
                                        })
                                    }
                                })
                                db.query("SELECT * FROM likes WHERE username = ? AND likes = ?", [likes, username], (err, results) => {
                                    if (results.length > 0)
                                    {
                                        db.query("UPDATE likes set like_back = ? WHERE username = ? AND likes = ?", [1, likes, username]);
                                        db.query("UPDATE likes set room_id = ? WHERE username = ? AND likes = ?", [room_id.toString(), likes, username]);
                                        db.query("UPDATE likes set like_back = ? WHERE username = ? AND likes = ?", [1, username, likes]);
                                        db.query("UPDATE likes set room_id = ? WHERE username = ? AND likes = ?", [room_id.toString(), username, likes]);
                                        res.redirect('/profile');
                                    }
                                    else
                                    {
                                        res.redirect('/profile');
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

module.exports = router;