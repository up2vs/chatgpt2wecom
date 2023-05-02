const express = require('express')
const router = express.Router()
const localStorage = require('localStorage')

const { openAIKey } = require('../config')
const { Configuration, OpenAIApi } = require('openai')

router.all('/openai', async ({ query: { string, user } }, response) => {
  let keychain = openAIKey.split(',')
  let apiKey = ''
  let messages = []
  let new_conversation = false
  if (string.match(/^###/)) {
    if (localStorage[`${user}_conversation_id`]) {
      localStorage.removeItem(`${user}_conversation_id`)
      if (string == '###') {
        response.send({
          choices: [{ message: { content: '会话已结束' } }]
        })
        return;
      }
    }
    new_conversation = true //保持会话
    string = string.replace(/^###/, '')
  }
  if (localStorage.openAIKey) {
    apiKey = localStorage.openAIKey
  } else {
    apiKey = keychain[0]
    localStorage.setItem('openAIKey', apiKey)
  }
  let msg_row = { role: 'user', content: string, max_tokens: 1200, user }
  if (localStorage[`${user}_conversation_id`]) {
    msg_row['conversation_id'] = localStorage[`${user}_conversation_id`]
  }
  messages.push(msg_row)
  try {
    const configuration = new Configuration({
      apiKey
    })
    const openai = new OpenAIApi(configuration)
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages
    })
    if (new_conversation && completion.data && completion.data.conversation_id) {
      localStorage.setItem(`${user}__conversation_id`, completion.data.conversation_id)
    }
    response.send({
      choices: completion.data.choices
    })
  } catch (error) {
    response.send({
      choices: [{ message: { content: error.message } }]
    })
  }
})

module.exports = router
