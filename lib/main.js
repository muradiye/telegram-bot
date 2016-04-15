import mongoose from 'mongoose';

import { Subscriber, MealMenu, Member, InCharge } from './models'
import replies from './replies'
import member from './replies/member'
import TmyBot from './bot'

// init db
mongoose.connect('localhost', 'tmybot');

let bot = new TmyBot(process.env.BOT_TOKEN);

bot.on('/yemek', async function(message) {
  let list = await replies.meal.mealMenuList();
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
        bot.api.sendMessage({chat_id: message.from.id, text: `${dateStr} günü nöbetçisi kaydedildi. Teşekkürler ${message.from.first_name}.`});
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

bot.on('/yemekgir', async function(message) {
  // ask selection
  bot.api.sendMessage({
    chat_id: message.from.id,
    text: 'Lütfen günün yemek listesini giriniz. (Format: Yemek 1, Yemek 2, Yemek 3)',
    reply_markup: {
      force_reply: true
    }
  })
  .then((data) => {
    if(data.ok && data.result) {
      // listen reply
      bot.once('update', async (answer) => {
        const message = answer.message;
        if(message.reply_to_message.message_id == data.result.message_id) {
          const res = await replies.meal.saveMenuList(message.text.split(',').map(item => item.trim()));
          if(res)
            bot.api.sendMessage({chat_id: message.from.id, text: 'Bugün için yemek listesi kaydedildi. Teşekkürler ' + message.from.first_name + '.'});
        }
      });
    }
  });
});
