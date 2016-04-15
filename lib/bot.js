import EventEmitter       from 'eventemitter3'
import TelegramBotAPI     from 'telegram-promise'
import TelegramBotPolling from './telegram-bot-polling'

import { Subscriber } from './models'

/**
 * Class representing bot.
 */
class TmyBot extends EventEmitter {
  constructor(token, opts = {debug: true}) {
    super();
    this.token = token;
    this.api = new TelegramBotAPI(this.token);
    if(opts && opts.hasOwnProperty('debug')) {
      this.debug = opts.debug;
    }
    this._init();
  }

  /**
   * Initializes long polling.
   */
  _init() {
    this.poll = new TelegramBotPolling(this.token, {}, this._handleUpdate.bind(this));

    // log updates
    if(this.debug) {
      this.on('update', (update) => {
        console.log(update);
      });
    }

    this.api.getMe()
      .then(res => {
        console.log(`Hi! I'm a Telegram bot. My name is ${res.result.first_name}. Add me on telegram, my username is ${res.result.username} .`);
      })
      .catch(err => {
        console.error(err);
      });

    // registry
    this._handleSubscription = async function(message) {
      try {
        let result = await Subscriber.findOne({ username: message.from.username });
        if(result && result._id) {
          // subscriber found, update chat id.
          result.chatId = message.chat.id;
          let r = await Subscriber.update({ _id: result._id }, result);
          this.api.sendMessage({chat_id: message.chat.id, text: `Tekrar hoş geldin ${result.firstName}. Bana ihtiyacın olduğunda buradayım.`});
        }
        else {
          // new subscriber, do registration
          let s = new Subscriber({
            username: message.from.username,
            firstName: message.from.first_name,
            lastName: message.from.last_name,
            chatId: message.chat.id
          });
          await s.save()
          this.api.sendMessage({chat_id: message.chat.id, text: `Hoş geldin ${s.firstName}. Bana ihtiyacın olduğunda buradayım.`});
        }
      }
      catch(e) {
        console.error(e.stack);
      }
    }

    // listen for /start messages
    this.on('/start', this._handleSubscription.bind(this));
    this.on('/start start', this._handleSubscription.bind(this));
  }

  /**
   * Emits corresponding event on updates.
   * @param  {Object} update Telegram update.
   */
  _handleUpdate(update) {
    this.emit('update', update);
    const message = update.message;
    const callbackQuery = update.callback_query;
    if(message)
      this.emit(message.text, message);
    else if(callbackQuery)
      this.emit('callback_query', callbackQuery);
  }

}

export default TmyBot