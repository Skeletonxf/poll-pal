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

function verifyVotingType(type) {
  return {
    msg: "Invalid voting type",
    error: !(['agreement'].includes(type)) //'stv'
  }
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

// Search for session id POST
router.post('/search', (req, res, next) => {
  mongoose.model('Vote').find({ name: req.body.name }, function (err, votes) {
    if (votes.length !== 1) {
      res.send("Invalid session name.")
      return
    }
    let vote = votes[0]
    // redirect to vote page
    res.format({
      html: () => {
        res.location("votes");
        res.redirect("/votes/" + vote._id);
      },
    });
  })
})

// New vote form page
router.post('/', async (req, res) => {
  // Get values from POST request.
  // These can be done through forms or REST calls. These rely on the "name" attributes for forms
  let name = req.body.name;
  let question = req.body.question;
  let type = req.body.type;
  let responses = req.body.responses.split(',');
  console.log(`Responses ${responses} ${req.body.responses}`)
  let passphrase = bcrypt.hashSync(req.body.passphrase, saltRounds)
  let errors = await verifyNameUnique(name)
  if (errors.error) {
    if (errors.msg) {
      res.send(errors.msg)
    } else {
      res.send("There was a problem adding the information to the database.")
    }
    return
  }
  errors = verifyVotingType(type)
  if (errors.error) {
    if (errors.msg) {
      res.send(errors.msg)
    } else {
      res.send("There was a problem adding the information to the database.")
    }
    return
  }
  // Create Vote from form data
  mongoose.model('Vote').create({
    name: name,
    question: question,
    passphrase: passphrase,
    type: type,
    responses: responses
  }, (err, vote) => {
    if (err) {
      res.send("There was a problem adding the information to the database.");
      return;
    }
    console.log('POST creating new vote: ' + vote);
    // redirect to vote page
    res.format({
      html: () => {
        res.location("votes");
        res.redirect("/votes/" + vote._id);
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
    title: 'Create a new Poll',
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
    console.log(req.originalMethod)
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

// Show a vote's results
router.get('/:id/results', (req, res) => {
  mongoose.model('Vote').findById(req.id, (err, vote) => {
    if (err) {
      console.log('GET Error: There was a problem retrieving: ' + err);
      return;
    }
    console.log('GET Retrieving ID: ' + vote._id);
    console.log('Votes: ' + vote)

    res.format({
      html: () => res.render('votes/results', { vote: vote })
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
          vote: vote,
          responses: vote.responses.join(',')
        });
      }
    });
  });
})

// PUT to update a vote
router.put('/:id/edit', (req, res) => {
  // Get our REST or form values. These rely on the "name" attributes
  console.log('PUT')
  let name = req.body.name;
  let question = req.body.question;
  let type = req.body.type;
  let responses = req.body.responses.split(',')
  let errors = verifyVotingType(type)
  if (errors.error) {
    if (errors.msg) {
      res.send(errors.msg)
    } else {
      res.send("There was a problem adding the information to the database.")
    }
    return
  }
  mongoose.model('Vote').findById(req.id, async (err, vote) => {
    if (err) {
      res.send('There was a problem updating the information to the database.');
      return;
    }
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
      question: question,
      type: type,
      responses: responses
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


// PATCH to make a vote
router.patch('/:id/edit', (req, res) => {
  console.log('recieved patch req')
  mongoose.model('Vote').findById(req.id, (err, vote) => {
    if (err) {
      res.send('There was a problem updating the information to the database.');
      return;
    }
    let expectedResponses = vote.responses.length
    console.log(req.body)
    // build up rank order collection of votes
    let votes = []
    let responseIndexes = [...Array(expectedResponses).keys()]
    for (let i in responseIndexes) {
      let input = req.body['r' + i]
      console.log(input)
      if (input === 'on') {
        // checkbox voting order does not matter
        votes.push(+i + 1)
      } else {
        if (input !== undefined) {
          // assume input is a number
          votes.push(+input)
        }
      }
    }
    console.log(`Votes ${votes}`)
    let seen = new Set()
    for (let i in votes) {
      let vote = votes[i]
      if (seen.has(vote)) {
        res.send('Vote invalid.');
        return;
      }
      seen.add(vote)
      if ((vote < 1) || vote > expectedResponses) {
        console.log(vote)
        res.send('Vote out of range: invalid.');
        return;
      }
    }
    // cast vote
    vote.votes.push(votes)
    console.log(vote.votes)
    vote.save((err) => {
      if (err) {
        res.send('There was a problem updating the information to the database.');
        return;
      }
      // return to Vote page
      res.format({
        html: () => {
          res.redirect('/votes/' + vote._id + '/results');
        },
      });
    })
  })
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
