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

router.get('/', function(req, res) {
    /*manage bisexuality - ideas
    -As the current user, i need a list of people according to my prefence, so collect all users in the database. ---X
    -Narrow the list down according my sexual prefence. ---X
    -When i get a list of my prefences, the prefences should also have my gender as there prefence. ---X
    -Once done with prefence management, move onto same geographic area, ---X
    -Narrow down the the list of users according to my preferred distance, move on ---X
    -Narrow the list further with common tags, move on ---X
    -I must add a feature to sort list according, age, fame rating or common tags
    -I should add a feature where a can filter according to age, localization, or common tags*/
    if (req.session.user_id) 
    {
        if (req.session.search_results_modifiable)
        {
            req.session.search_results_backup = "";
            req.session.search_results_modifiable = "";
        }
        db.query("SELECT * FROM ghost_mode WHERE user_id = ?", [req.session.user_id], (err, ghost_mode) => {
            if (err)
                res.send("An error has occured!");
            else if (ghost_mode.length > 0)
            {
                res.render('home', {info: "user is ghosted"});
            }
            else
            {
                db.query("SELECT * FROM likes WHERE user_id = ?", [req.session.user_id], (err, succ) => {
                    db.query("SELECT * FROM messages", (err, messages) => {
                        db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id != ?", [req.session.user_id], (err, users) => {
                            if (err)
                                console.log(err);
                            else if (users)
                            {
                                //getting the maximum fame_rating number.
                                db.query("SELECT * FROM users INNER JOIN user_profile ON users.user_id = user_profile.user_id WHERE users.user_id = ?", [req.session.user_id], (err, my_info) => {
                                    var maximum_fame_rating = 0;
                                    var myGender = my_info[0].gender;
                                    var myPrefence = my_info[0].prefence;
                                    var valid_users = [];
                                    var x = 0;
                                    var y = 0;
    
                                    function Users(profile_pic, gender, age, prefence, bio, username, preferred_distance, longitude, latitude, user_interests, fame_rating, status, user_id)
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
                                        this.fame_rating = fame_rating,
                                        this.status = status,
                                        this.user_id = user_id
                                    }
                                    if (myGender == "male")
                                    {
                                        if (myPrefence == "men")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].gender == "male" && users[q].prefence == "men")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }    
                                        }
                                        else if (myPrefence == "women")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].gender == "female" && users[q].prefence == "men")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }
                                        }
                                        else if (myPrefence == "bi-sexual")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].prefence == "men")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }
                                        }
                                    }
                                    else if (myGender == "female")
                                    {
                                        if (myPrefence == "men")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].gender == "male" && users[q].prefence == "women")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }    
                                        }
                                        else if (myPrefence == "women")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].gender == "female" && users[q].prefence == "women")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }
                                        }
                                        else if (myPrefence == "bi-sexual")
                                        {
                                            let q = 0;
                                            while (users[q])
                                            {
                                                if (users[q].prefence == "women")
                                                {
                                                    if (users[q].fame_rating > maximum_fame_rating)
                                                        maximum_fame_rating = users[q].fame_rating;
                                                }
                                                q++;
                                            }
                                        }
                                    }
                                    let minimum_fame_rating = maximum_fame_rating / 2; 
                                    while (users[x])
                                    {
                                        //We first check if the user is blocked and then move on.
                                        let z = 0;
                                        let blocked_user_found = 0;
                                        while (succ[z])
                                        {
                                            if ((users[x].username == succ[z].likes) || (succ[z].status == "blocked"))
                                            {
                                                blocked_user_found++;
                                            }
                                            z++;
                                        }
                                        if (blocked_user_found > 0)
                                        {
                                            //Do nothing which means the user will be skipped
                                        }
                                        else if ((users[x].fame_rating <= maximum_fame_rating) && (users[x].fame_rating >= minimum_fame_rating))
                                        {
                                            if (myPrefence == "women")
                                            {
                                                if (myGender == "male")
                                                {
                                                    if (users[x].gender == "female" && users[x].prefence == "men")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                                else if (myGender == "female")
                                                {
                                                    if (users[x].gender == "female" && users[x].prefence == "women")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age,users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                            }
                                            else if (myPrefence == "men")
                                            {
                                                if (myGender == "male")
                                                {
                                                    if (users[x].gender == "male" && users[x].prefence == "men")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                                else if (myGender == "female")
                                                {
                                                    if (users[x].gender == "male" && users[x].prefence == "women")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                            }
                                            else if (myPrefence == "bi-sexual")
                                            {
                                                if (myGender == "male")
                                                {
                                                    if (users[x].gender == 'male' && users[x].prefence == "male")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                    if (users[x].gender == "female" && users[x].prefence == "male")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                                else if (myGender == "female")
                                                {
                                                    if (users[x].gender == 'male' && users[x].prefence == "female")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                    if (users[x].gender == "female" && users[x].prefence == "female")
                                                    {
                                                        valid_users[y] = new Users(users[x].profile_pic, users[x].gender, users[x].age, users[x].prefence, users[x].bio, users[x].username, users[x].preferred_distance, users[x].longitude, users[x].latitude, users[x].user_interests, users[x].fame_rating, users[x].status, users[x].user_id);
                                                        y++;
                                                    }
                                                }
                                            }
    
                                        }
                                        x++;
                                    }
                                    console.log("stage_1: "+valid_users);
                                    //further narrowing the result from above according to prefered distance.
                                    var a = 0;
                                    var b = 0;
                                    var valid_users_prefence_distance = [];
                                    console.log("---------------------------------------");
                                    while (valid_users[a])
                                    {
                                        var meters = geo_tools.distanceTo({lat: my_info[0].latitude, lon: my_info[0].longitude}, {lat: valid_users[a].latitude, lon: valid_users[a].longitude});
                                        console.log("meters: "+meters);
                                        var kilometers = meters / 1000;
                                        console.log("kilometers: "+kilometers);
                                        console.log("my_preferred_distance: "+my_info[0].preferred_distance);
                                        if (kilometers <= my_info[0].preferred_distance)
                                        {
                                            valid_users_prefence_distance[b] = new Users(valid_users[a].profile_pic, valid_users[a].gender, valid_users[a].age, valid_users[a].prefence, valid_users[a].bio, valid_users[a].username, valid_users[a].preferred_distance, valid_users[a].longitude, valid_users[a].latitude, valid_users[a].user_interests, valid_users[a].fame_rating, valid_users[a].status, valid_users[a].user_id);
                                            b++;
                                        }
                                        a++;
                                    }
                                    console.log("-----------------------------------------");
                                    console.log("stage_2: "+valid_users_prefence_distance);
                                    //further list down by filtering with tags/interests
                                    var valid_users_prefence_distance_tags = [];
                                    var my_interests = my_info[0].user_interests.split("#");
                                    var max_interests = 1;
                                    var c = 0;
                                    var d = 0;
                                    
                                    while (valid_users_prefence_distance[c])
                                    {
                                        var s = 1;
                                        var interest_counter = 0;
                                        var user_interests = [];
                                        user_interests = valid_users_prefence_distance[c].user_interests.split("#");
                                        while (my_interests[s])
                                        {
                                            var result = user_interests.indexOf(my_interests[s]);
                                            if (result != -1)
                                                interest_counter++;
                                            s++;
                                        }
                                        if (interest_counter >= max_interests)
                                        {
                                            valid_users_prefence_distance_tags[d] = new Users(valid_users_prefence_distance[c].profile_pic, valid_users_prefence_distance[c].gender, valid_users_prefence_distance[c].age, valid_users_prefence_distance[c].prefence, valid_users_prefence_distance[c].bio, valid_users_prefence_distance[c].username, valid_users_prefence_distance[c].preferred_distance, valid_users_prefence_distance[c].longitude, valid_users_prefence_distance[c].latitude, valid_users_prefence_distance[c].user_interests, valid_users_prefence_distance[c].fame_rating, valid_users_prefence_distance[c].status, valid_users_prefence_distance[c].user_id);
                                            d++;
                                        }
                                        c++;
                                    }
                                    console.log("stage_3: "+valid_users_prefence_distance_tags);
                                    var z = 0;
                                    while (valid_users_prefence_distance_tags[z])
                                    {
                                        var w = 0;
                                        var f = 0;
                                        //storing distance in object
                                        var meters = geo_tools.distanceTo({lat: my_info[0].latitude, lon: my_info[0].longitude}, {lat: valid_users_prefence_distance_tags[z].latitude, lon: valid_users_prefence_distance_tags[z].longitude});
                                        var kilometers = meters / 1000;
                                        valid_users_prefence_distance_tags[z].distance_from_me = Math.trunc(kilometers);
                                        //storing amount of common tags related to me in object
                                        while (valid_users_prefence_distance_tags[z].user_interests[w])
                                        {
                                            if (valid_users_prefence_distance_tags[z].user_interests[w] == "#")
                                                f++;
                                            w++;
                                        }
                                        valid_users_prefence_distance_tags[z].amount_of_common_interests = f;
                                        z++;
                                    }
                                    console.log("final_stage: "+valid_users_prefence_distance_tags);
                                    //checking for unread_messages.
                                    var unread_message = "no";
                                    var count = 0;
                                    var count_2 = 0;
                                    while (succ[count])
                                    {
                                        while (messages[count_2])
                                        {
                                            if (messages[count_2].user_id == succ[count].likes && messages[count_2].room_id == succ[count].room_id)
                                            {
                                                if (messages[count_2].read_message == 1)
                                                {
                                                    unread_message = "yes";
                                                    break;
                                                }
                                            }
                                            count_2++;
                                        }
                                        if (unread_message == "yes")
                                        {
                                            break;
                                        }
                                        count++;
                                    }
                                    req.session.unread_message = unread_message;
                                    req.session.recommended_users = valid_users_prefence_distance_tags;
                                    req.session.recommended_users_modifiable = valid_users_prefence_distance_tags;
                                    res.render('home', {valid_users: req.session.recommended_users_modifiable, info: "", unread_message: unread_message});
                                })
                            }
                        })
                    })
                })
            }
        })
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
})

