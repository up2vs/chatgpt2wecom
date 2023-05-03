const express = require('express')
const touchOpenAI = require('./openai.js')
const { createClient } = require('redis')

const {
  wecomAgentId,
  wecomCorpid,
  wecomSecret,
  WECOM_BASE_URL,
  TOOLBOX_BASE_URL
} = require('../config')
const axios = require('axios')
const router = express.Router()

router.all('/wecom/send', async ({ query: { string, user, type, retry } }, response) => {
  try {
    const redisclient = createClient({ url: 'redis://127.0.0.1:6379' });
    redisclient.on('error', err => console.log('Redis Client Error', err));
    await redisclient.connect();
    const access_token = await redisclient.get(`${wecomCorpid}_access_token`);
    if (!access_token) {
      const {
        data: { access_token }
      } = await axios.get(
        `${WECOM_BASE_URL}/cgi-bin/gettoken?corpid=${wecomCorpid}&corpsecret=${wecomSecret}`
      )
      await redisclient.set(`${wecomCorpid}_access_token`, access_token)
      await redisclient.expire(`${wecomCorpid}_access_token`, 60 * 60 * 1.8)
    }
    console.log(`wx Access Token: ${access_token}`)
    const message = await touchOpenAI(string, user)
    console.log(`Reply content: ${message}`)
    const status = await axios.post(
      `${WECOM_BASE_URL}/cgi-bin/message/send?access_token=${access_token}`,
      {
        touser: user,
        msgtype: type,
        agentid: wecomAgentId,
        text: {
          content: message
        }
      }
    )
    console.log(`Send Status: ${JSON.stringify(status.data)}`)
    if ([40014, 42201, 42001, 42009, 42007].includes(status.data.errcode)) {
      await redisclient.del(`${wecomCorpid}_access_token`)
      if (!retry) {
        console.log('wecom send error:', status.data)
        console.log('retry......')
        await axios.get(`${TOOLBOX_BASE_URL}/wecom/send?string=${string}&user=${user}&type=${type}&retry=true`)
      }
    }
    await redisclient.disconnect();
    response.send('')
  } catch (error) {
    //await redisclient.disconnect();
    console.log(error)
    response.send('')
  }
})

module.exports = router
