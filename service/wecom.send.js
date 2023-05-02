const express = require('express')
const { touchOpenAI } = require('openai.js')
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

router.all('/wecom/send', async ({ query: { string, user, type } }, response) => {
  try {
    const redisclient = createClient();
    redisclient.on('error', err => console.log('Redis Client Error', err));
    await redisclient.connect();
    const access_token = await client.get(`${wecomCorpid}_access_token`);
    if (!access_token) {
      const {
        data: { access_token }
      } = await axios.get(
        `${WECOM_BASE_URL}/cgi-bin/gettoken?corpid=${wecomCorpid}&corpsecret=${wecomSecret}`
      )
      await redisclient.set(`${wecomCorpid}_access_token`, access_token)
    }
    console.log(`Access Token: ${access_token}`)
    const message = await touchOpenAI(string, user)
    console.log(`Reply content: ${message}`)
    const status = await axios.post(
      `${WECOM_BASE_URL}/cgi-bin/message/send?access_token=${access_token}`,
      {
        touser: user,
        msgtype: type,
        agentid: wecomAgentId,
        text: {
          content: data.choices[0].message.content.trim()
        }
      }
    )
    console.log(`Send Status: ${JSON.stringify(status.data)}`)
    if ([40014, 42201, 42001].includes(status.data.errcode)) {
      await redisclient.set(`${wecomCorpid}_access_token`, null)
    }
    await redisclient.disconnect();
    response.send('')
  } catch (error) {
    await redisclient.disconnect();
    console.log(error)
    response.send('')
  }
})

module.exports = router
