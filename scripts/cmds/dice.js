const axios = require('axios');

module.exports = {
  config: {
    name: "dice",
    aliases: [],
    version: "1.2",
    author: "itz Aryan",
    countDown: 0,
    role: 0,
    longDescription: {
      en: "Roll a dice and try your luck against the bot to win money!",
    },
    category: "fun",
    guide: {
      en: "{pn} <bet_amount> - Place a bet and roll a dice against the bot."
    }
  },
  onStart: async function ({ message, event, usersData, api, args }) {
    try {
      const betAmount = parseInt(args[0], 10);
      const diceSymbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

      if (isNaN(betAmount) || betAmount <= 0) {
        return api.sendMessage("Please enter a valid positive bet amount.", event.threadID, event.messageID);
      }

      const userData = await usersData.get(event.senderID);
      const userMoney = userData.money || 0;

      if (betAmount > userMoney) {
        return api.sendMessage("You don't have enough money to place this bet.", event.threadID, event.messageID);
      }

      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;

      const userRoll = Math.floor(Math.random() * 6) + 1;
      const botRoll = Math.floor(Math.random() * 6) + 1;

      const userDiceSymbol = diceSymbols[userRoll - 1];
      const botDiceSymbol = diceSymbols[botRoll - 1];

      let resultMessage = '';

      if (userRoll > botRoll) {
        userData.money += betAmount * 2; // Win double the bet amount
        resultMessage = `🎉 Congratulations ${userName}! You won ${betAmount * 2} money.\n\nYour roll: ${userDiceSymbol} (${userRoll})\nBot roll: ${botDiceSymbol} (${botRoll})`;
      } else if (userRoll < botRoll) {
        userData.money -= betAmount; 
        resultMessage = `Sorry ${userName}, you lost ${betAmount} money.\n\nYour roll: ${userDiceSymbol} (${userRoll})\nBot roll: ${botDiceSymbol} (${botRoll})`;
      } else {
        resultMessage = `It's a tie!\n\nYour roll: ${userDiceSymbol} (${userRoll})\nBot roll: ${botDiceSymbol} (${botRoll})\nNo money was won or lost.`;
      }

      api.sendMessage(resultMessage, event.threadID, event.messageID);
      await usersData.set(event.senderID, userData);
    } catch (error) {
      console.error("Error processing dice command:", error);
      api.sendMessage("There was an error processing your request. Please try again later.", event.threadID, event.messageID);
    }
  }
};
