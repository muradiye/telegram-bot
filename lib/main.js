import mongoose from 'mongoose';

import { Subscriber, MealMenu, Member, InCharge } from './models'
import { mealMenuList } from './replies'
import member from './replies/member'
import TmyBot from './bot'

// init db
mongoose.connect('localhost', 'tmybot');

let bot = new TmyBot(process.env.BOT_TOKEN);

bot.on('/yemek', async function(message) {
  let list = await mealMenuList();
  bot.api.sendMessage({ chat_id: message.from.id, text: list });
});

bot.on('/nobetci', async function(message) {
  let m = await member.getInCharge();
  bot.api.sendContact({ chat_id: message.from.id, phone_number: m.phone, first_name: m.firstName, last_name: m.lastName });
});

bot.on('/nobetcigir', async function(message) {
  let members = await member.getMembers();

  // listen query callback
  bot.once('callback_query', async (answer) => {
    if(answer.message.id == message.id) {
      try {
        let m = await Member.findOne({_id: answer.data});
        let d = new Date()
        let dateStr = ('0' + d.getDate()).slice(-2) + '.'
                   + ('0' + (d.getMonth()+1)).slice(-2) + '.'
                   + d.getFullYear();
        let inCharge = new InCharge({date: dateStr, member: m});
        console.log(inCharge);
        await inCharge.save();
        bot.api.sendMessage({chat_id: message.from.id, text: `${dateStr} günü nöbetçisi kaydedildi. Teşekkürler ${message.from.first_name}`});
      }
      catch(e) {
        console.error(e.message);
      }
    }
  });

  // ask selection
  bot.api.sendMessage({
    chat_id: message.from.id,
    text: 'Lütfen günün nöbetçisini seçiniz.',
    reply_markup: {
      inline_keyboard: [members.map((m) => {
        return {text: m.firstName + ' ' + m.lastName, callback_data: m._id};
      })]
    }
  });
});
