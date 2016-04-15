import mongoose from 'mongoose';

let Member = mongoose.model('Member', {
  username: String,
  firstName: String,
  lastName: String,
  chatId: Number,
  phone: String
});

export default Member;