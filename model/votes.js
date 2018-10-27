const bcrypt = require('bcrypt'); // hashing lib
const saltRounds = 10;

var mongoose = require('mongoose');
var voteSchema = new mongoose.Schema({
  name: String, // session name, unqiue to one instance
  passphrase: String, // authentication for the Vote
  question: String,
  type: String, // vote type ie agreement/stv
  responses: [String], // response types
  votes: [[String]] // collection of votes that come in (ordered for stv)
});
let Vote = mongoose.model('Vote', voteSchema);
