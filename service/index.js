const express = require('express')
const router = express.Router()
router.use('/', require('./wecom.send'))
router.use('/', require('./wecom.notice'))
router.use('/', require('./welcome.js'))
module.exports = router
