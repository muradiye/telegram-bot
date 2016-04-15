import mongoose from 'mongoose';

let InCharge = mongoose.model('InCharge', {
  date: String,
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }
});

export default InCharge;