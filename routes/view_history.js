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

router.get('/view_history', (req, res) => {
    if (req.session.user_id)
    {
        if (req.session.search_results_modifiable)
        {
            req.session.search_results_backup = "";
            req.session.search_results_modifiable = "";
        }
        db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, results) => {
            db.query("SELECT * FROM messages", (err, messages) => {
                db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [req.session.user_id], (err, ghost_mode) => {
                    if (err)
                        res.send("An error has occured!");
                    else if (ghost_mode.length > 0)
                        res.render("view_history", {info: "user is ghosted"});
                    else
                    {
                        db.query("select * from views inner join users on views.visitor_id = users.user_id where views.user_id = ?;", [req.session.user_id], (err, succ) => {
                            let y = 0;
                            let z = 0;
                            let unread_message = "no";

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
                            if (err)
                                res.send("An error has occured!");
                            else if (succ.length > 0)
                            {
                                res.render('view_history', {data: succ, info: "", unread_message: unread_message});
                            }
                            else
                                res.render('view_history', {data: "", info: "", unread_message: unread_message});
                        });
                    }
                })
            })
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

module.exports = router;