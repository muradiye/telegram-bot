import mongoose           from 'mongoose';

import { Subscriber, MealMenu, Member, InCharge } from './models';
import { mealMenuList, getInCharge } from './replies';
import TmyBot from './bot';

// init db
mongoose.connect('localhost', 'tmybot');

let bot = new TmyBot(process.env.BOT_TOKEN);

bot.on('/yemek', async function (message) {
  let list = await mealMenuList();
  bot.api.sendMessage({ chat_id: message.from.id, text: list });
});

bot.on('/nobetci', async function (message) {
  let list = await getInCharge();
  bot.api.sendMessage({ chat_id: message.from.id, text: list });
});
