const express = require('express')
const { decrypt, getSignature } = require('@wecom/crypto')
const { wecomToken, wecomEncodingAESKey } = require('../config')
const router = express.Router()

router.all('/wecom/notice', ({ query: { msg_signature, timestamp, nonce, echostr } }, response) => {
  const signature = getSignature(wecomToken, timestamp, nonce, echostr)
  if (signature !== msg_signature) {
    response.send('')
  } else {
    const { message } = decrypt(wecomEncodingAESKey, echostr)
    response.send(message)
  }
})

module.exports = router
