//var db = require('./database');
var mysql = require('mysql');
var Client = require('node-rest-client').Client;
var faker = require('faker');
const bcrypt = require('bcrypt-nodejs');
var rn = require('random-number');
var names = require('human-names');

var client = new Client();
client.registerMethod("jsonMethod", "https://randomuser.me/api/?results=500", "GET");

//x = 1;
//var gender = ["male", "female"];
var prefence_array = ["women", "men"];
var longitude = faker.address.longitude();
var latitude = faker.address.latitude();
var user_interests_array = ["#Reading#Movies#Nature", "#Reading#Singing#Movies#Nature#Running", "#Nature#Running", "#Reading#Singing#Nature", "#Reading#Singing#Movies", "#Singing#Movies#Nature#Running", "#Reading#Nature#Running", "Reading#Singing#Movies#Nature"];
//var image = faker.image.people();

//console.log(image);
//methods
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

//database connection
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root444@',
  //password: 'Radnic444',
  //socketPath: '/goinfre/enradcli/Desktop/MAMP/mysql/tmp/mysql.sock',
  });
db.connect((err) => {
    if (err)
      console.log(err);
});

db.query("CREATE DATABASE IF NOT EXISTS matcha;", (err, succ) => {
  if (err)
    console.log(err);
  else
  {
    db.query("USE matcha;", (err, succ) => {
      if (err)
        console.log("Selecting database: "+err);
      else
      {
        db.query("CREATE TABLE IF NOT EXISTS users (user_id INT UNSIGNED NOT NULL AUTO_INCREMENT, username VARCHAR(255) NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, password VARCHAR(500) NOT NULL, email VARCHAR(500) NOT NULL, token VARCHAR(500) NOT NULL, verified VARCHAR(50) NOT NULL, UNIQUE (user_id), PRIMARY KEY (user_id));", (err, succ) => {
          if (err)
              console.log(err);
          else if (succ)
          {
              console.log("users table created");
              db.query("CREATE TABLE IF NOT EXISTS images (user_id INT UNSIGNED, image VARCHAR(1500) NOT NULL, FOREIGN KEY (user_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                  if (err)
                      console.log(err);
                  else if (succ)
                  {
                      console.log("images table created");
                      db.query("CREATE TABLE IF NOT EXISTS likes (user_id INT UNSIGNED, likes INT UNSIGNED, like_back INT NOT NULL, room_id VARCHAR(50) NOT NULL, status VARCHAR(50) NOT NULL, FOREIGN KEY (user_id) REFERENCES matcha.users (user_id), FOREIGN KEY (likes) REFERENCES matcha.users (user_id));", (err, succ) => {
                          if (err)
                              console.log(err);
                          else if (succ)
                          {
                              console.log("likes table created");
                              db.query("CREATE TABLE IF NOT EXISTS messages (user_id INT UNSIGNED, message VARCHAR(255) NOT NULL, room_id INT NOT NULL, read_message INT NOT NULL, FOREIGN KEY (user_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                                  if (err)
                                      console.log(err);
                                  else if (succ)
                                  {
                                    console.log("messages table created");
                                    db.query("CREATE TABLE IF NOT EXISTS user_profile (user_id INT UNSIGNED NOT NULL AUTO_INCREMENT, gender VARCHAR(50) NOT NULL, age INT NOT NULL, prefence VARCHAR(255) NOT NULL, bio VARCHAR(1000) NOT NULL, preferred_distance INT NOT NULL, longitude FLOAT NOT NULL, latitude FLOAT NOT NULL, user_interests VARCHAR(1000) NOT NULL, profile_pic VARCHAR(1000) NOT NULL, fame_rating FLOAT NOT NULL, status VARCHAR(255) NOT NULL DEFAULT 'offline', date_of_last_connection VARCHAR(50) NOT NULL, UNIQUE (user_id), UNIQUE (user_id), FOREIGN KEY (user_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                                          if (err)
                                              console.log(err);
                                          else if (succ)
                                          {
                                            console.log("user_profile tabel created");
                                            db.query("CREATE TABLE IF NOT EXISTS ghost_mode (user_id INT UNSIGNED, FOREIGN KEY (user_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                                                  if (err)
                                                      console.log(err);
                                                  else if (succ)
                                                  {
                                                      console.log("ghost_mode table created");
                                                      db.query("CREATE TABLE IF NOT EXISTS blocked_users (blocked_user INT UNSIGNED, blocker INT UNSIGNED, FOREIGN KEY (blocked_user) REFERENCES matcha.users (user_id), FOREIGN KEY (blocker) REFERENCES matcha.users (user_id));", (err, succ) => {
                                                          if (err)
                                                              console.log(err);
                                                          else if (succ)
                                                          {
                                                              console.log("blocked_users table created");
                                                              db.query("CREATE TABLE IF NOT EXISTS admin (username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL);", (err, succ) => {
                                                                  if (err)
                                                                      console.log(err);
                                                                  else if (succ)
                                                                  {
                                                                      console.log("admin table created");
                                                                      db.query("CREATE TABLE IF NOT EXISTS reported (reported_user INT UNSIGNED, reported_by INT UNSIGNED, FOREIGN KEY (reported_user) REFERENCES matcha.users (user_id), FOREIGN KEY (reported_by) REFERENCES matcha.users (user_id));", (err, succ) => {
                                                                          if (err)
                                                                              console.log(err);
                                                                          else if (succ)
                                                                          {
                                                                              console.log("reported table created");
                                                                              db.query("CREATE TABLE IF NOT EXISTS views (user_id INT UNSIGNED, visitor_id INT UNSIGNED, FOREIGN KEY (user_id) REFERENCES matcha.users (user_id), FOREIGN KEY (visitor_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                                                                                  if (err)
                                                                                      console.log(err);
                                                                                  else if (succ)
                                                                                  {
                                                                                    console.log("views table created");
                                                                                    db.query("CREATE TABLE IF NOT EXISTS ip_address (user_id INT UNSIGNED, ip VARCHAR(255) NOT NULL, UNIQUE (user_id), FOREIGN KEY (user_id) REFERENCES matcha.users (user_id));", (err, succ) => {
                                                                                      if (err)
                                                                                        console.log(err);
                                                                                      else if (succ)
                                                                                      {
                                                                                        console.log("ip_address table created");
                                                                                       //inserting admin details
                                                                                       db.query("INSERT INTO admin (username, password) VALUES (?, ?)", ["admin", "Admin12345"], (err, succ) => {
                                                                                         if (err)
                                                                                         {
                                                                                           res.send("An error has occured!");
                                                                                         }
                                                                                         else
                                                                                         {
                                                                                        //creating the users
                                                                                        client.methods.jsonMethod(function (data, response) {
                                                                                          // parsed response body as js object
                                                                                          //console.log("user_count: "+x);
                                                                                          let x = 0;
                                                                                
                                                                                          while (x < 500)
                                                                                          {
                                                                                            console.log("count: "+x);
                                                                                            if (data.results[x].gender == "female")
                                                                                            {
                                                                                              var firstName = names.femaleRandom();
                                                                                              var lastName = names.femaleRandom();
                                                                                            }
                                                                                            else if (data.results[x].gender == "male")
                                                                                            {
                                                                                              var firstName = names.maleRandom()
                                                                                              var lastName = names.maleRandom()
                                                                                            }
                                                                                            let userName = data.results[x].login.username;
                                                                                            /*let firstName = data.results[x].name.first;
                                                                                            let lastName = data.results[x].name.last;*/
                                                                                            let email = data.results[x].email;
                                                                                            let password = data.results[x].login.sha256;
                                                                                            let token = "Disposed";
                                                                                            let verified = "true";
                                                                                            let gender = data.results[x].gender;
                                                                                            let age = data.results[x].dob.age;
                                                                                            let prefence = prefence_array[rn({
                                                                                              min:  0
                                                                                            , max:  1
                                                                                            , integer: true
                                                                                            })];
                                                                                            let bio = "hello, my name is "+firstName+". Nice to meet you.";
                                                                                            let username = userName;
                                                                                            let preferred_distance = rn({
                                                                                              min:  0
                                                                                            , max:  100
                                                                                            , integer: true
                                                                                            });
                                                                                            let longitude = data.results[x].location.coordinates.longitude;
                                                                                            let latitude = data.results[x].location.coordinates.latitude;
                                                                                            let user_interests = user_interests_array[rn({
                                                                                              min:  0
                                                                                            , max:  6
                                                                                            , integer: true
                                                                                            })];
                                                                                            let profile_pic = data.results[x].picture.large;
                                                                                            let fame_rating = round(+rn({
                                                                                              min:  0
                                                                                            , max:  10
                                                                                            , float: true
                                                                                            }), 2);
                                                                                            let status = "offline";
                                                                                            let date_of_last_connection = rn({
                                                                                              min:  1
                                                                                            , max:  30
                                                                                            , integer: true
                                                                                            })+"/"+rn({
                                                                                              min:  1
                                                                                            , max:  12
                                                                                            , integer: true
                                                                                            })+"/"+rn({
                                                                                              min:  2019
                                                                                            , max:  2020
                                                                                            , integer: true
                                                                                            });
                                                                                            db.query("INSERT into users (username, firstname, lastname, email, password, token, verified) VALUES (?, ?, ?, ?, ?, ?, ?)", [userName, firstName, lastName, email, password, token, verified], (err, succ) => {
                                                                                              if (err)
                                                                                                console.log(err);
                                                                                              else
                                                                                              {
                                                                                                //console.log(fame_rating);
                                                                                                /*let gender = data.results[x].gender;
                                                                                                let age = date.results[x].dob.age;
                                                                                                let prefence = prefence[rn({
                                                                                                  min:  0
                                                                                                , max:  1
                                                                                                , integer: true
                                                                                                })];
                                                                                                let bio = "hello, my name is "+firstName+". Nice to meet you.";
                                                                                                let username = userName;
                                                                                                let preferred_distance = rn({
                                                                                                  min:  0
                                                                                                , max:  100
                                                                                                , integer: true
                                                                                                });
                                                                                                let longitude = data.results[x].location.coordinates.longitude;
                                                                                                let latitude = data.results[x].location.coordinates.latitude;
                                                                                                let user_interests = user_interests[rn({
                                                                                                  min:  0
                                                                                                , max:  6
                                                                                                , integer: true
                                                                                                })];
                                                                                                let profile_pic = data.results[x].picture.large;
                                                                                                let fame_rating = round(+rn({
                                                                                                  min:  0
                                                                                                , max:  10
                                                                                                , float: true
                                                                                                }), 2);
                                                                                                let status = "offline";
                                                                                                let date_of_last_connection = rn({
                                                                                                  min:  1
                                                                                                , max:  30
                                                                                                , integer: true
                                                                                                })+"/"+rn({
                                                                                                  min:  1
                                                                                                , max:  12
                                                                                                , integer: true
                                                                                                })+"/"+rn({
                                                                                                  min:  2019
                                                                                                , max:  2020
                                                                                                , integer: true
                                                                                                });*/
                                                                                                //console.log("User created!");
                                                                                                db.query("INSERT into user_profile (gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, status, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [gender, age, prefence, bio, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, status, date_of_last_connection], (err, succ) => {
                                                                                                  if (err)
                                                                                                    console.log(err);
                                                                                                  else
                                                                                                  {
                                                                                                    console.log("User_profile created!");
                                                                                                  }
                                                                                                })
                                                                                              }
                                                                                            })
                                                                                            x++;
                                                                                          }
                                                                                        });
                                                                                      }
                                                                                    })
                                                                                  }
                                                                              })
                                                                              }
                                                                            }) 
                                                                          }
                                                                      })
                                                                  }
                                                              })
                                                          }
                                                      })
                                                  }
                                              })
                                          }
                                      })
                                  }
                              })
                          }
                      })
                  }
              })
          }
        });
      }
    });
  };
});
//while (x <= 1) 
//{
//    console.log("User: "+x+"\n");
    /*console.log('------------------------------------------------\n');
    console.log("username: "+firstName+"\n");
    console.log("lastname: "+lastName+"\n");
    console.log("email: "+email+"\n");
    console.log("password: "+password+"\n");
    console.log("token: disposed\n");
    console.log("verified: true\n");*/
    /*var firstName = faker.name.firstName();
    var lastName = faker.name.lastName();
    var email = faker.internet.email();
    var password = bcrypt.hashSync('OMG42', 10);
    db.query("INSERT into users (username, firstname, lastname, email, password, token, verified) VALUES (?, ?, ?, ?, ?, ?, ?)", [firstName, firstName, lastName, email, password, "Disposed", "true"], (err, succ) => {
      if (err)
        console.log("An error has occured!");
      else
      {
        console.log("User created!");
      }
    })
   var bio = "Hello there, my name is "+firstName;
    db.query("INSERT into user_profile (gender, age, prefence, bio, username, preferred_distance, longitude, latitude, user_interests, profile_pic, fame_rating, status, date_of_last_connection) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [gender[rn({
      min:  0
    , max:  1
    , integer: true
    })], rn({
      min:  18
    , max:  40
    , integer: true
    }), prefence[rn({
      min:  0
    , max:  1
    , integer: true
    })], "Hello there, my name is "+firstName, firstName, rn({
      min:  0
    , max:  100
    , integer: true
    }), longitude, latitude, user_interests[rn({
      min:  0
    , max:  6
    , integer: true
    })], image, round(+rn({
      min:  0
    , max:  10
    , float: true
    }), 2), "offline", rn({
      min:  1
    , max:  30
    , integer: true
    })+"/"+rn({
      min:  1
    , max:  12
    , integer: true
    })+"/"+rn({
      min:  2019
    , max:  2020
    , integer: true
    })], (err, succ) => {
          if (err)
            console.log("An error has occured!");
          else
            console.log("User profile data added!");
        });*/
    








    /*console.log("gender: "+gender[rn({
        min:  0
      , max:  1
      , integer: true
      })]+"\n");
    console.log("age: "+rn({
        min:  18
      , max:  40
      , integer: true
      })+"\n")
    console.log("prefence: "+prefence[rn({
        min:  0
      , max:  1
      , integer: true
      })]);
    console.log("preferred_distance: "+rn({
        min:  0
      , max:  100
      , integer: true
      }));
    console.log("longitude: "+longitude+"\n");
    console.log("latitude: "+latitude+"\n");
    console.log("user_interest: "+user_interests[rn({
      min:  0
    , max:  6
    , integer: true
    })]);
    console.log("image: "+image);
    console.log("fame_rating: "+round(+rn({
      min:  0
    , max:  10
    , float: true
    }), 2));
    console.log('date_of_last_connection: '+rn({
      min:  1
    , max:  30
    , integer: true
    })+"/"+rn({
      min:  1
    , max:  12
    , integer: true
    })+"/"+rn({
      min:  2019
    , max:  2020
    , integer: true
    }));*/
 //   console.log('----------------------------------------------\n');
//    x++;
//}
