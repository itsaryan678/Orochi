const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "noti",
    version: "2.0",
    author: "NTKhang | ArYAN",
    countDown: 0,
    role: 2,
    longDescription: {
      en: "Send announcement to all box chats"
    },
    category: "owner",
    guide: {
      en: "{pn} <your message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "⛔|𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗲\n━━━━━━━━━━━━━━━\n\n⁉ Please enter the message you want to send to all groups",
      notification: "📢|𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻",
      sendingNotification: "✅|𝗦𝗲𝗻𝗱𝗶𝗻𝗴\n━━━━━━━━━━━━━━━\n\nStart sending notification from admin bot to %1 chat groups",
      sentNotification: "✅|𝗗𝗼𝗻𝗲\n\nSent notification to %1 groups successfully",
      errorSendingNotification: "⛔|𝗘𝗿𝗿𝗼𝗿\n\nAn error occurred while sending to [ %1 ] groups:\n[ %2 ]"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang, usersData }) {
    const userInfo = await usersData.get(event.senderID);
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));
    const formSend = {
      body: `${getLang("notification")} 𝗳𝗿𝗼𝗺 ${userInfo.name}\n\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSucces = 0;
    const sendError = [];
    const wattingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        wattingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      }
      catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of wattingSend) {
      try {
        await sended.pending;
        sendSucces++;
      }
      catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({
            threadIDs: [sended.threadID],
            errorDescription
          });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    let msg = "";
    if (sendSucces > 0)
      msg += getLang("sentNotification", sendSucces) + "\n";
    if (sendError.length > 0)
      msg += getLang("errorSendingNotification", sendError.reduce((a, b) => a + b.threadIDs.length, 0), sendError.reduce((a, b) => a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`, ""));
    message.reply(msg);
  }
};
