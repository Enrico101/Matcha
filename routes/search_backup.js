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

router.get('/search', (req, res) => {
    //for when we select search via link, because it would be a get requets!
    db.query("SELECT * FROM ghost_mode WHERE username = ?", [req.session.username], (err, succ) => {
        if (err)
            res.send("An error has occured!")
        else if (succ.length > 0) 
            res.render('search', {results: "", info: "user is ghosted"});
        else
            res.render('search', {results: "", info: ""});

    })
})
router.post('/search', (req, res) => {
    db.query("SELECT * FROM user_profile WHERE username != ?", [req.session.username], (err1, users) => {
        if (err1)
        {
            res.send("An error has occured");
        }
        else
        {
            db.query("SELECT * FROM user_profile WHERE username = ?", [req.session.username], (err2, my_info) => {
                if (err2)
                {
                    res.send("An error has occured");
                }
                else
                {
                    let x = 0;
                    let age_start = Number(req.body.age_start);
                    let age_end = Number(req.body.age_end);
                    let location = Number(req.body.location);
                    let interest1 = req.body.interest1;
                    let interest2 = req.body.interest2;
                    let interest3 = req.body.interest3;
                    let interest4 = req.body.interest4;
                    let interest5 = req.body.interest5;
                    function Users(profile_pic, gender, age, prefence, bio, username, preferred_distance, longitude, latitude, user_interests, distance_from_me)
                    {
                        this.profile_pic = profile_pic,
                        this.gender = gender,
                        this.age = age,
                        this.prefence = prefence,
                        this.bio = bio,
                        this.username = username,
                        this.preferred_distance = preferred_distance
                        this.longitude = longitude,
                        this.latitude = latitude
                        this.user_interests = user_interests;
                        this.distance_from_me = distance_from_me;
                    }
                    while (users[x])
                    {
                        var meters = geo_tools.distanceTo({lat: my_info[0].latitude, lon: my_info[0].longitude}, {lat: users[x].latitude, lon: users[x].longitude});
                        var kilometers = meters / 1000;
                        users[x].distance_from_me = kilometers;
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
                    if (location)
                    {
                        let x = 0;
                        while (users[x])
                        {
                            let distance = Math.trunc(users[x].distance_from_me);
                            if (location != distance)
                            {
                                users[x] = "Dont";
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
                    //-------------------------------------
                    let e = 0;
                    let f = 0;
                    let users_sort = [];
                    while (users[e])
                    {
                        if (users[e] != "Dont")
                        {
                            users_sort[f] = new Users(users[e].profile_pic, users[e].gender, users[e].age, users[e].prefence, users[e].bio, users[e].username, users[e].preferred_distance, users[e].longitude, users[e].latitude, users[e].user_interests, users[e].distance_from_me);
                            f++;
                        }
                        e++;
                    }
                    //-------------------------------------
                    //sorting
                    if (req.body.submit == "sort")
                    {
                    /*   let e = 0;
                        let f = 0;
                        let users_sort = [];*/
                        console.log("Sorting");
                        let results = req.body.user_2;
                        console.log(results);
                    /*    while (users[e])
                        {
                            if (users[e] != "Dont")
                            {
                                users_sort[f] = new Users(users[e].profile_pic, users[e].gender, users[e].age, users[e].prefence, users[e].bio, users[e].username, users[e].preferred_distance, users[e].longitude, users[e].latitude, users[e].user_interests, users[e].distance_from_me);
                                f++;
                            }
                            e++;
                        }*/
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
                    //Filter by age
                    if (req.body.submit == "filter")
                    {
                        console.log("filtering");
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
                                if (measure != interest_array.length)
                                {
                                    users_sort[x] = "Dont";
                                }
                                x++;
                            }
                        }
                        //This is for the user who should not view any ghost_mode people
                        let i = 0;
                        while (users_sort[i])
                        {
                            if (users_sort[i].gender == 'Not_staged')
                            {
                                users_sort[i] = 'Dont';
                            }
                            i++;
                        }
                    }
                    //This is for the user who is already ghosted, he can only view people.
                    db.query("SELECT * FROM ghost_mode WHERE username = ?", [req.session.username], (err, succ) => {
                        if (err)
                            res.send("An error has occured!");
                        else if (succ.length > 0)
                        {
                            res.render('search', {results: users_sort, info: "User is ghosted!"});
                        }
                        else
                            res.render('search', {results: users_sort, info: ""});
                    })
                }
            })
        }
    })
})

module.exports = router;