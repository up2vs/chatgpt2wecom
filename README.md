# Toolbox

## 企业微信 ChatGPT 机器人

### 前期条件 🛠

成为对应企业下的企业微信管理员

域名[[需配置备案主体与当前企业主体相同或有关联关系的域名](https://open.work.weixin.qq.com/wwopen/common/readDocument/40754)]

已安装 `Git` 及 `NodeJS` ( `18.0` 或更高版本) 的服务器

### 部署流程 📦

#### 1.进入[企业微信后台](https://work.weixin.qq.com/)选择企业登录

👉 我的企业

记录 `企业 ID（wecomCorpid）`

👉 应用管理 👉 自建 👉 创建应用 👉 进入应用详情页

记录 `AgentId（wecomAgentId）` 及 `Secret（wecomSecret）`

👉 进入应用详情页 👉 接收消息 👉 设置 API 接收

记录 `Token(wecomToken)` 及 `EncodingAESKey（wecomEncodingAESKey）`（先不要点击保存，后续再进行操作）

#### 2.连接服务器

安装 `toolbox-cli-js` 用于构建项目

```
npm install toolbox-cli-js -g
```

使用 `init` 命令构建项目，按照提示输入对应内容，格式详见附件：`参数格式示例`

```
toolbox-cli-js init
```

创建成功后，执行以下命令安装所需依赖

```
cd toolbox && npm install
```

#### 3.安装 `PM2` 部署服务，已安装可以跳过此步

```
npm install pm2 -g
```

等待安装完成，使用以下命令部署服务，启动端口号默认为`3316`，查看服务运行状态及运行日志详见附件：`查看服务运行状态及运行日志`

```
pm2 start index.js --name toolbox
```

#### 4.请登录您的域名注册商控制面板解析域名，并连接服务`3316`端口（不强制 `HTTPS`）

方法示例：使用 Nginx 代理本地端口

```
location / {
    proxy_pass http://127.0.0.1:3316;
}
```

解析完成后访问您的域名，提示`服务运行正常`则为部署成功

```
http://您的域名
```

#### 5.返回[企业微信后台](https://work.weixin.qq.com/)进入自建应用详情页

👉 应用管理 👉 进入应用详情页 👉 接收消息 👉 设置 API 接收

填写 `接收消息服务器配置`

```
URL填写的URL需要正确响应企业微信验证URL的请求。
http://您的域名/wecom/notice

Token
记录的Token(wecomToken)

EncodingAESKey
记录的EncodingAESKey（wecomEncodingAESKey）
```

填写完成点击保存提示成功

👉 应用管理 👉 进入应用详情页 👉 企业可信 IP

添加当前服务器 IP 为企业可信 IP

完成以上步骤 所有功能部署完成 ✨

进入企业微信应用发送消息进行测试，正常收到回复为部署成功，无回复请查看服务日志进行问题排查 详见附件`查看服务运行状态及运行日志`

#### 附件 查看服务运行状态及运行日志 📎

查看服务运行状态：

```
pm2 status
```

服务实时运行日志：

```
pm2 monit
```

#### 附件 参数格式示例 📎

```
wecomAgentId: 1000001, // 企业微信应用 agentId
wecomToken: 'Token', // 企业微信应用 token
wecomEncodingAESKey: 'KXJ1askbWOdMrMR8kDPuUKi8hF7MwoXym8888888888', // 企业微信应用 encodingAESKey
wecomCorpid: 'wwee0f1adfac012345', // 企业微信应用 corp_id
wecomSecret: 'M53AM9o6G5YhB7jOrKj52sJj4djRD8tnrL2uoB12345', // 企业微信应用 app_secret
openAIKey: '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,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', // openAIKey 支持多条传入,请使用逗号","分隔。遇到余额不足、Too Many Requests等异常提示自动切换
```

#### 未来计划 📆

1.支持可选功能部署，优化包体积

2.解决同一台服务不同用户共享上下文信息问题

3.使用某种云函数平台部署，简化部署流程，摆脱服务器的限制

4.增加更多可配置参数

请持续关注此仓库，未来会有更多功能更新，请查看 [Cydiar](https://twitter.com/Cydiar404) 在推特上的最新动态
