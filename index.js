'use strict'
const { Telegraf } = require('telegraf')
const u = require('@elife/utils')
const comm = require('./communicator')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Load any configuration information, setup the communication channel,
 * and start the bot.
 */
function main() {
    comm.setup()
    const bot = startBot(loadConfig())
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
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
 * Start the telegram bot with the given token.
 */
function startBot(conf) {
    if(!conf.TELEGRAM_TOKEN) {
        u.showErr("TELEGRAM_TOKEN must be set to use the Telegram channel")
        return
    }

    const bot = new Telegraf(conf.TELEGRAM_TOKEN)
    bot.on('message', comm.handleMsg)

    bot.startPolling()

    return bot
}

main()
