//checked
const express = require('express');
var session = require('express-session');
var db = require('../database');
var bodyParser = require('body-parser');
var Objects = require('../objects');
var update_username_obj = require('../update_username_obj');
var geo_tools = require('geolocation-utils');
var multer = require('multer');
var unirest = require('unirest');
var ip_loc = require('ip-locator');
const bcrypt = require('bcrypt-nodejs');

var router = express.Router();
var uploads = multer({dest: "Uploads"});

var secretString = Math.floor((Math.random() * 10000) + 1);
router.use(session({
    secret: secretString.toString(),
    resave: false,
    saveUninitialized: false
}));
router.use(bodyParser.urlencoded({
    extended: 'true'
}));
const salt_rounds = 10;

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

router.get('/', (req, res) => {
    if (req.session.user_id)
    {
        db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, results) => {
            db.query("SELECT * FROM messages", (err, messages) => {
                if (req.session.search_results_modifiable)
                {
                    req.session.search_results_backup = "";
                    req.session.search_results_modifiable = "";
                }
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
                req.session.unread_message = unread_message;
                res.render("profile_settings_index", {unread_message: unread_message});
            })
        })
    }
    else
        res.redirect('/login');
})

router.get('/change_profile_pic', (req, res) => {
    if (req.session.user_id)
    {
        db.query("SELECT * FROM images WHERE user_id = ?", [req.session.user_id], (err, images) => {
            if (err)
                res.send("An error has occured!");
            else if (images.length > 0)
            {
                db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id = ?", [req.session.user_id], (err, user_info) => {
                    if (err)
                        res.send ("An error has occurred!");
                    else if (user_info.length > 0)
                    {
                        let x = 0;
                        
                        while (images[x])
                        {
                            let path = "..\\";
                            let full_path = path.concat(images[x].image);
                            images[x].image = full_path;
                            x++;
                        }
                        res.render('change_profile_pic', {images_stock: images, images_edit: images, user_info: user_info, unread_message: req.session.unread_message});
                    }
                })
            }
            else
            {
                res.render('change_profile_pic', {images_stock: "", images_edit: "", user_info: "", unread_message: req.session.unread_message});
            }
        })
    }
    else
        res.redirect('/login');
})

