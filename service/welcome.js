const express = require('express')
const router = express.Router()

router.all('/', async ({ }, response) => {
  response.send('<h1>Welcome ChatGPT2WECOM! Service Is Online .</h1>')
})

module.exports = router
