const express = require('express')
const router = express.Router()

router.all('/', async ({}, response) => {
  response.send('服务运行正常')
})

module.exports = router
