//checked
const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');
var Objects = require('../objects');
var geo_tools = require('geolocation-utils');
var nodemailer = require('nodemailer');

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

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "enradcli@student.wethinkcode.co.za",
        pass: "Paul444@"
    }
})

router.post("/report_user", (req, res) => {
    if (req.body.user_id && req.session.user_id)
    {
        db.query("INSERT INTO reported (reported_user, reported_by) VALUES (?, ?)", [req.body.user_id, req.session.user_id], (err, succ) => {
            if (err)
                res.send(err);
            else
            {
                var mailOptions = {
                    from: "matcha@gmail.com",
                    to: "enradcli@student.wethinkcode.co.za",
                    subject: "User has been reported",
                    text: req.body.username+ "has been reported by "+req.session.username
                };
                transport.sendMail(mailOptions, (err, succ) => {
                    if (err)
                        console.log(err);
                    else
                        console.log("Email was successfully sent to "+req.body.email);
                })
                res.redirect("/profile");
            }
        })
    }
})

module.exports = router;