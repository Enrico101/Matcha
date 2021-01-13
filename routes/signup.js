//checked
const express = require('express');
var router = express.Router();

router.get('/signup', function(req, res) {
    res.render('signup', {firstname: "", lastname: "", username: "", email: "", password: "", succ: ""});
})

module.exports = router;