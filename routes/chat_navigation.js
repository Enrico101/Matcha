//checked
const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');
var Objects = require('../objects');

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

router.get('/chat_screen', (req, res) => {
    if (req.session.user_id)
    {
        if (req.session.search_results_modifiable)
        {
            req.session.search_results_backup = "";
            req.session.search_results_modifiable = "";
        }
        function user_info(username, user_id, profile_pic) {
            this.username = username,
            this.user_id = user_id,
            this.profile_pic = profile_pic
        };
        var user_data = [];
        db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [req.session.user_id], (err, ghost_mode) => {
            if (err)
                res.send("An error has occured!");
            else if (ghost_mode.length > 0)
            {
                res.render('chat_navigation', {info: "user is ghosted"});
            }
            else
            {
                db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, results) => {
                    db.query("SELECT * FROM messages", (err, messages) => {
                        db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id != ?", [req.session.user_id], (err, users) => {
                            if (err)
                                res.send("An error has occured!");
                            else
                            {
                                db.query("SELECT * FROM likes WHERE user_id != ?", [req.session.user_id], (err, succ) => {
                                    if (err)
                                        res.send("An error has occured!");
                                    else
                                    {
                                        let d = 0;
                                        let z = 0;
                                        var unread_message = "no";
                                     
                                        while (results[d])
                                        {
                                            while (messages[z])
                                            {
                                                if (messages[z].user_id == results[d].likes && messages[z].room_id == results[d].room_id)
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
                                            d++;
                                        }
                                        console.log(succ);
                                        var x = 0;
                                        while (succ[x])
                                        {
                                            if (succ[x].likes == req.session.user_id && succ[x].like_back == 1)
                                            {
                                                var y = 0;
                                                while (users[y])
                                                {
                                                    if (users[y].user_id == succ[x].user_id)
                                                    {
                                                        var data = new user_info(users[y].username, users[y].user_id, users[y].profile_pic);
                                                        user_data.push(data);
                                                        break;
                                                    }
                                                    y++;
                                                }
                                            }
                                            x++;
                                        }
                                        res.render('chat_navigation', {data: user_data, info: "", unread_message: unread_message});
                                    };
                                });
                            }
                        })
                    })
                })
            }
        })
    }
    else
        res.redirect('/login');
});

module.exports = router;