const express = require('express')
const router = express.Router()

router.use('/', require('./chatgpt.js'))
router.use('/', require('./openai.js'))
router.use('/', require('./wecom.send'))
router.use('/', require('./wecom.notice'))
router.use('/', require('./cydiar.redirect'))

module.exports = router
