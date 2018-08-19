'use strict'
const botapi = require('node-telegram-bot-api')
const u = require('elife-utils')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Load any configuration information and start the bot.
 */
function main() {
    let conf = loadConfig()
    startBot(conf)
}

/*      outcome/
 * Load the configuration (from environment variables) or defaults
 */
function loadConfig() {
    let cfg = {};
    cfg.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    return cfg;
}

/*      outcome/
 * Start the telegram bot with the given token.
 */
function startBot(conf) {
    if(!conf.TELEGRAM_TOKEN) {
        u.showErr("TELEGRAM_TOKEN must be set")
        return
    }
    const bot = new TelegramBot(conf.TELEGRAM_TOKEN, {polling:true});
    bot.on('message', (msg) => {
        console.log(msg)
        bot.sendMessage(msg.chat.id, 'Got it!');
    });
}


