const fs = require("fs");

module.exports = {
  config: {
    name: "balance",
    aliases: [`bal`],
    version: 1.1,
    author: "ArYAN",
    shortDescription: { 
       en: "Check your balance or transfer money" },
    longDescription: { 
       en: "Check your balance or transfer money" },
    category: "fun",
    guide: { 
       en: ".bal - Check your balance\n.money transfer [recipient] [amount] - Transfer money" }
  },

onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData }) {
    const command = args[0];
    const senderID = event.senderID;
    const userData = await usersData.get(senderID);
    const userName = userData ? userData.name : "Unknown User";
    const userMoney = userData?.money || 0;

   // Define currentDate and currentTime variables outside of the if block
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    if (command === "transfer") {
      const recipient = args[1];
      const amount = parseFloat(args[2]);

      if (isNaN(amount)) {
        message.reply("⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗔𝗺𝗼𝘂𝗻𝘁\n\n✤━━━━━━━━━━━━━✤\n➤ Invalid amount. Please provide a valid number. (◍•ᴗ•◍)\n✤━━━━━━━━━━━━━✤");
        return;
      }

      if (userMoney < amount) {
        message.reply("⛔ 𝗡𝗼 𝗠𝗼𝗻𝗲𝘆\n\n✤━━━━━━━━━━━━━✤\n➤ You don't have enough money to transfer. (◕ᴗ◕✿)\n✤━━━━━━━━━━━━━✤");
        return;
      }

      const recipientData = await usersData.get(recipient);
      const recipientName = recipientData ? recipientData.name : "Unknown User";
      const transferAmount = Math.floor(amount * 0); 

      if (recipientData) {
        const recipientMoney = recipientData.money || 0;
        const senderData = await usersData.get(senderID);
        const senderMoney = senderData.money || 0;

        if (senderMoney >= amount) {
          const updatedSenderMoney = senderMoney - amount;
          const updatedRecipientMoney = recipientMoney + transferAmount;

          await usersData.set(senderID, { money: updatedSenderMoney });
          await usersData.set(recipient, { money: updatedRecipientMoney });

          message.reply(`✅ 𝗧𝗿𝗮𝗻𝘀𝗳𝗲𝗿𝗲𝗱\n\n✤━━━━━━━━━━━━━✤\n➤ Successfully transferred your money to user.\n💰 𝗔𝗺𝗼𝘂𝗻𝘁\n➤ ${transferAmount} \nℹ 𝗡𝗮𝗺𝗲\n➤ ${recipientName}\n🆔 𝗜𝗗\n➤ ${senderID}\n\n📅 𝗗𝗮𝘁𝗲\n➤ ${currentDate}\n⏰ 𝗧𝗶𝗺𝗲\n➤ ${currentTime}\n✤━━━━━━━━━━━━━✤`);
        } else {
          message.reply(`⛔ 𝗡𝗼 𝗠𝗼𝗻𝗲𝘆\n\n✤━━━━━━━━━━━━━✤\n➤ You don't have enough money to transfer, please check your balance then try again your request. (◕ᴗ◕✿)\n💰 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗕𝗮𝗹𝗮𝗻𝗰𝗲\n➤ ${userMoney}\n🆔 𝗜𝗗\n➤ ${senderID}\n📅 𝗗𝗮𝘁𝗲\n➤ ${currentDate}\n⏰ 𝗧𝗶𝗺𝗲\n➤ ${currentTime}\n✤━━━━━━━━━━━━━✤`);
        }
      } else {
        message.reply("⛔ 𝗡𝗼 𝗗𝗮𝘁𝗮\n\nRecipient not found. (◍•ᴗ•◍)");
      }
    } else if (command === "showall") {
      // Show all users money data
      const allUsersData = await usersData.getAll();
      let usersMoneyData = "💰 All Users Money Data:\n";
      allUsersData.forEach(user => {
        usersMoneyData += `➤ User: ${user.name}, ID: ${user.userID}, Money: ${user.money}\n`;
      });
      message.reply(usersMoneyData);
    } else {
      // Show user balance
      message.reply(`\n✤━━━━━━━━━━━━━━━━✤\nℹ 𝗡𝗮𝗺𝗲\n➤ ${userName}\n\n💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲\n➤ ${userMoney}\n\n🆔 𝗜𝗗\n➤ ${senderID}\n\n📢 𝗛𝗲𝗹𝗽 𝗧𝗵𝗲𝗮𝗺\n➤ money transfer [recipient] [amount] - Transfer money\n✤━━━━━━━━━━━━━━━━✤\n`);
    }
  }
};
