const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "richest",
    aliases: ["rich", "top"],
    version: "1.3",
    author: "ArYAN",
    role: 0,
    shortDescription: {
      en: "Top Users"
    },
    longDescription: {
      en: "Get list of top users by experience"
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const number = 10; 
    const allUsers = await usersData.getAll();

    const usersWithExp = allUsers.filter(user => user.exp > 0).sort((a, b) => b.exp - a.exp).slice(0, number);

    if (usersWithExp.length < number) {
      message.reply(`There are not enough users with experience points to display a top ${number}.`);
      return;
    }

    const topUsersList = usersWithExp.map((user, index) => 
      `✤━━━━[  ${index + 1} ]━━━━✤\n
      ℹ 𝗨𝘀𝗲𝗿 𝗡𝗮𝗺𝗲: ${user.name}
      🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${user.userID}
      💸 𝗨𝘀𝗲𝗿 𝗠𝗼𝗻𝗲𝘆: ${user.money}
      🌟 𝗨𝘀𝗲𝗿 𝗘𝘅𝗽: ${user.exp}\n\n`
    );

    api.setMessageReaction('👑', event.messageID, () => {}, true);

    const messageText = `✨ Top ${number} Users by Experience\n\n${topUsersList.join('\n')}`;

    message.reply(messageText);
  }
};
