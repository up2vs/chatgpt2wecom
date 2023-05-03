# chatgpt2wecom
## chatgpt2wecom / ChatGPT 企业微信 机器人 / 支持会话保持 /

### 准备条件

企业微信管理员身份

域名[[需配置备案主体与当前企业主体相同或有关联关系的域名](https://open.work.weixin.qq.com/wwopen/common/readDocument/40754)]

服务器端需已安装 `Git` 、`NodeJS`、`Redis`

### 部署流程 

#### 1.进入[企业微信后台](https://work.weixin.qq.com/)选择企业登录

👉 我的企业

记录 `企业 ID（wecomCorpid）`

👉 应用管理 👉 自建 👉 创建应用 👉 进入应用详情页

记录 `AgentId（wecomAgentId）` 及 `Secret（wecomSecret）`

👉 进入应用详情页 👉 接收消息 👉 设置 API 接收

记录 `Token(wecomToken)` 及 `EncodingAESKey（wecomEncodingAESKey）`（先不要点击保存，后续再进行操作）

#### 2.部署服务器

```
#For Linux 

git clone https://github.com/up2vs/chatgpt2wecom.git
cd chatgpt2wecom && npm install
cd config
mv index.demo.js index.js
vim index.js 
```

```
// /config/index.js 配置文件示例
wecomAgentId: 1000001, // 企业微信应用 agentId
wecomToken: 'Token', // 企业微信应用 token
wecomEncodingAESKey: 'KXJ1askbWOdMrMR8kDPuUKi8hF7MwoXym8888888888', // 企业微信应用 encodingAESKey
wecomCorpid: 'wwee0f1adfac012345', // 企业微信应用 corp_id
wecomSecret: 'M53AM9o6G5YhB7jOrKj52sJj4djRD8tnrL2uoB12345', // 企业微信应用 app_secret
openAIKey: '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', // openAIKey
redisUrl:'redis://127.0.0.1:6379'

```



#### 3.安装 `PM2` 部署服务，已安装可以跳过此步

```
npm install pm2 -g
```

等待安装完成，使用以下命令部署服务，启动端口号默认为`3316`，查看服务运行状态及运行日志详见附件：`查看服务运行状态及运行日志`

```
cd chatgpt2wecom
pm2 start index.js --name chatgpt2wecom
pm2 list  //可查看服务运行状态
pm2 logs  //可查看服务日志

```

#### 4.配置nginx 

```
server {
        listen       80;
        server_name  xxxx.yourdomain.com;

        location ~/WW_verify_rjlifQsMVXzCVFf2.txt{    //用于域名验证
                return 200 'rjlifQsMVXzCVFf2';
        }
        location ~ /{
                proxy_pass http://127.0.0.1:3316;
                proxy_set_header  Host $host;
                proxy_set_header  X-Real-IP  $remote_addr;
                client_max_body_size  10m;
        }
}

```

解析完成后访问您的域名，提示`服务运行正常`则为部署成功

```
http://xxxx.yourdomain.com

```

#### 5.返回[企业微信后台](https://work.weixin.qq.com/)进入自建应用详情页

👉 应用管理 👉 进入应用详情页 👉 接收消息 👉 设置 API 接收

填写 `接收消息服务器配置`

```
URL填写的URL需要正确响应企业微信验证URL的请求。
http://xxxx.yourdomain.com/wecom/notice

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
