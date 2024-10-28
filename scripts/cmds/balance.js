module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "1.4",
    author: "NTKhang, edited by Rômeo",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem số tiền hiện có của bạn hoặc người được tag",
      en: "view your money or the money of the tagged person"
    },
    category: "fun",
    guide: {
      vi: "   {pn}: xem số tiền của bạn"
        + "\n   {pn} <@tag>: xem số tiền của người được tag"
        + "\n   {pn} transfer <userID> <amount>: chuyển tiền cho người dùng",
      en: "   {pn}: view your money"
        + "\n   {pn} <@tag>: view the money of the tagged person"
        + "\n   {pn} transfer <userID> <amount>: transfer money to a user"
    }
  },

  langs: {
    vi: {
      money: "Bạn đang có %1$",
      moneyOf: "%1 đang có %2$",
      transferSuccess: "Bạn đã chuyển thành công %1$ đến %2 ( %3 ). Số tiền hiện tại của bạn là %4$.",
      receiveMoney: "Bạn đã nhận được %1$ từ %2 ( %3 ). Số tiền hiện tại của bạn là %4$.",
      notEnoughMoney: "Bạn không đủ tiền để thực hiện giao dịch.",
      invalidInput: "Vui lòng cung cấp một userID hợp lệ và số tiền lớn hơn 0."
    },
    en: {
      money: "You have %1$",
      moneyOf: "%1 has %2$",
      transferSuccess: "You have successfully transferred %1$ to %2 ( %3 ). Your current balance is %4$.",
      receiveMoney: "You have received %1$ from %2 ( %3 ). Your current balance is %4$.",
      notEnoughMoney: "You do not have enough money to make this transfer.",
      invalidInput: "Please provide a valid userID and an amount greater than 0."
    }
  },

  onStart: async function ({ message, usersData, event, getLang, args, api }) {
    if (args[0] === "transfer") {
      // Balance transfer functionality
      const senderID = event.senderID;
      const receiverID = args[1];
      const amount = parseInt(args[2], 10);

      if (!receiverID || isNaN(amount) || amount <= 0) {
        return message.reply(getLang("invalidInput"));
      }

      // Fetch sender and receiver data
      const senderData = await usersData.get(senderID);
      const receiverData = await usersData.get(receiverID);

      // Fetch sender and receiver names
      const senderName = (await api.getUserInfo(senderID))[senderID].name;
      const receiverName = (await api.getUserInfo(receiverID))[receiverID].name;

      if (!senderData) {
        return message.reply("Sender data not found.");
      }

      if (!receiverData) {
        return message.reply("Receiver data not found.");
      }

      // Check if sender has enough money
      if ((senderData.money || 0) < amount) {
        return message.reply(getLang("notEnoughMoney"));
      }

      // Update balances
      senderData.money = (senderData.money || 0) - amount;
      receiverData.money = (receiverData.money || 0) + amount;

      // Save updated data
      await usersData.set(senderID, senderData);
      await usersData.set(receiverID, receiverData);

      // Notify sender only
      message.reply(getLang("transferSuccess", amount, receiverName, receiverID, senderData.money));

    } else if (Object.keys(event.mentions).length > 0) {
      // View balance of tagged users
      const uids = Object.keys(event.mentions);
      let msg = "";
      for (const uid of uids) {
        const userMoney = await usersData.get(uid, "money");
        msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + '\n';
      }
      return message.reply(msg);
    } else {
      // View sender's balance
      const userData = await usersData.get(event.senderID);
      message.reply(getLang("money", userData.money));
    }
  }
};
