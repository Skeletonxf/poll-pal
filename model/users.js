var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  email: String
});
mongoose.model('User', userSchema);
