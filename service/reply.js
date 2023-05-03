const touchOpenAI = require('./openai.js')
const { createClient } = require('redis')
const {
  wecomAgentId,
  wecomCorpid,
  wecomSecret,
  redisUrl,
  WECOM_BASE_URL
} = require('../config')
const axios = require('axios')
const do_reply = async function (user_message, user, type, reply_message_cache) {
  try {
    let redisURL = redisUrl
    if (!redisURL) {
      redisURL = 'redis://127.0.0.1:6379'
    }
    const redisclient = createClient({ url: redisURL });
    redisclient.on('error', err => console.log('Redis Client Error', err));
    await redisclient.connect();
    let access_token = await redisclient.get(`${wecomCorpid}_access_token`);
    if (!access_token) {
      const token_res = await axios.get(
        `${WECOM_BASE_URL}/cgi-bin/gettoken?corpid=${wecomCorpid}&corpsecret=${wecomSecret}`
      )
      access_token = token_res.data.access_token
      await redisclient.set(`${wecomCorpid}_access_token`, access_token)
      await redisclient.expire(`${wecomCorpid}_access_token`, 60 * 60 * 1.8)
    }
    console.log(`wx Access Token: ${access_token}`)
    let reply_message = ''
    if (reply_message_cache) {
      reply_message = reply_message_cache
    } else {
      reply_message = await touchOpenAI(user_message, user)
    }
    console.log(`Reply content: ${reply_message}`)
    const status = await axios.post(
      `${WECOM_BASE_URL}/cgi-bin/message/send?access_token=${access_token}`,
      {
        touser: user,
        msgtype: type,
        agentid: wecomAgentId,
        text: {
          content: reply_message
        }
      }
    )
    console.log(`Send Status: ${JSON.stringify(status.data)}`)
    if ([40014, 42201, 42001, 42009, 42007].includes(status.data.errcode)) {
      await redisclient.del(`${wecomCorpid}_access_token`)
      console.log('wecom send error:', status.data)
      if (!reply_message_cache) {
        console.log('retry......')
        await do_reply(user_message, user, type, reply_message)
      }
    }
    await redisclient.disconnect();
  } catch (error) {
    console.log(error)
  }
}
module.exports = do_reply
