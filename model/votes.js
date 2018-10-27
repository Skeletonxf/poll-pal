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
mongoose.model('Vote', voteSchema);
