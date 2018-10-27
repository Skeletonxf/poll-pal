var express = require('express');
var router = express.Router();

/* GET home page. */
// when user requests the root of the time return our index page
router.get('/', function(req, res, next) {
  // use our index.pug file to provide the html page
  res.render('index', { title: 'Express' });
});

// export this Router object so other files can import it
module.exports = router;
