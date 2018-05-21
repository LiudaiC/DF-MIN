// module.exports = ctx => {
//   bot.restart()
//   var uuid = bot.PROP.uuid;
    
//   console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid)
//   ctx.state.data = 'https://login.weixin.qq.com/qrcode/' + uuid;

// }

// bot.on('message', msg => {
//   console.log(msg)
//   bot.sendText('哈哈哈', '虾米')
//   switch (msg.MsgType) {
//     case bot.CONF.MSGTYPE_STATUSNOTIFY:
//       break
//     case bot.CONF.MSGTYPE_TEXT:
//       break
//     case bot.CONF.MSGTYPE_RECALLED:
//       break
//   }
// })