router.post('/change_profile_pic', (req, res) => {
    if (req.session.user_id)
    {
        if (req.body.set_this_pic)
        {
            db.query("UPDATE user_profile SET profile_pic = ? WHERE user_id = ?", [req.body.set_this_pic, req.session.user_id], (err, succ) => {
                if (err)
                    res.send("An error has occured!");
                else
                    res.redirect('/profile_settings');
            })
        }
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

router.get('/upload_images', (req, res) => {
    if (req.session.user_id)
    {
        db.query("SELECT * FROM images WHERE user_id = ?", [req.session.user_id], (err, images) => {
            if (err)
                res.send("An error has occurred!");
            else
            {
                let image_upload_limit = 5;
                image_upload_limit -= images.length;
    
                res.render("upload_images", {image_upload_limit: image_upload_limit,  amount: "", uploaded_images: "", unread_message: req.session.unread_message});
            }
        })
    }
    else
        render('login', {info: "", verified: "", login: ""});
})

router.post ('/upload_images', uploads.any(), (req, res) => {
    if (req.session.username)
    {
        console.log(req.files);
        db.query("SELECT * FROM images WHERE user_id = ?", [req.session.user_id], (err, images) => {
            let image_upload_limit = 5;
            image_upload_limit -= images.length;
    
            if (err)
                res.send("An error has occured!");
            else if (req.files.length <= image_upload_limit)
            {
                let post = new Objects(req.session.user_id, req.files);
                post.check();
                if (post.bad_image == 0)
                {
                    post.post();
                    res.render('upload_images', {image_upload_limit: image_upload_limit, amount: "", uploaded_images: "yes", unread_message: req.session.unread_message})
                }
                else
                {
                    res.render('upload_images', {image_upload_limit: image_upload_limit, amount: "", uploaded_images: "no", unread_message: req.session.unread_message})
                }


                /*var post = new Objects(req.session.username, req.files);
                post.post();
                res.render('upload_images', {image_upload_limit: image_upload_limit, amount: "", uploaded_images: "yes", unread_message: req.session.unread_message})*/
            }
            else
            {
                res.render('upload_images', {image_upload_limit: image_upload_limit, amount: "To much images", uploaded_images: "", unread_message: req.session.unread_message})
            }
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

router.get('/update_username', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_username', {updated_username: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_username', (req, res) => {
    if (req.body.user_id && req.body.submit)
    {
        console.log("here");
        let user_id = req.body.user_id;

        if (user_id.length > 0)
        {
            let update_username_users_username = new update_username_obj("users", "username", req.session.username, req.body.username);
            update_username_users_username.update();
            req.session.username = req.body.username;
            res.render('update_username', {updated_username: "yes", unread_message: req.session.unread_message});
        }
        else
        {
            res.render('update_username', {updated_username: "", unread_message: req.session.unread_message});
        }
    }
    else
    {
        res.render('update_username', {updated_username: "", unread_message: req.session.unread_message})
    }
})

router.get('/update_firstname', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_firstname', {updated_firstname: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_firstname', (req, res) => {
    if (req.body.firstname && req.body.submit)
    {
        let firstname = req.body.firstname;

        if (firstname.length > 0)
        {
            db.query("UPDATE users SET firstname = ? WHERE user_id = ?", [firstname, req.session.user_id], (err, succ) => {
                if (err)
                    res.send("An error has occured");
                else
                {
                    res.render('update_firstname', {updated_firstname: "yes", unread_message: req.session.unread_message});
                }
            })
        }
        else
            res.render('update_firstname', {updated_firstname: "", unread_message: req.session.unread_message});
    }
    else
        res.render('update_firstname', {updated_firstname: "", unread_message: req.session.unread_message});
})

router.get('/update_lastname', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_lastname', {updated_lastname: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_lastname', (req, res) => {
    if (req.body.lastname && req.body.submit)
    {
        let lastname = req.body.lastname;

        if (lastname.length > 0)
        {
            db.query("UPDATE users SET lastname = ? WHERE user_id = ?", [lastname, req.session.user_id], (err, succ) => {
                if (err)
                    res.send("An error has occured");
                else
                {
                    res.render('update_lastname', {updated_lastname: "yes", unread_message: req.session.unread_message});
                }
            })
        }
        else
            res.render('update_lastname', {updated_lastname: "", unread_message: req.session.unread_message});
    }
    else
        res.render('update_lastname', {updated_lastname: "", unread_message: req.session.unread_message});
})

router.get('/update_password', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_password', {empty_field: "", incorrect_length: "", incorrect_format: "", updated_password: "", incorrect_old_pass: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_password', (req, res) => {
    if (req.body.old_pass.length > 0)
    {
        db.query("SELECT * FROM users WHERE user_id = ?", [req.session.user_id], (err, succ) => {
            if (err)
                console.log(err);
            else if (succ.length > 0)
            {
                if (bcrypt.compareSync(req.body.old_pass, succ[0].password))
                {
                    var password = req.body.new_pass;
                    if (password != "")
                    {
                        if (password.length > 6)
                        {
                            let m1 = password.match('[a-z]');
                            let m2 = password.match('[A-Z]');
                            let m3 = password.match('[0-9]');
                            if (m1 && m2 && m3)
                            {
                                //encrypt passwords
                                const salt = bcrypt.genSaltSync(salt_rounds);
                                const hash = bcrypt.hashSync(password, salt);

                                db.query("UPDATE users SET password = ? WHERE user_id = ?", [hash, req.session.user_id], (err, succ) => {
                                    if (err)
                                        console.log(err);
                                })
                                res.render('update_password', {empty_field: "", incorrect_length: "", incorrect_format: "", updated_password: "yes", unread_message: req.session.unread_message})
                            }
                            else
                                res.render('update_password', {empty_field: "", incorrect_length: "", incorrect_format: "yes", updated_password: "", incorrect_old_pass: "", unread_message: req.session.unread_message})
                        }
                        else
                            res.render('update_password', {empty_field: "", incorrect_length: "yes", incorrect_format: "", updated_password: "", incorrect_old_pass: "", unread_message: req.session.unread_message})
                    }
                    else
                        res.render('update_password', {empty_field: "yes", incorrect_length: "", incorrect_format: "", updated_password: "", incorrect_old_pass: "", unread_message: req.session.unread_message})
                }
                else
                {
                    res.render('update_password', {empty_field: "", incorrect_length: "", incorrect_format: "", updated_password: "", incorrect_old_pass: "yes", unread_message: req.session.unread_message});
                }
            }
        })
    }
    else
    {
        res.render('update_password', {empty_field: "", incorrect_length: "", incorrect_format: "", updated_password: "", incorrect_old_pass: "yes", unread_message: req.session.unread_message});
    }
})

router.get('/update_email', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_email', {updated_email: "", empty_field: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_email', (req, res) => {
    let email = req.body.email;
    if (email.length > 0 && email.indexOf('@') != -1)
    {
        db.query("UPDATE users SET email = ? WHERE user_id = ?", [email, req.session.user_id], (err, succ) => {
            if (err)
                console.log(err);
        })
        res.render('update_email', {updated_email: "yes", empty_field: "", unread_message: req.session.unread_message});
    }
    elses
        res.render('update_email', {updated_email: "", empty_field: "yes", unread_message: req.session.unread_message});
})

router.get('/update_prefence', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_prefence', {updated_prefence: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_prefence', (req, res) => {
    if (req.body.prefence)
    {
        let prefence = req.body.prefence;
        if (prefence.length > 0)
        {
            if (prefence == "men" || prefence == "women" || prefence == "other")
            {
                db.query("UPDATE user_profile SET prefence = ? WHERE user_id = ?", [prefence, req.session.user_id], (err, succ) => {
                    if (err)
                        console.log(err);
                })
                res.render('update_prefence', {updated_prefence: "yes", unread_message: req.session.unread_message});
            }
        }
    }
    else
        res.render('update_prefence', {updated_prefence: "", unread_message: req.session.unread_message});
})

router.get('/update_bio', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_bio', {updated_bio: "", unread_message: req.session.unread_message})
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_bio', (req, res) => {
    if (req.body.bio)
    {
        let bio = req.body.bio;
        if (bio.length > 0)
        {
            db.query("UPDATE user_profile SET bio = ? WHERE user_id = ?", [bio, req.session.user_id], (err, succ) => {
                if (err)
                    console.log(err);
            })
            res.render('update_bio', {updated_bio: "yes", empty_field: "", unread_message: req.session.unread_message});
        }
        else
            res.render('update_email', {updated_bio: "", empty_field: "yes", unread_message: req.session.unread_message});
    }
    else
        res.render('update_email', {updated_bio: "", empty_field: "yes", unread_message: req.session.unread_message});
})

router.get('/update_interests', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_interests', {updated_interests: "", empty_field: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_interests', (req, res) => {

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
    if (interests != "")
    {
        db.query("UPDATE user_profile SET user_interests = ? WHERE user_id = ?", [interests, req.session.user_id], (err, succ) => {
            if (err)
                console.log(err);
        })
        res.render('update_interests', {updated_interests: "yes", empty_field: "", unread_message: req.session.unread_message});
    }
    else
        res.render('update_interests', {updated_interests: "", empty_field: "yes", unread_message: req.session.unread_message});
})

router.get('/update_preferred_distance', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_preferred_distance', {updated_preferred_distance: "", empty_field: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_preferred_distance', (req, res) => {
    if (req.body.preferred_distance)
    {
        let preferred_distance = req.body.preferred_distance;
        let result = allLetter(preferred_distance);

        if (preferred_distance.length > 0 && result != true)
        {
            db.query("UPDATE user_profile SET preferred_distance = ? WHERE user_id = ?", [preferred_distance, req.session.user_id], (err, succ) => {
                if (err)
                    console.log(err);
            })
            res.render('update_preferred_distance', {updated_preferred_distance: "yes", empty_field: "",unread_message: req.session.unread_message});
        }
        else
            res.render('update_preferred_distance', {updated_preferred_distance: "", empty_field: "yes", unread_message: req.session.unread_message});
    }
    else
        res.render('update_preferred_distance', {updated_preferred_distance: "", empty_field: "yes", unread_message: req.session.unread_message});
})
router.get('/update_age', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_age', {updated_age: "", empty_field: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_age', (req, res) => {
    if (req.body.age)
    {
        let age = req.body.age;
        let result = allLetter(age);
        if (age.length > 0 && result != true)
        {
            db.query("UPDATE user_profile SET age = ? WHERE user_id = ?", [age, req.session.user_id], (err, succ) => {
                if (err)
                    console.log(err);
            })
            res.render('update_age', {updated_age: "yes", empty_field: "", unread_message: req.session.unread_message});
        }
        else
            res.render('update_age', {updated_age: "", empty_field: "yes", unread_message: req.session.unread_message});
    }
    else
        res.render('update_age', {updated_age: "", empty_field: "yes", unread_message: req.session.unread_message});
})

router.get('/update_location', (req, res) => {
    if (req.session.user_id)
    {
        res.render('update_location', {updated_location: "", unread_message: req.session.unread_message});
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})
router.post('/update_location', (req, res) => {
    if (req.body.long.length == 0 || req.body.lat.length == 0)
    {
        var apiCall = unirest('GET', 'https://get.geojs.io/v1/ip');

        apiCall.end((response) => {
            if (response.body.length > 0)
            {
                ip_loc.getDomainOrIPDetails(response.body, 'json', (err, data) => {
                    if (err)
                        res.send("An error has occured!");
                    else
                    {
                        console.log(data);
                        db.query("UPDATE user_profile SET longitude = ? WHERE user_id = ?", [data.lon, req.session.user_id], (err, succ) => {
                            if (err)
                                console.log(err);
                        })
                        db.query("UPDATE user_profile SET latitude = ? WHERE user_id = ?", [data.lat, req.session.user_id], (err, succ) => {
                            if (err)
                                console.log(err);
                        })
                        res.render('update_location', {updated_location: "yes", unread_message: req.session.unread_message});
                    } 
                })
            }
        })
    }
    else
    {
        db.query("UPDATE user_profile SET longitude = ? WHERE user_id = ?", [req.body.long, req.session.user_id], (err, succ) => {
            if (err)
                console.log(err);
        })
        db.query("UPDATE user_profile SET latitude = ? WHERE user_id = ?", [req.body.lat, req.session.user_id], (err, succ) => {
            if (err)
                console.log(err);
        })
        res.render('update_location', {updated_location: "yes", unread_message: req.session.unread_message});
    }
})

module.exports = router;