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
      en: "Get list of top users by wealth"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const number = 10; 
    const allUsers = await usersData.getAll();

    const topUsersByMoney = allUsers
      .sort((a, b) => b.money - a.money)
      .slice(0, number);

    if (topUsersByMoney.length < number) {
      message.reply(`There are not enough users to display a top ${number}.`);
      return;
    }

    const topUsersList = topUsersByMoney.map((user, index) => 
      `✤━━━━[  ${index + 1} ]━━━━✤\n
      ℹ 𝗨𝘀𝗲𝗿 𝗡𝗮𝗺𝗲: ${user.name}
      🆔 𝗨𝘀𝗲𝗿 𝗜𝗗: ${user.userID}
      💸 𝗨𝘀𝗲𝗿 𝗠𝗼𝗻𝗲𝘆: ${user.money}\n\n`
    );

    api.setMessageReaction('👑', event.messageID, () => {}, true);

    const messageText = `✨ Top ${number} Users by Wealth\n\n${topUsersList.join('\n')}`;

    message.reply(messageText);
  }
};
