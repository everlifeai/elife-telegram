'use strict'
const Telegraf = require('telegraf')
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
    let cfg = {}
    cfg.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
    return cfg
}

/*      outcome/
 * Start the telegram bot with the given token.
 */
function startBot(conf) {
    if(!conf.TELEGRAM_TOKEN) {
        u.showErr("TELEGRAM_TOKEN must be set")
        return
    }
    const bot = new Telegraf(conf.TELEGRAM_TOKEN);
    bot.on('message', (ctx) => {
        console.log(ctx)
        ctx.reply('Got it!')
    })

    bot.startPolling()
}

main()
