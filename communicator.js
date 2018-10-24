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
 * Save the telegram client so we can use it asynchronously and load the
 * telegram owner if needed.
 */
function setup(tg) {
    TELEGRAM = tg
    if(!owner.loaded) loadOwner()
}

/*      problem/
 * As we are a 'bot' any user can find us and talk with us and get us to
 * do their bidding. Not just our owner. This is not good.
 *
 *      way/
 * Check if this is our owner and only then respond.
 */
function handleMsg(ctx) {
    isOwner(ctx, (err, isowner) => {
        if(err) {
            u.showErr(err)
            if(typeof err === 'string') ctx.reply(err)
            else ctx.reply('Error!')
            return
        }
        if(isowner) handleOwnerMsg(ctx)
        else ctx.reply('Error! I only respond to my owner')
    })
}


const ssb = new cote.Requester({
    name: 'elife-telegram -> ssb',
    key: 'everlife-ssb-svc',
})

let owner = {
    loaded: false,
    id: null,
}
function loadOwner() {
    ssb.send({
        type: 'msg-by-type',
        mstype: 'elife-telegram.owner',
    }, (err, msgs) => {
        if(err) {
            u.showErr(err)
            setTimeout(loadOwner, 10000)
        } else {
            owner.loaded = true
            if(msgs.length) owner.id = msgs[0].val
        }
    })
}

/*      outcome/
 * When we get the first message - because we don't have any context, we
 * assume it is our owner and 'bind' to it. From that point onward we
 * only accept messages from this user.
 */
function isOwner(ctx, cb) {
    if(!owner.loaded) cb(`Error! Data not loaded. Not ready`)
    else {
        if(!owner.id) bind_user_1(ctx, cb)
        else cb(null, owner.id == ctx.from.id)
    }

    function bind_user_1(ctx, cb) {
        owner.id = ctx.from.id
        if(!owner.id) cb(`Error! Telegram owner not found`)
        else {
            ssb.send({
                type: 'new-msg',
                msg: {
                    type: 'elife-telegram.owner',
                    val: owner.id,
                },
            }, (err) => {
                if(err) cb(err)
                else cb(null, true)
            })
        }
    }
}

/*      outcome/
 * Send the message to the communication manager
 * and keep a context in case we get a response.
 * In the special case that it is a `start` message, respond with
 * welcoming the user.
 */
function handleOwnerMsg(ctx) {
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