router.get('/sort', (req, res) => {
    //Sorting according to age
    if (req.session.user_id)
    {
        if (req.query.submit == "Reset")
        {
            req.session.recommended_users_modifiable = req.session.recommended_users;
            valid_users_prefence_distance_tags = req.session.recommended_users_modifiable;
            res.render('home', {valid_users: valid_users_prefence_distance_tags, info: "", unread_message: req.session.unread_message});   
        }
        else if (req.query.submit == "sort")
        {
            let valid_users_prefence_distance_tags = req.session.recommended_users_modifiable;

            if (req.query.age_sort)
            {
                if (req.query.age_sort == "asc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.age > b.age)
                            return 1;
                        else if (a.age < b.age)
                            return -1;
                        return -1;
                    });
                }
                else if (req.query.age_sort == "desc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.age > b.age)
                            return -1;
                        else if (a.age < b.age)
                            return 1;
                        return -1;
                    });
                }
            }
            //sorting according to location
            if (req.query.location_sort)
            {
                if (req.query.location_sort == "asc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.distance_from_me > b.distance_from_me)
                            return 1;
                        else if (a.distance_from_me < b.distance_from_me)
                            return -1;
                        return -1;
                    });
                }
                else if (req.query.location_sort == "desc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.distance_from_me > b.distance_from_me)
                            return -1;
                        else if (a.distance_from_me < b.distance_from_me)
                            return 1;
                        return -1;
                    });
                }
            }
            //sorting according to fame_rating
            if (req.query.fame_sort)
            {
                if (req.query.fame_sort == "asc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.fame_rating > b.fame_rating)
                            return 1;
                        else if (a.fame_rating < b.fame_rating)
                            return -1;
                        return -1;
                    });
                }
                else if (req.query.fame_sort == "desc")
                {
                    valid_users_prefence_distance_tags.sort((a, b) => {
                        if (a.fame_rating > b.fame_rating)
                            return -1;
                        else if (a.fame_rating < b.fame_rating)
                            return 1;
                        return -1;
                    });
                }
            }
            //sorting according to tags
            if (req.query.tags_sort)
            {
                valid_users_prefence_distance_tags.sort((a, b) => {
                    if (req.query.tags_sort == "asc")
                    {
                        if (a.amount_of_common_interests > b.amount_of_common_interests)
                            return 1;
                        else if (a.amount_of_common_interests < b.amount_of_common_interests)
                            return -1;
                        return -1;
                    }
                    else if (req.query.tags_sort == "desc")
                    {
                        if (a.amount_of_common_interests > b.amount_of_common_interests)
                            return -1;
                        else if (a.amount_of_common_interests < b.amount_of_common_interests)
                            return 1;
                        return -1;
                    }
                })
            }
            res.render('home', {valid_users: valid_users_prefence_distance_tags, info: "", unread_message: req.session.unread_message});
        }
    }
    else
        res.redirect('/login');
});

