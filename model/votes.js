var mongoose = require('mongoose');
var voteSchema = new mongoose.Schema({
  session: String,
  passphrase: String, // created when someone makes a vote
  name: String,
  questions: [
    {
      question: String,
      type: String
    }
  ]
});
mongoose.model('Vote', voteSchema);
