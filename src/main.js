'use strict';

import {Bot, Scenario} from 'telegram-scenario-bot';
import promisify       from 'es6-promisify';
import request         from 'request';
import _               from 'underscore';
import mongoose        from 'mongoose';

import { Subscriber, MealMenu } from './models'

var arequest = promisify(request);

// init db
mongoose.connect('localhost', 'tmybot');

/**
 * Start point of the chat. Checks if user is registered. Registers if not.
 * @return {String} Message.
 */
let register = async function() {
  try {
    let result = await Subscriber.findOne({ username: this.from.username });
    if(result && result._id) {
      // subscriber found, update chat id.
      result.chatId = this.chat.id;
      let r = await Subscriber.update({ _id: result._id }, result);
      return `Tekrar hoş geldin ${result.firstName}. Bana ihtiyacın olduğunda buradayım.`;
    }
    else {
      // new subscriber, do registration
      let s = new Subscriber({
        username: this.from.username,
        firstName: this.from.first_name,
        lastName: this.from.last_name,
        chatId: this.chat.id
      });
      await s.save()
      return `Hoş geldin ${s.firstName}. Bana ihtiyacın olduğunda buradayım.`;
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}

let saveMealMenu = async function(query) {
  try {
    let parts = query.split('-');
    let d = parts[0].trim();
    let m = new MealMenu({ date: d, content: parts[1].split(',').map(m => m.trim()) });
    if(m.date && m.content && m.content.length) {
      await MealMenu.remove({date: d});
    }
    await m.save()
    return `Liste kaydedildi. Teşekkürler ${this.from.first_name}.`
  }
  catch(e) {
    console.error(e.stack);
  }
}

let saveMealMenuChain = async function() {
  var userText = this.text,
      stash = this.stash;

  if (_.isString(userText)) {
    // allow use query like "/yemeklistegir foo bar", so remove /yemeklistegir
    let query = userText.replace(/[/]?yemeklistegir\s+/, '');

    if (!_.isEmpty(query)) {
      stash.result = await saveMealMenu.bind(this)(query);
      return null;
    }
  }
  return 'Lütfen bu güne ait yemek listesini girin. Format: 23.02.2016 - Yemek 1, Yemek 2, Yemek 3';
}

let mealMenuList = async function() {
  let d = new Date()
  let dateStr = ('0' + d.getDate()).slice(-2) + '.'
             + ('0' + (d.getMonth()+1)).slice(-2) + '.'
             + d.getFullYear();
  try {
    let result = await MealMenu.findOne({date: dateStr});
    if(result) {
      return `${result.date} günü yemekleri: \n` + result.content.map(c => `  · ${c}\n`).join('');
    }
    else {
      return 'Bu gün için yemek listesi bulunamadı.';
    }
  }
  catch(e) {
    console.error(e.stack);
  }
}

var script = {
  name: 'root',
  reply: 'Usage:\n'+
    '/google - search in google\n'+
    '/about - about bot',
  menu: [
    ['/start'],
    ['/yemek'],
  ],
  commands: {
    "/start": {
      name: 'start',
      action: register,
      typing: true
    },
    "/yemeklistegir|g": {
      name: 'yemeklistegir',
      reply: "Lütfen bu güne ait yemek listesini girin. Format: 22.03.2016 - Yemek 1, Yemek 2, Yemek 3",
      chain: true,   // allow run /yemeklistegir foo bar
      commands: {
        ".": {
          name: "mealMenuInputResult",
          typing: true,
          action: saveMealMenuChain,
          reply: function() { return this.stash.result; }
        }
      }
    },
    "/yemek": {
      name: 'yemek',
      reply: mealMenuList
    }
  }
};

var scenario = new Scenario({ /* bot api, we dont user */}, script);

var token = process.env.BOT_TOKEN;

if (!token) {
  console.error(`!! You need set env BOT_TOKEN`);
  process.exit(1);
}

var b = new Bot(token);

b.scenario(scenario);
b.start();