router.get('/filter', (req, res) => {
    if (req.session.username)
    {
        if (req.query.submit == "Reset")
        {
            req.session.recommended_users_modifiable = req.session.recommended_users;
            valid_users_prefence_distance_tags = req.session.recommended_users_modifiable;
            res.render('home', {valid_users: valid_users_prefence_distance_tags, info: "",  unread_message: req.session.unread_message}); 
        }
        else if (req.query.submit == "filter")
        {
            let valid_users_prefence_distance_tags = req.session.recommended_users_modifiable;
            //Filter by age
            if (req.query.age_filter)
            {
                console.log("age");
                let modified_users = valid_users_prefence_distance_tags;
                let age_to_filter = req.query.age_filter;
                var x = 0;

                while (modified_users[x])
                {
                    if (age_to_filter != modified_users[x].age)
                    {
                        modified_users[x] = "not_requested";
                    }
                    x++;
                }
                //res.render("home", {valid_users: modified_users, info: ""});
                valid_users_prefence_distance_tags = modified_users;
            }
            if (req.query.interest1 || req.query.interest2 || req.query.interest3 || req.query.interest4 || req.query.interest5)
            {
                console.log("interest");
                let interest_array = [];
                let modified_users = valid_users_prefence_distance_tags;
                let v = 0;

                if (req.query.interest1)
                    interest_array.push(req.query.interest1);
                if (req.query.interest2)
                    interest_array.push(req.query.interest2);
                if (req.query.interest3)
                    interest_array.push(req.query.interest3);
                if (req.query.interest4)
                    interest_array.push(req.query.interest4);
                if (req.query.interest5)
                    interest_array.push(req.query.interest5);
                if (interest_array)
                {
                    while (modified_users[v])
                    {
                        if (modified_users[v].user_interests != undefined)
                        {
                            interest = modified_users[v].user_interests.split("#");
                            let i = 0;
                            let f = 0;
                            while (interest_array[i])
                            {
                                let u = 1;
                                while (interest[u])
                                {
                                    if (interest[u] === interest_array[i])
                                    {
                                        f++;
                                    }
                                    u++;
                                }
                                i++;
                            }
                            if (f == 0)
                            {
                                modified_users[v] = "not_requested";
                            }
                        }
                        v++;
                    }
                    //res.render('home', {valid_users: modified_users, info: ""});
                    valid_users_prefence_distance_tags = modified_users;
                }
                // else
                //    res.render('home', {valid_users: valid_users_prefence_distance_tags, info: ""});
            }
            if (req.query.location_filter)
            {
                console.log("location");
                let modified_users = valid_users_prefence_distance_tags;
                let location_to_filter = Number(req.query.location_filter);

                let x = 0;
                while (modified_users[x])
                {
                    distance_from_me = Math.trunc(modified_users[x].distance_from_me);
                    if (distance_from_me != location_to_filter)
                    {
                        modified_users[x] = "not_requested";
                    }
                    x++;
                }
                //res.render("home", {valid_users: modified_users, info: ""});
                valid_users_prefence_distance_tags = modified_users;
            }
            if (req.query.fame_filter)
            {
                console.log("fame");
                let modified_users = valid_users_prefence_distance_tags;
                let fame_to_filter = Number(req.query.fame_filter);

                let x = 0;
                while (modified_users[x])
                {
                    let fame = Math.trunc(modified_users[x].fame_rating);
                    if (fame != fame_to_filter)
                    {
                        console.log(modified_users[x].fame_rating);
                        modified_users[x] = "not_requested";
                    }
                    x++;
                }
                //res.render("home", {valid_users: modified_users, info: ""});
                valid_users_prefence_distance_tags = modified_users;
            }
            res.render("home", {valid_users: valid_users_prefence_distance_tags, info: "",  unread_message: req.session.unread_message});
        }
    }
    else
        res.render('login', {info: "", verified: "", login: ""});
});

module.exports = router;