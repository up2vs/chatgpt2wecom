const express = require('express')
const localStorage = require('localStorage')
const { openAIKey } = require('../config')
const router = express.Router()

let api = (async () => {
  const { ChatGPTAPI } = await import('chatgpt')
  api = new ChatGPTAPI({ apiKey: openAIKey })
})()

router.all('/chatgpt', async ({ query: { string } }, response) => {
  try {
    let message = {}
    let object = {}
    if (localStorage.message) {
      message = JSON.parse(localStorage.message)
    }
    if (message.id) {
      object = await api.sendMessage(string, {
        conversationId: message.conversationId,
        parentMessageId: message.id
      })
    } else {
      object = await api.sendMessage(string)
    }
    localStorage.setItem('message', JSON.stringify(object))
    response.send({
      choices: object.detail.choices
    })
  } catch (error) {
    console.log(error)
    response.send({
      choices: [{ text: JSON.stringify(error) }]
    })
  }
})

module.exports = router
