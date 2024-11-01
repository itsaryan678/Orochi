const fs = require('fs');
const { getTime } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

const langs = {
  en: {
    orochiapproval: `⚠ 𝗦𝘆𝘀𝘁𝗲𝗺 𝗔𝗹𝗲𝗿𝘁\n━━━━━━━━━━━━━\n\n𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 𝖺𝖽𝖽𝖾𝖽 𝗈𝗎𝗋 𝖢𝗁𝖺𝗍𝖻𝗈𝗍 𝗐𝗂𝗍𝗁𝗈𝗎𝗍 𝖮𝗐𝗇𝖾𝗋 𝖯𝖾𝗋𝗆𝗂𝗌𝗌𝗂𝗈𝗇\n𝖥𝗂𝗋𝗌𝗍 𝗒𝗈𝗎 𝗇𝖾𝖾𝖽 𝗈𝗐𝗇𝖾𝗋 𝖺𝗉𝗉𝗋𝗈𝗏𝖺𝗅 𝖿𝗈𝗋 𝖺𝖼𝖼𝖾𝗌𝗌 𝗈𝗎𝗋 𝖢𝗁𝖺𝗍𝖻𝗈𝗍 𝗂𝗇 𝗒𝗈𝗎𝗋 𝗀𝗋𝗈𝗎𝗉.\n𝖳𝗒𝗉𝖾 .𝗈𝗋𝗈𝖼𝗁𝗂𝗀𝖼 𝗍𝗈 𝗃𝗈𝗂𝗇 𝗈𝗎𝗋 𝖲𝗎𝗉𝗉𝗈𝗋𝗍 𝖦𝗋𝗈𝗎𝗉 𝖿𝗈𝗋 𝖻𝗈𝗍 𝖺𝗉𝗉𝗋𝗈𝗏𝖺𝗅.\n𝖯𝗅𝖾𝖺𝗌𝖾 𝗃𝗈𝗂𝗇 𝗈𝗎𝗋 𝗌𝗎𝗉𝗉𝗈𝗋𝗍 𝗀𝗋𝗈𝗎𝗉 𝖿𝗈𝗋 𝗒𝗈𝗎𝗋 𝗀𝗋𝗈𝗎𝗉 𝖺𝗉𝗉𝗋𝗈𝗏𝖺𝗅\n𝖫𝗂𝗇𝗄: https://m.me/j/AbaNsLua7Pl1Ywx6/\n\n𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝖼𝗁𝗈𝗈𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖢𝗁𝖺𝗍𝖻𝗈𝗍\n\n𝖮𝗋𝗈𝖼𝗁𝗂 𝗐𝗂𝗅𝗅 𝗅𝖾𝖺𝗏𝖾 𝗒𝗈𝗎𝗋 𝗀𝗋𝗈𝗎𝗉 𝗐𝗂𝗍𝗁𝗂𝗇 60 𝗌𝖾𝖼𝗈𝗇𝖽𝗌.`,
    welcomeMessage: "✅ | 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━\n\n𝖮𝗋𝗈𝖼𝗁𝗂 𝖡𝖾𝗌𝗍𝖻𝗈𝗍 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝗌𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝖼𝗈𝗇𝗇𝖾𝖼𝗍. 𝖳𝗁𝖺𝗇𝗄 𝗒𝗈𝗎 𝖿𝗈𝗋 𝗎𝗌𝗂𝗇𝗀 𝗈𝗎𝗋 𝖢𝗁𝖺𝗍𝖻𝗈𝗍",
    multiple1: "you",
    multiple2: "you all",
    defaultWelcomeMessage: `👑 | 𝗪𝗲𝗹𝗰𝗼𝗺𝗲\n━━━━━━━━━━━━\n\n𝖧𝖾𝗅𝗅𝗈 {userName}! 𝖶𝖾𝗅𝖼𝗈𝗆𝖾 𝗍𝗈 {boxName}. 𝖶𝖾'𝗋𝖾 𝗍𝗁𝗋𝗂𝗅𝗅𝖾𝖽 𝗍𝗈 𝗁𝖺𝗏𝖾 𝗒𝗈𝗎 𝗁𝖾𝗋𝖾! 🎉`,
  }
};

module.exports = {
  config: {
    name: "approval",
    version: "2.0",
    author: "ArYAN",
    category: "events"
  },

  langs,

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    const { threadID } = event;
    const botID = api.getCurrentUserID();

    const isApprovedGroup = () => {
      const approvedThreads = JSON.parse(fs.readFileSync("threadApproved.json"));
      return approvedThreads.includes(threadID);
    };

    const sendDisapprovalMessage = async () => {
      const form = {
        body: getLang("orochiapproval"),
        mentions: [{ tag: "Admin", id: botID }]
      };

      await api.sendMessage(form, threadID);

      setTimeout(() => {
        const updatedApprovedThreads = JSON.parse(fs.readFileSync("threadApproved.json"));
        if (!updatedApprovedThreads.includes(threadID)) {
          api.removeUserFromGroup(botID, threadID);
        }
      }, 60000);
    };

    const sendWelcomeMessage = async () => {
      const hours = getTime("HH");
      const { nickNameBot } = global.GoatBot.config;
      const prefix = global.utils.getPrefix(threadID);
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      if (dataAddedParticipants.some((item) => item.userFbId == botID)) {
        if (nickNameBot) api.changeNickname(nickNameBot, threadID, botID);
        return message.send(getLang("welcomeMessage", prefix));
      }

      if (!global.temp.welcomeEvent[threadID]) {
        global.temp.welcomeEvent[threadID] = {
          joinTimeout: null,
          dataAddedParticipants: []
        };
      }

      global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);

      clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);
    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
        const threadData = await threadsData.get(threadID);
        if (threadData.settings.sendWelcomeMessage === false) return;
        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const dataBanned = threadData.data.banned_ban || [];
        const threadName = threadData.threadName;
        const userName = [];
        const mentions = [];
        let multiple = false;

        if (dataAddedParticipants.length > 1) multiple = true;

        for (const user of dataAddedParticipants) {
          if (dataBanned.some((item) => item.id == user.userFbId)) continue;
          userName.push(user.fullName);
          mentions.push({ tag: user.fullName, id: user.userFbId });
        }

        if (userName.length === 0) return;

        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
        const form = {
          mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
        };
        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
          .replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

        form.body = welcomeMessage;

        message.send(form);
        delete global.temp.welcomeEvent[threadID];
      }, 1500);
    };

    if (!isApprovedGroup()) {
      await sendDisapprovalMessage();
    } else {
      if (event.logMessageType == "log:subscribe") {
        sendWelcomeMessage();
      }
    }
  }
};
