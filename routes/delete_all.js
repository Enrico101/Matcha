const express = require('express');
var db = require('../database');

var router = express.Router();

router.get('/delete', function(req, res) {
    db.query('DELETE FROM users');
    db.query('DELETE FROM images');
   //-Mac db.query('DELETE FROM user_location');
    //db.query('DELETE FROM location');
    //db.query('DELETE FROM user_interests');
    db.query('DELETE FROM user_profile');
})
router.get('/delete_ghost_mode', (req, res) => {
    db.query("DELETE FROM ghost_mode", (err, succ) => {
        if (err)
            res.send("An error has occured");
        else if (succ)
            res.send("Deleted all information inside ghost_mode table");
    }); 
})
router.get('/delete_likes', (req, res) => {
    db.query("DELETE FROM likes", (err, succ) => {
        if (err)
            res.send("An error has occured");
        else if (succ)
            res.send("Deleted all information inside likes table");
    });
})
router.get('/delete_messages', (req, res) => {
    db.query("DELETE FROM messages", (err, succ) => {
        if (err)
            res.send("An error has occured");
        else if (succ)
            res.send("Deleted all information inside messages table");
    });
})

module.exports = router;