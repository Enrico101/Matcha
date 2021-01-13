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

router.post('/like', (req, res) => {
    if (req.session.user_id)
    {
        if (req.body.submit)
        {
            let user_id = req.session.user_id;
            let likes = req.body.likes;
            
            db.query("SELECT * FROM likes WHERE user_id = ? AND likes = ?", [user_id, likes], (err, succ) => {
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
                        db.query("INSERT INTO likes (user_id, likes, like_back, room_id, status) VALUES (?, ?, ?, ?, ?)", [user_id, likes, 0, "not_staged", "not_staged"], (err, succ01) => {
                            if (err)
                            {
                                res.send(err);
                            }
                            else if (succ)
                            {
                                db.query("SELECT * FROM user_profile WHERE user_id = ?", [likes], (err, info) => {
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
                                        db.query("UPDATE user_profile SET fame_rating = ? WHERE user_id = ?", [fame, info[0].user_id], (err, succ) => {
                                            if (err)
                                                res.send("An error has occured!");
                                        })
                                    }
                                })
                                db.query("SELECT * FROM likes WHERE user_id = ? AND likes = ?", [likes, user_id], (err, results) => {
                                    if (results.length > 0)
                                    {
                                        db.query("UPDATE likes set like_back = ? WHERE user_id = ? AND likes = ?", [1, likes, user_id]);
                                        db.query("UPDATE likes set room_id = ? WHERE user_id = ? AND likes = ?", [room_id.toString(), likes, user_id]);
                                        db.query("UPDATE likes set like_back = ? WHERE user_id = ? AND likes = ?", [1, user_id, likes]);
                                        db.query("UPDATE likes set room_id = ? WHERE user_id = ? AND likes = ?", [room_id.toString(), user_id, likes]);
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