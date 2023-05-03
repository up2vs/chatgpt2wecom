const { openAIKey } = require('../config')
const { Configuration, OpenAIApi } = require('openai')
const { createClient } = require('redis')

const touchOpenAI = async function (content, user) {
  console.log('touch openai content:' + content)
  let messages = []
  const redisclient = createClient({ url: 'redis://127.0.0.1:6379' });
  redisclient.on('error', err => console.log('Redis Client Error', err));
  await redisclient.connect();
  let user_conversation = await redisclient.get(`${user}_conversation`);
  //console.log('user_conversation form redis:', user_conversation)
  if (user_conversation) {
    try {
      user_conversation = JSON.parse(user_conversation)
      if (!user_conversation || !user_conversation.length) {
        user_conversation = []
      } else {
        user_conversation = user_conversation.slice(-500) //limit 500
      }
      //console.log('user_conversation form redis parse:', user_conversation)
    } catch (error) {
      console.log(JSON.stringify(error))
      user_conversation = []
    }
    messages = messages.concat(user_conversation)
  }
  let role = 'user'
  if (content.match(/^(假如你|你现在|现在你|比如你|假设你)/)) {
    role = 'system'
    messages = []
  }
  let msg_row = { role, content }
  messages.push(msg_row)
  let completionObject = {
    model: 'gpt-3.5-turbo',
    messages,
    user,
    // max_tokens: 4000
  }
  console.log('completionObject:', completionObject)
  let reply_message = null
  try {
    const configuration = new Configuration({
      apiKey: openAIKey
    })
    const openai = new OpenAIApi(configuration)
    const completion = await openai.createChatCompletion(completionObject)
    console.log('completion response:', completion.data)
    reply_message = completion.data.choices[0].message
  } catch (error) {
    console.info(error)
  }
  if (reply_message && reply_message.content) {
    messages.push(reply_message)
    await redisclient.set(`${user}_conversation`, JSON.stringify(messages)) //保持会话
    await redisclient.disconnect();
    return reply_message.content
  } else {
    await redisclient.set(`${user}_conversation`, null) //保持会话
    await redisclient.disconnect();
    // return error.message
    return `${error.message}|请重复你的问题`
  }
}

module.exports = touchOpenAI
