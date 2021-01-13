//checked
const express = require('express');
var session = require('express-session');
var multer = require('multer');
var Objects = require('../objects');
var db = require('../database');

var router = express.Router();
var upload = multer({dest: 'Uploads/'});
var secretString = Math.floor((Math.random() * 10000) + 1);

router.use(session({
    secret: secretString.toString(),
    resave: false,
    saveUninitialized: false
}));

router.get("/verify_token", (req, res) => {
    var info = req.query;
    
    if (info)
    {
        db.query("SELECT token FROM users WHERE token = ?", [info.token], (err, succ) => {
            if (err)
                console.log(err);
            else if (succ.length > 0)
            {
                db.query("UPDATE users SET verified = ? WHERE token = ?", ["true", info.token], (err, succ) => {
                    if (err)
                        console.log(err);
                    else
                    {
                        db.query("UPDATE users set token = ? WHERE token = ?", ["Disposed", info.token]);
                        res.render('login', {info: "token has been verified", verified: "", login: ""});
                    }
                })
            }
            else
                res.render("index", {info: "Page does not exist!"});
        });
    }
});

module.exports = router;