const express = require('express');
var session = require('express-session');
//var mysql = require('mysql');
var db = require('./database');
var bodyParser = require('body-parser');
var Objects = require('./objects');
var multer = require('multer');
var nodemailer = require('nodemailer');
var index = require('./routes/index');
var signup = require('./routes/signup');
var login = require('./routes/login');
var authenticate = require('./routes/authenticate');
var verify = require('./routes/verfify');
var check_profile = require('./routes/check_profile');
var complete_profile = require('./routes/complete_profile');
var home = require('./routes/home');
var profile = require('./routes/profile');
var search = require('./routes/search');
var user_profile = require('./routes/user_profile');
var set_profile_pic = require('./routes/set_profile_pic');
var selected_pic = require('./routes/selected_pic');
var like = require('./routes/like');
var socket = require('socket.io');
var chat_screen = require('./routes/chat_navigation');
var chat = require('./routes/chat');
var verify_token = require('./routes/verify_token');
var forgot_password = require('./routes/forgot_password');
var reset_password = require('./routes/reset_password');
var view_history = require('./routes/view_history');
var visit_history = require('./routes/visit_history');
var logout = require('./routes/logout');
var unlike = require('./routes/unlike');
var report = require('./routes/report_user');
var block = require('./routes/block');
var admin = require('./routes/admin');
var blocked_requests = require('./routes/block_requests');
var like_history = require('./routes/like_history');
var profile_settings = require('./routes/profile_settings');
var path = require('path');

var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "matchagroup444@gmail.com",
        pass: "welcometomatcha"
    }
});
var port = 3002;
const app = express();
var upload = multer({dest: 'Uploads/'});
var secretString = Math.floor((Math.random() * 10000) + 1);

//Setting view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: 'true'
}));

//we tell express that we will be using session with the configue specified.
app.use(session({
    secret: secretString.toString(),
    resave: false,
    saveUninitialized: false
}));

//Database connection.
db.connect((err, succ) => {
    if (err)
    {
        console.log(err);
    }
    else
    {
        console.log("Connected to database");
    }
});

//We set the uploads path to static so that we can view images
//app.use(express.static(path.join(__dirname, 'Uploads')));
//localhost:3003/images/67890yhjkl/png
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
app.use('/home/Uploads', express.static(path.join(__dirname, '/home/Uploads')));
app.use('/search/Uploads', express.static(path.join(__dirname, '/search/Uploads')));
app.use('/index_images', express.static(path.join(__dirname, 'index_images')));
//localhost:3030/images/Uploads/4567890dfghjk.png
//routes for the server
app.use(index);
app.use(signup);
app.use(login);
app.use(authenticate);
app.use(verify);
app.use(check_profile);
app.use(complete_profile);
app.use('/home', home);
app.use(profile);
app.use('/search', search);
app.use(user_profile);
app.use(set_profile_pic);
app.use(selected_pic);
app.use(like);
app.use(chat_screen);
app.use(chat);
app.use(verify_token);
app.use(forgot_password);
app.use(reset_password);
app.use(view_history);
app.use(visit_history);
app.use(logout);
app.use(unlike);
app.use(report);
app.use(block);
app.use(admin);
app.use(blocked_requests);
app.use(like_history);
app.use('/profile_settings', profile_settings);


app.get("/photo", (req, res) => {
    res.render('photo');
});
//we listen for client requests
var server = app.listen(port, function() {
    console.log("Listening on port: "+port);
})
//tell socket where to listen or which server to use.
var io = socket(server);
//socket io code
io.on('connection', (socket) => {
    socket.on('like_notification', (data) => {
        console.log(data.my_username);
    })
    socket.on('room', (data) => {
        socket.join(data.room_id);
        console.log("Socket joined room: "+data.room_id);
    })
    socket.on('chat', (data) => {
        db.query("INSERT INTO messages (user_id, message, room_id, read_message) VALUES (?, ?, ?, ?)", [data.user_id, data.message, data.room_id, 1], (err, resulsts) => {
            if (err)
                res.send("An error has occured");
            else
            {
                io.sockets.to(data.room_id).emit('chat', {message: data.message, username: data.username});
            }
        });
    });
    socket.on('leave', (data) => {
        console.log("user left roooooooom");
        socket.leave(data.room_id);
    })
});

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    //closing database connection
    db.end();
    process.exit( );
})
