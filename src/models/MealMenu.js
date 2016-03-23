import mongoose from 'mongoose';

let MealMenu = mongoose.model('MealMenu', {
  date: String,
  content: Array
});

export default MealMenu;