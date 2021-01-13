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

router.get('/', (req, res) => {
    //for when we select search via link, because it would be a get requets!
    if (req.session.user_id)
    {
        //checking for unread_messages
        db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, results) => {
            db.query("SELECT * FROM messages", (err, messages) => {
                db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                    if (err)
                        res.send("An error has occured!")
                    else if (succ.length > 0) 
                        res.render('search', {results: "", info: "user is ghosted"});
                    else
                    {
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
                        res.render('search', {results: "", info: "", unread_message: unread_message});
                    }
                })
            })
        })
    }
    else
        res.redirect('/login');
})

router.post('/', (req, res) => {
    if (req.session.user_id)
    {
        db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id != ?", [req.session.user_id], (err1, users) => {
            if (err1)
            {
                res.send("klfdkl;fdlkdsf;lkfsdsfd   An error has occured");
            }
            else
            {
                db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                    db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id = ?", [req.session.user_id], (err2, my_info) => {
                        if (err2)
                        {
                            res.send("29298398382 An error has occured");
                        }
                        else
                        {
                            let x = 0;
                            let age_start = Number(req.body.age_start);
                            let age_end = Number(req.body.age_end);
                            let fame_start = Number(req.body.fame_start);
                            let fame_end = Number(req.body.fame_end);
                            let location = Number(req.body.location);
                            let interest1 = req.body.interest1;
                            let interest2 = req.body.interest2;
                            let interest3 = req.body.interest3;
                            let interest4 = req.body.interest4;
                            let interest5 = req.body.interest5;
                            function Users(profile_pic, gender, age, prefence, bio, username, preferred_distance, longitude, latitude, user_interests, distance_from_me, fame_rating, user_id)
                            {
                                this.profile_pic = profile_pic,
                                this.gender = gender,
                                this.age = age,
                                this.prefence = prefence,
                                this.bio = bio,
                                this.username = username,
                                this.preferred_distance = preferred_distance
                                this.longitude = longitude,
                                this.latitude = latitude,
                                this.user_interests = user_interests,
                                this.distance_from_me = distance_from_me,
                                this.fame_rating = fame_rating,
                                this.user_id = user_id
                            }
                            let y = 0;
                            while (users[y]) {
                                let z = 0;
                                while (succ[z])
                                {
                                    //console.log("User: "+succ[z].likes+" "+"Status: "+succ[z].status+" username: "+users[y].username);
                                    //if ((succ[z].likes == users[y].username) && succ[z].status == "blocked")
                                    //console.log(succ[z].status == "blocked");
                                    if (req.session.user_id == succ[z].user_id && users[y].user_id == succ[z].likes && succ[z].status == "blocker")
                                    {
                                        users[y] = "Dont";
                                    }
                                    z++;
                                }
                                y++;
                            }
                            while (users[x])
                            {
                                if (users[x] != "Dont")
                                {
                                    var meters = geo_tools.distanceTo({lat: my_info[0].latitude, lon: my_info[0].longitude}, {lat: users[x].latitude, lon: users[x].longitude});
                                    var kilometers = meters / 1000;
                                    users[x].distance_from_me = Math.trunc(kilometers);
                                }
                                x++;
                            };
                            if (age_start && age_end)
                            {
                                let x = 0;
                                while (users[x])
                                {
                                    console.log(age_start+" "+age_end);
                                    if (users[x].age >= age_start && users[x].age <= age_end)
                                    {
                                    }
                                    else
                                    {
                                        users[x] = "Dont";
                                    }
                                    x++;
                                }
                            }
                            if (fame_start && fame_end)
                            {
                                let x = 0;
                                while (users[x])
                                {
                                    console.log(fame_start+" "+fame_end);
                                    if (users[x].fame_rating >= fame_start && users[x].fame_rating <= fame_end)
                                    {
                                    }
                                    else
                                    {
                                        users[x] = "Dont";
                                    }
                                    x++;
                                }
                            }
                            if (location)
                            {
                                let x = 0;
                                while (users[x])
                                {
                                    if (users[x] != "Dont")
                                    {
                                        let distance = Math.trunc(users[x].distance_from_me);
                                        if (location != distance)
                                        {
                                            users[x] = "Dont";
                                        }
                                    }
                                    x++;
                                }
                            }
                            if (interest1 || interest2 || interest3 || interest4 || interest5)
                            {
                                let x = 0;
                                let user_interests = [];
                                if (interest1)
                                    user_interests.push(interest1);
                                if (interest2)
                                    user_interests.push(interest2);
                                if (interest3)
                                    user_interests.push(interest3);
                                if (interest4)
                                    user_interests.push(interest4);
                                if (interest5)
                                    user_interests.push(interest5);
                                x = 0;
                                while (users[x])
                                {
                                    if (users[x] != "Dont")
                                    {
                                        let y = 1
                                        let count = 0;
                                        let interests = users[x].user_interests.split("#");
                                        while (interests[y])
                                        {
                                            let z = user_interests.indexOf(interests[y]);
                                            if (z != -1)
                                            {
                                                count++;
                                            }
                                            y++;
                                        }
                                        if (count != user_interests.length)
                                        {
                                            users[x] = "Dont";
                                        }
                                    }
                                        x++;                       
                                }
                            }
                            let e = 0;
                            let f = 0;
                            let users_sort = [];
                            while (users[e])
                            {
                                if (users[e] != "Dont")
                                {
                                    users_sort[f] = new Users(users[e].profile_pic, users[e].gender, users[e].age, users[e].prefence, users[e].bio, users[e].username, users[e].preferred_distance, users[e].longitude, users[e].latitude, users[e].user_interests, users[e].distance_from_me, users[e].fame_rating, users[e].user_id);
                                    f++;
                                }
                                e++;
                            }
                            let i = 0;
                            while (users_sort[i])
                            {
                                if (users_sort[i].gender == 'Not_staged')
                                {
                                    users_sort[i] = 'Dont';
                                }
                                i++;
                            }
                             //This is for the user who is already ghosted, he can only view people.
                             db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                                if (err)
                                    res.send("An error has occured!");
                                else if (succ.length > 0)
                                {
                                    req.session.search_results_backup = users_sort;
                                    req.session.search_results_modifiable = users_sort;
                                    res.render('search', {results: users_sort, info: "user is ghosted", unread_message: req.session.unread_message});
                                }
                                else
                                {
                                    req.session.search_results_backup = users_sort;
                                    req.session.search_results_modifiable = users_sort;
                                    res.render('search', {results: users_sort, info: "", unread_message: req.session.unread_message});
                                }
                            })
                        }
                    });
                })
            }
        });
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
});

