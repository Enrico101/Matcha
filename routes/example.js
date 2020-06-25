const express = require('express');
var unirest = require('unirest');

var router = express.Router();

router.get('/example', (req, res) => {
    res.render("example");
})

module.exports = router;