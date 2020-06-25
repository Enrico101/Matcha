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

router.post('/user_profile', (req, res) => {
    if (req.session.username)
    {
        db.query("SELECT * FROM likes WHERE username = ?", [req.session.username], (err, results_2) => {
            db.query("SELECT * FROM messages", (err, messages) => {
                db.query("SELECT * FROM user_profile WHERE username = ?", [req.body.username], (err, user_info) => {
                    db.query("SELECT * FROM users WHERE username = ?", [req.body.username], (err, user_email) => {
                        db.query("SELECT * FROM user_profile WHERE username = ?", [req.session.username], (err, my_info) => {
                            db.query("SELECT * FROM likes WHERE username = ? AND likes = ?", [req.session.username, req.body.username], (err, liked_or_not) => {
                                if (err)
                                    res.send("An error has occured!");
                                else
                                {
                                    let like_or_nah = 0;
                                    if (liked_or_not.length > 0)
                                    {
                                        like_or_nah = 1;
                                    }
                                    if (user_info.length > 0)
                                    {
                                        //storing data of who viewed my profile
                                        db.query("SELECT * FROM views WHERE username = ? AND visitor = ?", [user_info[0].username, req.session.username], (err, succ) => {
                                            if (err)
                                                console.log("An error has occured!");
                                            else if (succ.length > 0)
                                            {
                                                console.log("Info alrready exists!");
                                            }
                                            else
                                                db.query("INSERT INTO views (username, visitor) VALUES (?, ?)", [user_info[0].username, req.session.username], (err, results) => {
                                                    if (err)
                                                        res.send("An error has occured!");
                                                });
                                        })
                                        //This if for rendering the user profile and to indicate whether we shoul enable to users to chat or not
                                        db.query("SELECT like_back FROM likes WHERE username = ? AND likes = ?", [req.session.username, req.body.username], (err, results) => {
                                            if (err)
                                                res.send("An error has occured!");
                                            else
                                            {
                                                if (results.length > 0)
                                                {
                                                    if (results[0].like_back == 1)
                                                    {
                                                        let y = 0;
                                                        let z = 0;
                                                        let unread_message = "no";

                                                        while (results_2[y])
                                                        {
                                                            while (messages[z])
                                                            {
                                                                if (messages[z].username == results_2[y].likes && messages[z].room_id == results_2[y].room_id)
                                                                {
                                                                    if (messages[z].read_message == 1)
                                                                    {
                                                                        unread_message = "yes";
                                                                        break;
                                                                    }
                                                                }
                                                                z++;
                                                            }
                                                            if (unread_message == "yes")
                                                            {
                                                                break;
                                                            }
                                                            y++;
                                                        }
                                                        res.render('user_profile', {user_info: user_info[0], user_email: user_email, chat: "Enable", my_username: req.session.username, my_profile_pic: my_info[0].profile_pic, liked_or_not: like_or_nah, unread_message: unread_message});
                                                    }
                                                    else
                                                    {
                                                        res.render('user_profile', {user_info: user_info[0], user_email: user_email, chat: "Disable", my_username: req.session.username, my_profile_pic: my_info[0].profile_pic, liked_or_not: like_or_nah, unread_message: "no"});
                                                    }
                                                }
                                                else
                                                {
                                                    res.render('user_profile', {user_info: user_info[0], user_email: user_email, chat: "Disable", my_username: req.session.username, my_profile_pic: my_info[0].profile_pic, liked_or_not: like_or_nah, unread_message: "no"});
                                                }
                                            }
                                        })
                                        //res.render('user_profile', {user_info: user_info[0]});
                                    }
                                }
                            })
                        })  
                    })
                })
            })
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
});

module.exports = router;