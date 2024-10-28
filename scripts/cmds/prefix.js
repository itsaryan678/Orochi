const fs = require("fs-extra");

module.exports = {
  config: {
    name: "prefix",
    version: "1.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    longDescription: {
      en: "Check bot system prefix"
    },
    category: "info",
    guide: {
      en: "   {pn} <new prefix>: change the prefix in your box chat"
        + "\n   Example:"
        + "\n    {pn} #"
        + "\n\n   {pn} <new prefix> -g: change the prefix in the system bot (only admin bot)"
        + "\n   Example:"
        + "\n    {pn} # -g"
        + "\n\n   {pn} reset: reset the prefix in your box chat to default"
    }
  },

  langs: {
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change the prefix of the system bot",
      confirmGlobal: "Please react to this message to confirm changing the prefix of the system bot",
      confirmThisThread: "Please react to this message to confirm changing the prefix in your box chat",
      successGlobal: "Changed the prefix of the system bot to: %1",
      successThisThread: "Changed the prefix in your box chat to: %1",
      myPrefix: "🤖 𝗢𝗿𝗼𝗰𝗵𝗶 𝗕𝗲𝘀𝘁𝗯𝗼𝘁\n━━━━━━━━━━━━\n\n𝗛𝗲𝗹𝗹𝗼! 𝗠𝘆 𝗽𝗿𝗲𝗳𝗶𝘅 𝗶𝘀 [ %2 ]\n\n𝖮𝗋𝗈𝖼𝗁𝗂𝖡𝗈𝗍 𝖱𝖾𝗏𝗈𝗅𝗎𝗍𝗂𝗈𝗇𝗂S𝖾𝖽 𝗆𝖾𝗌𝗌𝖺𝗀𝖾 𝗌𝗒𝗌𝗍𝖾𝗆, 𝖺𝗅𝗅𝗈𝗐𝗂𝗇𝗀 𝖾𝖺𝗌y-𝗍𝗈-𝗎𝗌𝖾 𝖺𝗇𝖽 𝖾𝖺𝗌y-to-𝗋𝖾𝗎𝗌𝖾 𝗌𝗍𝗒l𝖾𝗌𝗁𝖾𝖾𝗍𝗌 𝗍𝗁𝖺𝗍 𝖺𝖽𝖽𝗌 𝗎𝗇𝗂𝖼𝗈𝖽𝖾 𝗌𝗍𝗒𝖾𝗅𝖾 𝗍𝗈 𝗒𝗈𝗎𝗋 𝖻𝗈𝗍 𝗆𝖾𝗌𝗌𝖺𝗀𝖾 𝗐𝗂𝗍𝗁 𝖾𝖺𝗌𝖾, 𝗐𝗂𝗍𝗁 𝖺 𝖻𝖾𝗍𝗍𝖾𝗋 𝗁𝖺𝗇𝖽𝗅𝗂𝗇𝗀 𝗌𝗒𝗌𝗍𝖾𝗆, 𝖺𝗏𝗈𝗂𝖽𝗂𝗇𝗀 𝗍𝗁𝖾 𝗋𝗂𝗌𝗄 𝗈𝖿 𝖺𝖼𝖼𝗈𝗎𝗇𝗍 𝗌𝗎𝗌𝗉𝖾𝗇𝗌𝗂𝗈𝗇!\n\n👑 𝗗𝗲𝘃: 𝖠𝗋𝗒𝖺𝗇 𝖢𝗁𝖺𝗎𝗁𝖺𝗇"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0] === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2)
        return message.reply(getLang("onlyAdmin"));
      else
        formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author)
      return;
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }
    else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      return () => {
        return message.reply(getLang("myPrefix", global.GoatBot.config.prefix, utils.getPrefix(event.threadID)));
      };
    }
  }
};
