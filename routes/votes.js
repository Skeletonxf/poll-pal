var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'); //parses information from POST
var methodOverride = require('method-override'); //used to manipulate POST

const bcrypt = require('bcrypt'); // hashing lib
const saltRounds = 10;

const randomWord = require('random-word');
const Filter = require('bad-words');
let filter = new Filter();

function verifyNameUnique(name) {
  return mongoose.model('Vote').find({
    name: name
  }).then(others => {
    return {
      msg: "Session name in use",
      error: others.length > 0
    }
  }).catch(error => {
    console.log(`Error ${error}`)
    return {
      error: true
    }
  })
}

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Index page
router.get('/', (req, res, next) => {
  mongoose.model('Vote').find({}, function (err, votes) {
    if (err) {
      return console.error(err);
    }
    res.format({
      html: () => res.render('votes/index', { title: 'All votes', votes: votes })
    });
  });
})

// New vote form page
router.post('/', async (req, res) => {
  // Get values from POST request.
  // These can be done through forms or REST calls. These rely on the "name" attributes for forms
  let name = req.body.name;
  let question = req.body.question;
  console.log(`Recieved passphrase ${req.body.passphrase}`)
  let passphrase = bcrypt.hashSync(req.body.passphrase, saltRounds)
  let errors = await verifyNameUnique(name)
  console.log(`Errors ${errors}`)
  if (errors.error) {
    if (errors.msg) {
      res.send(errors.msg)
    } else {
      res.send("There was a problem adding the information to the database.")
    }
    return
  }
  // TODO other fields
  // Create Vote from form data
  console.log(`Passphrase ${passphrase}`)
  mongoose.model('Vote').create({
    name: name,
    question: question,
    passphrase: passphrase
  }, (err, vote) => {
    if (err) {
      res.send("There was a problem adding the information to the database.");
      return;
    }
    console.log('POST creating new vote: ' + vote);
    // redirect back to index page
    res.format({
      html: () => {
        res.location("votes");
        res.redirect("/votes");
      },
    });
  })
});

router.get('/new', (req, res) => {
  // generate a new phrase of words
  let phrase = []
  let n = 3
  for (let i = 0; i < n; i++) {
    let word = randomWord()
    while (filter.isProfane(word)) {
      word = randomWord()
    }
    phrase.push(word)
  }
  let random = Math.floor(Math.random() * 3) // 0, 1 or 2
  if (random === 0) {
    var joinType = ' '
  }
  if (random === 1) {
    var joinType = '-'
  }
  if (random === 2) {
    var joinType = '_'
  }
  res.render('votes/new', {
    title: 'Create a Vote',
    passphrase: phrase.join(joinType)
  });
});

// route middleware to validate :id
router.param('id', (req, res, next, id) => {
  mongoose.model('Vote').findById(id, (err, vote) => {
    //if it isn't found, we are going to repond with 404
    if (err) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: () => next(err)
      });
      return;
    }
    console.log('validating vote id ' + vote);
    //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
    //console.log(vote);
    // once validation is done save the new item in the req
    req.id = id;
    // go to the next thing
    next();
  });
});

// Show a vote
router.get('/:id', (req, res) => {
  mongoose.model('Vote').findById(req.id, (err, vote) => {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
      return;
    }
    console.log('GET Retrieving ID: ' + vote._id);
    res.format({
      html: () => res.render('votes/show', { vote: vote })
    });
  });
});

// View a Vote
router.get('/:id/edit', (req, res) => {
  mongoose.model('Vote').findById(req.id, function (err, vote) {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
      return;
    }
    console.log('GET Retrieving ID: ' + vote._id);
    res.format({
      html: () => {
        res.render('votes/edit', {
          title: 'Vote' + vote._id,
          vote: vote
        });
      }
    });
  });
})

// PUT to update a vote
router.put('/:id/edit', (req, res) => {
  // Get our REST or form values. These rely on the "name" attributes
  let name = req.body.name;
  let question = req.body.question;
  mongoose.model('Vote').findById(req.id, async (err, vote) => {
    ok = bcrypt.compareSync(req.body.passphrase, vote.passphrase)
    if (!ok) {
      res.send('Invalid passphrase');
      return;
    }
    if (name !== vote.name) {
      let errors = await verifyNameUnique(name)
      if (errors.error) {
        if (errors.msg) {
          res.send(errors.msg)
        } else {
          res.send('There was a problem updating the information to the database.')
        }
        return
      }
    }
    vote.update({
      name : name,
      question: question
    }, (err, voteID) => {
      if (err) {
        res.send('There was a problem updating the information to the database.');
        return;
      }
      // return to Vote page
      res.format({
        html: () => {
          res.redirect("/votes/" + vote._id);
        },
      });
    })
  });
})

// DELETE a Vote
// TODO: Reqire passphrase
router.delete('/:id/edit', (req, res) => {
  mongoose.model('Vote').findById(req.id, function (err, vote) {
    if (err) {
      return console.error(err);
    }
    vote.remove((err, vote) => {
      if (err) {
        return console.error(err);
      }
      // Returning success messages saying it was deleted
      console.log('DELETE removing ID: ' + vote._id);
      res.format({
        //HTML returns us back to the main page, or you can create a success page
        html: () => res.redirect("/votes")
      });
    });
  });
});

module.exports = router;
