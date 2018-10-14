'use strict'
const cote = require('cote')({statusLogsEnabled:false})
const u = require('elife-utils')

const client = new cote.Requester({
    name: 'Telegram Comm Channel',
    key: 'everlife-communication-svc',
})

/*      understand/
 * The communication client we use to reach back to the user with a
 * message
 */
let TELEGRAM;

/*      outcome/
 * Save the telegram client so we can use it asynchronously
 */
function setup(tg) {
    TELEGRAM = tg
}

/*      outcome/
 * Send the message to the communication manager
 * and keep a context in case we get a response.
 * In the special case that it is a `start` message, respond with
 * welcoming the user.
 */
function handleMsg(ctx) {
    if(!TELEGRAM) {
        ctx.reply('Error! Telegram not registered with Avatar')
        return
    }
    if(ctx.message.text == '/start') {
        ctx.reply('Hello!')
    } else {
        client.send({
            type: 'message',
            chan: botKey,
            ctx: ctx.chat.id,
            from: ctx.from,
            msg: ctx.message.text
        }, (err) => {
            if(err) {
                u.showErr(err)
                ctx.reply(err)
            }
        })
    }
}


/*      understand/
 * The telegram microservice has to be partitioned by a key to identify
 * it uniquely.
 */
const botKey = 'everlife-comm-telegram-svc'

const botChannel = new cote.Responder({
    name: 'Everlife Communication Manager Service',
    key: botKey,
})

botChannel.on('reply', (req, cb) => {
    TELEGRAM.sendMessage(req.ctx, req.msg)
    .then(()=>cb())
    .catch(cb)
})


module.exports = {
    handleMsg: handleMsg,
    setup: setup,
}
