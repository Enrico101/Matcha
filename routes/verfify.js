//checked
const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var db = require('../database');

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

router.post('/verify', function(req, res) {
    db.query("SELECT * FROM admin WHERE username = ?", [req.body.username], (err, succ) => {
        if (err)
        {
            res.render('login', {info: "", verified: "", login: ""});
        }
        else if (succ.length > 0)
        {
            console.log("login_username_provided: "+req.body.username);
            console.log("comparing username to: "+succ[0].username);
            console.log("password_provided: "+req.body.password);
            console.log("comparing password to: "+succ[0].password);
            if (req.body.username == succ[0].username && req.body.password == succ[0].password)
            {
                res.render('admin');
            }
            else
            {
                res.render('login', {info: "", verified: "", login: ""});
            }
        }
        else
        {
            db.query("SELECT * FROM users WHERE username = ?", [req.body.username], function(err, results) {
                if (err)
                {
                    res.redirect('/');
                }
                else if (results.length > 0)
                {
                    if (results[0].verified == "true")
                    {
                        //results[0].password == req.body.password
                        if (results[0].username == req.body.username && bcrypt.compareSync(req.body.password, results[0].password))
                        {
                            req.session.username = req.body.username;
                            req.session.user_id = results[0].user_id;
                            res.redirect('/check_profile');
                        }
                        else
                        {
                            res.render('login', {info: "", verified: "", login: "incorrect details"});
                        }
                    }
                    else
                    {
                        res.render('login', {info: "", verified: "false", login: ""});
                    }
                }
                else
                {
                    res.render('login', {info: "", verified: "", login: "details does not exist"});
                }
            });
        }
    })
    
});

module.exports = router;