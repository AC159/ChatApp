const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Chat App',
    createdAt: '{{ createdAt }}',
    message: '{{ message }}',
    url: '{{ url }}',
    location_createdAt: '{{ location_createdAt }}'
  });
});

module.exports = router;
