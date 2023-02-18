#!/usr/bin/env node

const program = require('commander')
const shell = require('shelljs')
const inquirer = require('inquirer')
const fs = require('fs')
const repo = 'https://github.com/streetlight3316/toolbox.git'

program
  .command('init')
  .description('Initialize toolbox-cli-js with a Git repository')
  .action(async () => {
    if (!shell.which('git')) {
      console.log('Git 未安装或未配置到系统的 PATH 环境变量中')
      return
    }
    // Clone the repository
    shell.exec(`git clone ${repo}`)

    // Ask the user for configuration information
    const {
      wecomAgentId,
      wecomToken,
      wecomEncodingAESKey,
      wecomCorpid,
      wecomSecret,
      openAIKey,
      port
    } = await inquirer.prompt([
      {
        type: 'input',
        name: 'wecomAgentId',
        message: '请输入企业微信应用 agentId'
      },
      {
        type: 'input',
        name: 'wecomToken',
        message: '请输入企业微信应用 token'
      },
      {
        type: 'input',
        name: 'wecomEncodingAESKey',
        message: '请输入企业微信应用 encodingAESKey'
      },
      {
        type: 'input',
        name: 'wecomCorpid',
        message: '请输入企业微信应用 corp_id'
      },
      {
        type: 'input',
        name: 'wecomSecret',
        message: '请输入企业微信应用 app_secret'
      },
      {
        type: 'input',
        name: 'openAIKey',
        message: '请输入openAIKey'
      },
      {
        type: 'input',
        name: 'port',
        message: '请输入端口号（默认3316） port'
      }
    ])
    await fs.writeFileSync(
      'toolbox/config/index.js',
      `module.exports = {
  wecomAgentId: ${wecomAgentId}, // 企业微信应用 agentId
  wecomToken: '${wecomToken}', // 企业微信应用 token
  wecomEncodingAESKey: '${wecomEncodingAESKey}', // 企业微信应用 encodingAESKey
  wecomCorpid: '${wecomCorpid}', // 企业微信应用 corp_id
  wecomSecret: '${wecomSecret}', // 企业微信应用 app_secret
  openAIKey: '${openAIKey}', // openAIKey
  port: ${port || 3316}, // 服务运行端口号 port (请保留该默认字段)
  WECOM_BASE_URL: 'https://qyapi.weixin.qq.com', // 企业微信应用 WECOM_BASE_URL (请保留该默认字段)
  TOOLBOX_BASE_URL: 'http://127.0.0.1:${
    port || 3316
  }' // 本地请求路径 TOOLBOX_BASE_URL (请保留该默认字段)
}`
    )
    console.log(`
    成功!请按顺序执行以下命令进行部署✨
    cd toolbox
    npm install
    npm install pm2 -g
    pm2 start index.js --name toolbox
    `)
  })

program.parse(process.argv)
