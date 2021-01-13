//checked
const express = require('express');
var session = require('express-session');
var multer = require('multer');
var Objects = require('../objects');
var db = require('../database');
var unirest = require('unirest');
var ip_loc = require('ip-locator');
var get_date = require('get-date');

var router = express.Router();
var upload = multer({dest: 'Uploads/'});
var secretString = Math.floor((Math.random() * 10000) + 1);

router.use(session({
    secret: secretString.toString(),
    resave: false,
    saveUninitialized: false
}));

function allLetter(inputtxt)
{
    var alphabets26 = 'abcdefghijklmnopqrstuvwxyz';
       var input = inputtxt;
       input = input.toLowerCase();
       var icount = 0;
       for (var i = 0; i < alphabets26.length; i++) {
           var letter = alphabets26[i];
           if (input.indexOf(letter) > -1)
               icount++;
       }
       if (icount > 0)
           return true;
       else
           return false;
}

router.post('/complete_profile', upload.any(), function(req, res) {
    if(req.files.length > 5)
    {
        res.render('set_profile', {username: req.session.username, info: "", bad_image: "", large_amount_of_uploads: "true"});
    }
    else
    {
        if (req.session.user_id)
        {
            if (req.body.long.length == 0 ||  req.body.lat.length == 0)
            {
                var apiCall = unirest('GET', 'https://get.geojs.io/v1/ip');
                
                apiCall.end((response) => {
                    if (response.body.length > 0)
                    {
                        console.log("this far");
                        ip_loc.getDomainOrIPDetails(response.body, 'json', (err, data) => {
                            if (err)
                                res.send("An error has occured!");
                            else
                            {
                                req.body.long = data.lon;
                                req.body.lat = data.lat;
                        
                                if (req.body.submit == "next")
                                {
                                    if (typeof req.body.prefence != "undefined")
                                    {
                                        var prefence = "bi-sexual";
                                    }
                                    else
                                    {
                                        var prefence = req.body.prefence;
                                    }
                                    var interests = "";
                                    if (req.body.interest1)
                                        interests += "#"+req.body.interest1;
                                    if (req.body.interest2)
                                        interests += "#"+req.body.interest2;
                                    if (req.body.interest3)
                                        interests += "#"+req.body.interest3;
                                    if (req.body.interest4)
                                        interests += "#"+req.body.interest4;
                                    if (req.body.interest5)
                                        interests += "#"+req.body.interest5;
                                    if ((req.body.prefence != undefined) && (req.body.gender != undefined) && (req.body.bio != "") && (req.session.username) && (req.body.distance != "") && (interests != "") && (allLetter(req.body.age) != true) && (allLetter(req.body.distance)))
                                    {
                                        db.query('SELECT * FROM ghost_mode WHERE user_id = ?', [req.session.user_id], (err, ghost_mode) => {
                                            if (err)
                                                res.send('An error has occured!');
                                            else if (ghost_mode.length > 0)
                                            {
                                                db.query('DELETE FROM ghost_mode WHERE user_id = ?', [req.session.user_id], (err, deleted) => {
                                                    if (err)
                                                        res.send('An error has occured!');
                                                    else
                                                    {
                                                        console.log("If we reach here, it means that we deleted the ghost_user");
                                                        db.query('UPDATE user_profile set gender = ?, age = ?, prefence = ?, bio = ?, preferred_distance = ?, longitude = ?, latitude = ?, user_interests = ?, profile_pic = ?, fame_rating = ?, date_of_last_connection = ? WHERE user_id = ?', [req.body.gender, req.body.age, req.body.prefence, req.body.bio, req.body.distance, req.body.long, req.body.lat, interests, "Not_staged", 0, get_date(), req.session.user_id]);
                                                        console.log("Know we are posting the user to user_profiles.");
                                                        if (req.files.length > 0)
                                                        {
                                                            let postImages = new Objects(req.session.user_id, req.files);
                                                            postImages.check();
                                                            if (postImages.bad_image == 0)
                                                            {
                                                                postImages.post();
                                                                res.redirect('/set_profile_pic');
                                                            }
                                                            else
                                                            {
                                                                res.render('set_profile', {username: req.session.username, info: "", bad_image: "bad_image", large_amount_of_uploads: ""});
                                                            }
                                                        }
                                                        else
                                                            res.redirect('./profile');
                                                    }
                                                })
                                            }
                                            else
                                            {
                                                db.query('INSERT INTO user_profile (user_id, gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.session.user_id, req.body.gender, req.body.age, req.body.prefence, req.body.bio, req.body.distance, req.body.long, req.body.lat, interests, "Not_staged", 0, get_date()], (err, succ) => {
                                                    if (err)
                                                        res.send(err);
                                                    else if (req.files.length > 0)
                                                    {
                                                        let postImages = new Objects(req.session.username, req.files);
                                                        postImages.check();
                                                        if (postImages.bad_image == 0)
                                                        {
                                                            postImages.post();
                                                            res.redirect('/set_profile_pic');
                                                        }
                                                        else
                                                        {
                                                            res.render('set_profile', {username: req.session.username, info: "", bad_image: "bad_image", large_amount_of_uploads: ""});
                                                        }
                                                    }
                                                    else
                                                        res.redirect('./profile');
                                                });
                                            }
                                        })
                                    }
                                    else
                                    {
                                        res.render("set_profile", {username: req.session.username, info: "incomplete", bad_image: "", large_amount_of_uploads: ""});
                                    }
                                }
                                else if (req.body.submit == "skip")
                                {
                                    //first check if the user is already ghosted.
                                    db.query("SELECT * FROM user_profile WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                                        if (err)
                                        {
                                            res.send(err);
                                        }
                                        else if (succ.length > 0)
                                        {
                                            //user is already ghosted
                                            res.redirect("/profile");
                                        }
                                        else
                                        {
                                            //ghost the user.
                                            console.log(req.body.submit);
                                            db.query('INSERT INTO user_profile (user_id, gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ["Not_staged", 0, "Not_staged", "Not_staged", 0, req.body.long, req.body.lat, "Not_staged", "Not_staged", 0, get_date()], (err, succ) => {
                                                if (err)
                                                    res.send(err);
                                                else
                                                {
                                                    db.query("INSERT INTO ghost_mode (user_id) VALUES (?)", [req.session.user_id], (err, succ) => {
                                                        if (err)
                                                            res.send("An error has occured!");
                                                        else
                                                        {
                                                            res.redirect("/profile");
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
            else
            {
                if (req.body.submit == "next")
                {
                    if (typeof req.body.prefence != "undefined")
                    {
                        var prefence = "bi-sexual";
                    }
                    else
                    {
                        var prefence = req.body.prefence;
                    }
                    var interests = "";
                    if (req.body.interest1)
                        interests += "#"+req.body.interest1;
                    if (req.body.interest2)
                        interests += "#"+req.body.interest2;
                    if (req.body.interest3)
                        interests += "#"+req.body.interest3;
                    if (req.body.interest4)
                        interests += "#"+req.body.interest4;
                    if (req.body.interest5)
                        interests += "#"+req.body.interest5;
                    if ((req.body.prefence != undefined) && (req.body.gender != undefined) && (req.body.age != "") && (req.body.bio != "") && (req.session.username) && (req.body.distance != "") && (interests != ""))
                    {
                        db.query('SELECT * FROM ghost_mode WHERE user_id = ?', [req.session.user_id], (err, ghost_mode) => {
                            if (err)
                                res.send('An error has occured!');
                            else if (ghost_mode.length > 0)
                            {
                                db.query('DELETE FROM ghost_mode WHERE user_id = ?', [req.session.user_id], (err, deleted) => {
                                    if (err)
                                        res.send('An error has occured!');
                                    else
                                    {
                                        console.log("If we reach here, it means that we deleted the ghost_user");
                                        db.query('UPDATE user_profile SET gender = ?, age = ?, prefence = ?, bio = ?, preferred_distance = ?, longitude = ?, latitude = ?, user_interests = ?, profile_pic = ?, fame_rating = ?, date_of_last_connection = ? WHERE user_id = ?', [req.body.gender, req.body.age, req.body.prefence, req.body.bio, req.body.distance, req.body.long, req.body.lat, interests, "Not_staged", 0, get_date(), req.session.user_id]);
                                        console.log("Know we are posting the user to user_profiles.");
                                        if (req.files.length > 0)
                                        {
                                            let postImages = new Objects(req.session.user_id, req.files);
                                            postImages.check();
                                            if (postImages.bad_image == 0)
                                            {
                                                postImages.post();
                                                res.redirect('/set_profile_pic');
                                            }
                                            else
                                            {
                                                res.render('set_profile', {username: req.session.username, info: "", bad_image: "bad_image", large_amount_of_uploads: ""});
                                            }
                                        }
                                        else
                                            res.redirect('./profile');
                                    }
                                })
                            }
                            else
                            {
                                db.query('INSERT INTO user_profile (user_id, gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.session.user_id, req.body.gender, req.body.age, req.body.prefence, req.body.bio, req.body.distance, req.body.long, req.body.lat, interests, "Not_staged", 0, get_date()], (err, succ) => {
                                    if (err)
                                        res.send(err);
                                    else if (req.files.length > 0)
                                    {
                                        let postImages = new Objects(req.session.user_id, req.files);
                                        postImages.check();
                                        if (postImages.bad_image == 0)
                                        {
                                            postImages.post();
                                            res.redirect('/set_profile_pic');
                                        }
                                        else
                                        {
                                            res.render('set_profile', {username: req.session.username, info: "", bad_image: "bad_image", large_amount_of_uploads: ""});
                                        }
                                    }
                                    else
                                        res.redirect('./profile'); 
                                });
                            }
                        })
                    }
                    else
                    {
                        res.render("set_profile", {username: req.session.username, info: "incomplete", bad_image: "", large_amount_of_uploads: ""});
                    }
                }
                else if (req.body.submit == "skip")
                {
                    //first check if  user is already ghosted
                    db.query("SELECT * FROM user_profile WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                        if (err)
                        {
                            res.send(err);
                        }
                        else if (succ.length > 0)
                        {
                            //user already a ghost
                            res.redirect("/profile");
                        }
                        else
                        {
                            //ghost the user.
                            console.log(req.body.submit);
                            db.query('INSERT INTO user_profile (user_id, gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.session.user_id, "Not_staged", 0, "Not_staged", "Not_staged", 0, req.body.long, req.body.lat, "Not_staged", "Not_staged", 0, get_date()], (err, succ) => {
                                if (err)
                                    res.send(err);
                                else
                                {
                                    db.query("INSERT INTO ghost_mode (user_id) VALUES (?)", [req.session.user_id], (err, succ) => {
                                        if (err)
                                            res.send("An error has occured!");
                                        else
                                        {
                                            res.redirect("/profile");
                                        }
                                    })
                                }
                            });
                        }
                    })
                }
            }
        }
        else
            res.redirect('/login')
    }
});

module.exports = router;