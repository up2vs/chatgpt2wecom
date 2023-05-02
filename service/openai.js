const express = require('express')
const router = express.Router()
const localStorage = require('localStorage')

const { openAIKey } = require('../config')
const { Configuration, OpenAIApi } = require('openai')

router.all('/openai', async ({ query: { string, user } }, response) => {
  let apiKey = ''
  let keychain = openAIKey.split(',')
  if (localStorage.openAIKey) {
    apiKey = localStorage.openAIKey
  } else {
    apiKey = keychain[0]
    localStorage.setItem('openAIKey', apiKey)
  }

  let messages = []
  let user_conversation = localStorage[`${user}_conversation`] //用户会话
  if (user_conversation) {
    user_conversation = user_conversation.slice(-500) //limit 500
    messages.concat(user_conversation)
  }
  let role = 'user'
  if (string.match(/^(假如|你现在|现在你|比如|假设)/)) {
    role = 'system'
  }
  let msg_row = { role, content: string }
  messages.push(msg_row)
  let completionObject = {
    model: 'gpt-3.5-turbo',
    messages,
    user,
    max_tokens: 1200
  }
  console.log('completionObject:', completionObject)
  try {
    const configuration = new Configuration({
      apiKey
    })
    const openai = new OpenAIApi(configuration)
    const completion = await openai.createChatCompletion(completionObject)
    console.log('completion response:', completion.data)
    messages.push(completion.data.choices[0].message)
    localStorage.setItem(`${user}_conversation`, messages) //保持会话
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
