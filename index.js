'use strict'
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const u = require('elife-utils')
const comm = require('./communicator')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Load any configuration information, set up the communication channels
 * with the comm manager, and start the bot.
 */
function main() {
    let conf = loadConfig()
    setupComm(conf)
    startBot(conf)
}

/*      outcome/
 * Load the configuration (from environment variables) or defaults
 */
function loadConfig() {
    let cfg = {}
    cfg.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
    return cfg
}

/*      outcome/
 * Start the communication microservice and provide it with a telegram
 * client it can use to communicate with the user.
 */
function setupComm(conf) {
    if(!conf.TELEGRAM_TOKEN) {
        u.showErr("TELEGRAM_TOKEN must be set")
        return
    }

    const telegram = new Telegram(conf.TELEGRAM_TOKEN)
    comm.setup(telegram)
}

/*      outcome/
 * Start the telegram bot with the given token.
 */
function startBot(conf) {
    if(!conf.TELEGRAM_TOKEN) {
        u.showErr("TELEGRAM_TOKEN must be set")
        return
    }

    const bot = new Telegraf(conf.TELEGRAM_TOKEN)
    bot.on('message', comm.handleMsg)

    bot.startPolling()
}

main()