router.post('/sort_results', (req, res) => {
    if (req.session.user_id)
    {
        db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id = ?", [req.session.user_id], (err2, my_info) => {
            if (err2)
                res.send("An error has occured!");
            else
            {
                if (req.body.submit == "unsort")
                {
                    let results_backup = req.session.search_results_backup;
                    req.session.search_results_modifiable = results_backup;
                    
                    res.render('search', {results: results_backup, info: ""});
                }
                else if (req.session.search_results_modifiable)
                {
                    let users_sort = req.session.search_results_modifiable;
                    if (req.body.submit == "sort")
                    {
                        if (req.body.age_sort)
                        {
                            if (req.body.age_sort == "asc")
                            {
                                console.log("asc");
                                users_sort.sort((a, b) => {
                                if (a.age > b.age)
                                    return 1;
                                else if (a.age < b.age)
                                    return -1;
                                return -1;
                                });
                            }
                            else if (req.body.age_sort == "desc")
                            {
                                console.log("desc");
                                users_sort.sort((a, b) => {
                                if (a.age > b.age)
                                    return -1;
                                else if (a.age < b.age)
                                    return 1;
                                return -1;
                                });
                            }
                        }
                        if (req.body.location_sort)
                        {
                            if (req.body.location_sort == "asc")
                            {
                                users_sort.sort((a, b) => {
                                    if (a.distance_from_me > b.distance_from_me)
                                        return 1;
                                    else if (a.distance_from_me < b.distance_from_me)
                                        return -1;
                                    return -1;
                                    });
                            }
                            else if (req.body.location_sort == "desc")
                            {
                                users_sort.sort((a, b) => {
                                    if (a.distance_from_me > b.distance_from_me)
                                        return -1;
                                    else if (a.distance_from_me < b.distance_from_me)
                                        return 1;
                                    return -1;
                                    });
                            }
                        }
                        if (req.body.fame_sort)
                        {
                            if (req.body.fame_sort == "asc")
                            {
                                users_sort.sort((a, b) => {
                                    if (a.fame_rating > b.fame_rating)
                                    {
                                        return 1;
                                    }
                                    else if (a.fame_rating < b.fame_rating)
                                        return -1;
                                    return -1;
                                });
                            }
                            else if (req.body.fame_sort == "desc")
                            {
                                users_sort.sort((a, b) => {
                                    if (a.fame_rating > b.fame_rating)
                                        return -1;
                                    else if (a.fame_rating < b.fame_rating)
                                        return 1;
                                    return -1;
                                });
                            }
                        }
                        if (req.body.tags_sort)
                        {
                            let t = 0;
                            while (users_sort[t])
                            {
                                let count = 0;
                                let s = 1;
                                let my_interests = my_info[0].user_interests.split("#");
                                while(my_interests[s])
                                {
                                    let compare = users_sort[t].user_interests.split("#");
                                    let results = compare.indexOf(my_interests[s]);
                                    if (results != -1)
                                        count++;
                                    s++;
                                }
                                users_sort[t].amount_of_common_interests = count;
                                t++;
                            }
                            users_sort.sort((a, b) => {
                                if (req.body.tags_sort == "desc")
                                {
                                    if (a.amount_of_common_interests > b.amount_of_common_interests)
                                        return 1;
                                    else if (a.amount_of_common_interests < b.amount_of_common_interests)
                                        return -1;
                                    return -1;
                                }
                                if (req.body.tags_sort == "asc")
                                {
                                    if (a.amount_of_common_interests > b.amount_of_common_interests)
                                        return -1;
                                    else if (a.amount_of_common_interests < b.amount_of_common_interests)
                                        return 1;
                                    return -1;
                                }
                            })
                        }
                    }
                    req.session.search_results_modifiable = users_sort;
                    res.render('search', {results: users_sort, info: "", unread_message: req.session.unread_message});
                }
                else
                    res.render('search', {results: "", info: "", unread_message: req.session.unread_message}); 
            }
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

router.post('/filter_results', (req, res) => {
    if (req.session.user_id)
    {
        if (req.body.submit == "unfilter")
        {
            let results_backup = req.session.search_results_backup;
            req.session.search_results_modifiable = results_backup;
            
            res.render('search', {results: results_backup, info: "", unread_message: req.session.unread_message});
        }
        else if (req.session.search_results_modifiable)
        {
            let users_sort = req.session.search_results_modifiable;
            let interest1 = req.body.interest1;
            let interest2 = req.body.interest2;
            let interest3 = req.body.interest3;
            let interest4 = req.body.interest4;
            let interest5 = req.body.interest5;
            
            if (req.body.submit == "filter")
            {
                if (req.body.age_filter)
                {
                    let age_to_filter = req.body.age_filter;
                    let x = 0;
    
                    while (users_sort[x])
                    {
                        if (age_to_filter != users_sort[x].age)
                        {
                            users_sort[x] = "Dont";
                        }
                        x++;
                    }
                }
                if (req.body.location_filter)
                {
                    let location_to_filter = req.body.location_filter;
                    let x = 0;
        
                    while (users_sort[x])
                    {
                        let loc = Math.trunc(users_sort[x].distance_from_me);
                        if (location_to_filter != loc)
                        {
                            users_sort[x] = "Dont";
                        }
                        x++;
                    }
                }
                if (req.body.fame_filter)
                {
                    let fame_to_filter = Number(req.body.fame_filter);
                    let x = 0;
    
                    while (users_sort[x])
                    {
                        if (users_sort[x].fame_rating != fame_to_filter)
                        {
                            console.log(users_sort[x].fame_rating);
                            users_sort[x] = "Dont";
                        }
                        x++;
                    }
                    //res.render("home", {valid_users: modified_users, info: ""});
                    //valid_users_prefence_distance_tags = modified_users;
                }
                if (interest1 || interest2 || interest3 || interest4 || interest5)
                {
                    let x = 0;
                    let interest_array = [];
                    if (interest1)
                        interest_array.push(interest1);
                    if (interest2)
                        interest_array.push(interest2);
                    if (interest3)
                        interest_array.push(interest3);
                    if (interest4)
                        interest_array.push(interest4);
                    if (interest5)
                        interest_array.push(interest5);
                    while (users_sort[x])
                    {
                        let y = 0;
                        let measure = 0;
                        console.log(users_sort[x].user_interests);
                        if (users_sort[x].user_interests != undefined)
                        {
                            let user_interest_compare = users_sort[x].user_interests.split("#");
                            while (interest_array[y])
                            {
                                let val = user_interest_compare.indexOf(interest_array[y]);
                                if (val != -1)
                                {
                                    measure++;
                                }
                                y++;
                            }
                        }
                        if (measure != interest_array.length)
                        {
                            users_sort[x] = "Dont";
                        }
                        x++;
                    }
                }
            }
            req.session.search_results_modifiable = users_sort;
            res.render('search', {results: users_sort, info: "", unread_message: req.session.unread_message});
        }
        else
            res.render('search', {results: "", info: "", unread_message: req.session.unread_message}); 
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

module.exports = router;