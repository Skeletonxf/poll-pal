const bcrypt = require('bcrypt'); // hashing lib
const saltRounds = 10;

var mongoose = require('mongoose');
var voteSchema = new mongoose.Schema({
  name: String,
  passphrase: String, // authentication for the Vote
  questions: [
    {
      question: String,
      type: String
    }
  ]
});
let Vote = mongoose.model('Vote', voteSchema);
