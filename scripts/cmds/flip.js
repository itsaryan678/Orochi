const flipHistory = [];

module.exports = {
  config: {
    name: "flip",
    version: "1.2",
    author: "ArYAN",
    role: 0,
    shortDescription: {
      en: "Flip a coin and bet on heads or tails."
    },
    longDescription: {
      en: "Flip a coin and bet on heads or tails."
    },
    category: "fun",
    guide: {
      en: "{p}flip [ heads / tails / view ] [amount] "
    }
  },
  onStart: async function ({ api, event, args, usersData }) {
    if (!event.senderID) {
      console.error("Error: event.senderID is undefined.");
      return;
    }

    const userId = event.senderID;
    let userData = await usersData.get(userId);
    const userName = userData ? userData.name : "Unknown User";
    const userBalance = userData?.money || 0;

    const validActions = ["heads", "tails", "view", "history"];
    const selectedAction = args[0]?.toLowerCase();
    const betAmount = parseInt(args[1]);

    if (
      !validActions.includes(selectedAction) ||
      (selectedAction !== "view" && (isNaN(betAmount) || betAmount <= 0))
    ) {
      api.sendMessage(
        `âŒ | ð—œð—»ð˜ƒð—®ð—¹ð—¶ð—± ð—¨ð˜€ð—®ð—´ð—²\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”\nCorrect format: .flip [ heads / tails / view ] [amount]`,
        event.threadID,
        event.messageID
      );
      return;
    }

    if (selectedAction === "view") {
      api.sendMessage(
        `ðŸ’° | ð—–ð˜‚ð—¿ð—¿ð—²ð—»ð˜ ð—•ð—®ð—¹ð—®ð—»ð—°ð—²\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”\nYour balance: $${userBalance}`,
        event.threadID,
        event.messageID
      );
      return;
    }

    if (!userData) {
      userData = { money: 0 };
    }

    if (userData.money < betAmount) {
      api.sendMessage(
        `âŒ | ð—œð—»ð˜€ð˜‚ð—³ð—³ð—¶ð—°ð—¶ð—²ð—»ð˜ ð—™ð˜‚ð—»ð—±ð˜€\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”\nPlease deposit more money to your bank account.`,
        event.threadID,
        event.messageID
      );
      return;
    }

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const isWin = result === selectedAction;

    if (isWin) {
      userData.money += betAmount;
      api.sendMessage(
        `ðŸŽ‰ | ð—–ð—¼ð—»ð—´ð—¿ð—®ð˜ð˜‚ð—¹ð—®ð˜ð—¶ð—¼ð—»ð˜€!\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”\nYou guessed correctly and won $${betAmount}. Your new balance: $${userData.money}`,
        event.threadID,
        event.messageID
      );
      flipHistory.push({ result: "win", amount: betAmount });
    } else {
      userData.money -= betAmount;
      api.sendMessage(
        `ðŸ˜¢ ð—•ð—®ð—± ð—Ÿð˜‚ð—°ð—¸ |\nâ”â”â”â”â”â”â”â”â”â”â”â”â”â”\nYou guessed wrong and lost $${betAmount}. Your new balance: $${userData.money}`,
        event.threadID,
        event.messageID
      );
      flipHistory.push({ result: "lost", amount: betAmount });
    }

    await usersData.set(userId, userData);
  },
};
