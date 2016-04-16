import mongoose from 'mongoose';

let schema = new mongoose.Schema({
  username: String,
  userId: Number,
  firstName: String,
  lastName: String,
  chatId: Number
});

let Subscriber = mongoose.model('Subscriber', schema);

export default Subscriber;