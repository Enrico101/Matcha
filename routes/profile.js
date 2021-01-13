//checked                            
const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');

var router = express.Router();
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

router.get('/profile', function(req, res) {
    if (req.session.username)
    {
        var username = req.session.username;
        var user_id = req.session.user_id;
    
        if (req.session.search_results_modifiable)
        {
            req.session.search_results_backup = "";
            req.session.search_results_modifiable = "";
        }
        //check if user is ghosted
        db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [user_id], (err, succ) => {
            if (err)
                res.send("AN error has occured!");
            else if (succ.length > 0)
            {
                res.render("profile", {username: username, info: "user is ghosted"});
            }
            else
            {
                //if user is not ghosted
                db.query("SELECT * FROM messages", (err, messages) => {
                    if (err)
                        res.send(err);
                    else
                    {
                        db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, results) => {
                            if (err)
                                res.send(err);
                            else
                            {
                                var unread_message = "no";
        
                                if (results.length > 0)
                                {
                                    let x = 0;
                                    let y = 0;
                                    let z = 0;
                                    while (results[y])
                                    {
                                        while (messages[z])
                                        {
                                            if (messages[z].user_id == results[y].likes && messages[z].room_id == results[y].room_id)
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
                                    console.log("unread_message: "+unread_message);
                                }
                                res.render('profile', {username: username , info: "", unread_message: unread_message});
                            }
                        })
                    }                    
                })
            }
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

module.exports = router;