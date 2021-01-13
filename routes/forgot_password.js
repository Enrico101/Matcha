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
var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "matchaproject01",
        pass: "Matcha1234"
    },
    tls: {
        rejectUnauthorized: false
    }
})
router.use(bodyParser.urlencoded({
    extended: 'true'
}));

router.get("/forgot_password", (req, res) => {
    res.render('forgot_password', {pass_reset: ""})
});

router.post("/forgot_password", (req, res) => {
    let email = req.body.email;

    let mailOptions = {
        from: "matcha@gmail.com",
        to: email,
        subject: "Click on the link below to reset your password!",
        text: "http://localhost:3002/reset_password"
    }
    if (email.length > 0)
    {
        transport.sendMail(mailOptions, (err, info) => {
            if (err)
                res.send(err);
            else
            {
                console.log("Email sent to: "+email);
                res.render('forgot_password', {pass_reset: "sent"});
            }
        });
    }
});

module.exports = router;