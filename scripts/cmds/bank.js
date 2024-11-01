const fs = require("fs");
const fruitIcons = [
  "🍒", "🍊", "🍋", "🍇", "🍓", "🍍", "🥥", "🥑", "🧅", "🍆", "🍅", "🍋", "🍏", "🍐", "🥝", "🍎", "🍉", "🌽", "🍌", "🍑"
];

function getTopUsers(bankData, count) {
  const entries = Object.entries(bankData);
  return entries
    .sort((a, b) => b[1].bank - a[1].bank)
    .slice(0, count);
}

function getTotalMoney(topUsers) {
  let totalMoney = 0;
  for (const [userID, data] of topUsers) {
    totalMoney += data.bank;
  }
  return totalMoney;
}

function deductMoneyFromTopUsers(topUsers, amount) {
  const deductedUsers = [];
  for (const [userID, data] of topUsers) {
    if (amount <= 0) break;
    const deduction = Math.min(amount, data.bank);
    data.bank -= deduction;
    amount -= deduction;
    deductedUsers.push({
      userID,
      deduction,
    });
  }
  return deductedUsers;
}

module.exports = {
  config: {
    name: "bank",
    version: "2.31",
    author: "LiANE | ArYAN",
    countDown: 0,
    role: 0,
    longDescription: {
      en: "The bank command provides various banking services including games.",
    },
    category: "fun",
    guide: {
      en: "",
    },
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));
    const lianeBank = "🏦 𝗢𝗿𝗼𝗰𝗵𝗶 𝗕𝗮𝗻𝗸\n━━━━━━━━━━━━━"; // Updated bank name
    const getUserInfo = async (api, userID) => {
      try {
        const name = await api.getUserInfo(userID);
        return name[userID].firstName;
      } catch (error) {
        console.error(error);
      }
    };

    let { messageID, threadID, senderID } = event;
    const userName = await getUserInfo(api, senderID);

    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0, loanDueDate: 0, transactions: [] }; // Added transactions array
      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
    }

    const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    if (command === "richest") {
      let page = parseInt(args[1]);

      if (isNaN(page) || page <= 0) {
        page = 1; // Set the default page to 1 if not a valid number
      }

      const pageSize = 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      const entries = Object.entries(bankData);
      const totalEntries = entries.length;

      const topTen = entries
        .sort((a, b) => b[1].bank - a[1].bank)
        .slice(start, end);

      const messageText = `𝓣𝓸𝓹 𝟙𝟘 𝓡𝓲𝓬𝓱𝓮𝓼𝓽 👑🤴🏻 \n\n${(await Promise.all(
        topTen.map(async ([userID, data], index) => {
          const userData = await usersData.get(userID);
          return `
╭──────[ ${index + start + 1} ]──────╮
│ℹ️|𝗡𝗮𝗺𝗲
│➤ ${userData.name}
│💰|𝗕𝗮𝗻𝗮𝗻𝗰𝗲
│➤ ${data.bank}
╰──────────────╯
`;
        })
      )).join("\n\n")}`;

      const totalPages = Math.ceil(totalEntries / pageSize);
      const currentPage = Math.min(page, totalPages);

      const nextPage = currentPage + 1;
      const nextPageMessage = nextPage <= totalPages ? `⦿ Type bank richest ${nextPage} to view the next page.\n` : "";
      const pageInfo = `page ${currentPage}/${totalPages}`;

      return message.reply(`${messageText}\n\n${nextPageMessage}${pageInfo}`);
    } else if (command === "deposit") {
      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount you wish to deposit in the bank.\n\nMore Options:\n⦿ Balance`);
      }
      if (userMoney < amount) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, The amount you wish is greater than your balance.\n\nMore Options:\n⦿ Balance`);
      }

      bankData[user].bank += amount;
      bankData[user].transactions.push({ type: 'Deposit', amount, timestamp: Date.now() }); // Added transaction record

      await usersData.set(event.senderID, {
        money: userMoney - amount,
      });

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! ${amount}💵 has been deposited into your bank account.\n\nMore Options:\n⦿ Balance\n⦿ Bank Balance\n⦿ Bank Interest\n⦿ Bank Transfer`);
    } else if (command === "withdraw") {
      const balance = bankData[user].bank || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount you wish to withdraw from the bank.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance\n⦿ Bank Interest`);
      }
      if (amount > balance) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, the amount you wish is greater than your bank balance.\n\nMore Options:\n⦿ Bank Balance`);
      }

      bankData[user].bank = balance - amount;
      const userMoney = await usersData.get(event.senderID, "money");
      await usersData.set(event.senderID, {
        money: userMoney + amount,
      });

      bankData[user].transactions.push({ type: 'Withdraw', amount, timestamp: Date.now() }); // Added transaction record

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! ${amount}💵 has been successfully withdrawn from your bank account. Use it wisely! \n\nMore Options:\n⦿ Balance\n⦿ Bank Balance`);
    } else if (command === "dice") {
      // Simulate rolling a dice with numbers from 1 to 6
      const userDice = Math.floor(Math.random() * 6) + 1;
      const lianeBotDice = Math.floor(Math.random() * 6) + 1;

      // Map dice roll results to their respective emojis
      const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      const userDiceEmoji = diceEmojis[userDice - 1];
      const lianeBotDiceEmoji = diceEmojis[lianeBotDice - 1];

      // Determine the outcome
      let outcomeMessage = `You rolled: ${userDiceEmoji}\n🤖 Orochi Bot rolled: ${lianeBotDiceEmoji}\n\n`;

      if (userDice > lianeBotDice) {
        const winnings = amount * 2;
        outcomeMessage += `Congratulations! You won ${winnings}💵 with a roll of ${userDice}.`;

        bankData[user].bank += winnings;
        bankData[user].transactions.push({ type: 'Dice Roll Win', amount: winnings, timestamp: Date.now() }); // Added transaction record
      } else if (userDice < lianeBotDice) {
        const loss = amount;
        outcomeMessage += `🤖 Orochi Bot won ${loss}💵 with a roll of ${lianeBotDice}.`;

        bankData[user].bank -= loss;
        bankData[user].transactions.push({ type: 'Dice Roll Loss', amount: loss, timestamp: Date.now() }); // Added transaction record
      } else {
        outcomeMessage += `It's a tie! No money exchanged.`;
      }

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Let's roll the dice!\n\n${outcomeMessage}`);
    } else if (command === "slot") {
      // Check if a valid bet amount is specified
      const betAmount = parseInt(args[1]);
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Please enter a valid bet amount. You need to withdraw your bank balance first to use your bank balance as the bet.`);
      }

      // Check if the user has enough balance for the bet
      if (userMoney < betAmount) {
        return message.reply(`${lianeBank}\n\n✧ You don't have enough balance for this bet. Try to withdraw your bank balance.`);
      }

      // Randomly select three fruit icons
      const slotResults = [];
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * fruitIcons.length);
        slotResults.push(fruitIcons[randomIndex]);
      }

      // Check for winning combinations
      let winnings = 0;
      if (slotResults[0] === slotResults[1] && slotResults[1] === slotResults[2]) {
        // All three fruits are the same
        winnings = betAmount * 10;
      } else if (slotResults[0] === slotResults[1] || slotResults[1] === slotResults[2] || slotResults[0] === slotResults[2]) {
        // Two fruits are the same
        winnings = betAmount * 5;
      }

      // Update the user's balance
      if (winnings > 0) {
        await usersData.set(event.senderID, {
          money: userMoney + winnings,
        });
      } else {
        await usersData.set(event.senderID, {
          money: userMoney - betAmount,
        });
      }

      // Generate the response message with fruit icons
      const slotResultText = slotResults.join(" ");
      const outcomeMessage = winnings > 0 ? `Congratulations! You won ${winnings}💵.` : `You lost ${betAmount}💵.`;
      const responseMessage = `${lianeBank}\n\n ${slotResultText}\n\n✧ ${outcomeMessage}`;

      return message.reply(responseMessage);
    } else if (command === "heist") {
      // Initialize user data if not exists
      if (!bankData[user]) {
        bankData[user] = {
          lastHeistTime: 0,
          bank: 0,
          loan: 0
        };
      }

      const lastHeistTime = bankData[user].lastHeistTime || 0;
      const cooldown = 6 * 60 * 60 * 1000; // 24 hours cooldown
      const userMoney = await usersData.get(event.senderID, "money");

      if (args[1] === "confirm") {
        if (Date.now() - lastHeistTime < cooldown) {
          const remainingTime = cooldown - (Date.now() - lastHeistTime);
          const hours = Math.floor(remainingTime / (60 * 60 * 1000));
          const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

          return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you need to wait ${hours} hours and ${minutes} minutes before starting another heist.`);
        }

        // Calculate the amount to steal (random between 1000 and 5000)
        const amountToSteal = Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000;

        // Check if the user is successful in the heist
        const successRate = Math.random();
        if (successRate < 0.35) {
          // Failed heist
          const loanAmount = amountToSteal * 0.1;

          bankData[user].loan = (bankData[user].loan || 0) + loanAmount;
          await usersData.set(event.senderID, {
            money: userMoney - loanAmount,
          });

          return message.reply(`${lianeBank}\n\n✧ Oops you got caught, ${userName}! Your bank heist was unsuccessful. You couldn't steal anything this time. However, 10% of the total heist amount has been added to your bank loan, and ${loanAmount}💵 has been deducted from your balance.`);
        }

        // Successful heist
        const topUsers = getTopUsers(bankData, 5);
        const totalMoneyToDeduct = Math.floor(Math.random() * (0.1 * getTotalMoney(topUsers)));
        const deductedUsers = deductMoneyFromTopUsers(topUsers, totalMoneyToDeduct);
        const winAmount = Math.floor(Math.random() * (0.1 * getTotalMoney(topUsers)));

        bankData[user].bank = (bankData[user].bank || 0) + amountToSteal;
        await usersData.set(event.senderID, {
          money: userMoney + winAmount,
        });
        bankData[user].lastHeistTime = Date.now();

        // Prepare a message about the deducted money from top users
        let deductedUsersMessage = "Money deducted from the top 1-5 users:\n";
        for (const { userID, deduction } of deductedUsers) {
          const deductedUserName = await getUserInfo(api, userID);
          deductedUsersMessage += `${deductedUserName}: ${deduction}💵\n`;
        }

        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
          if (err) throw err;
        });

        return message.reply(`${lianeBank}\n\n✧ Congratulations, ${userName}! You successfully completed a bank heist and stole ${amountToSteal}💵. You also won ${winAmount}💵.\n\n${deductedUsersMessage}`);
      } else {
        // User wants to start a heist, provide information about the heist
        return message.reply(`${lianeBank}\n\n✧ Welcome, ${userName}! You are about to start a bank heist. Here's what you need to know:\n\n✧ If you win, you can steal a random amount between 10000 and 100000💵 from the bank, and you have a 35% chance of winning.\n\n✧ If you lose, 10% of the total heist amount will be added to your bank loan, regardless of the bank loan limit. There is a chance that you will lose all your cash and have negative cash! Proceed with caution. To confirm the heist, use the command "bank heist confirm".`);
      }
    } else if (command === "lottery") {
      const user = event.senderID; // Ensure 'user' is defined
      const lastLotteryTime = bankData[user]?.lastLotteryTime || 0;
      const cooldown = 24 * 60 * 60 * 1000; // 24 hours cooldown

      // Get user money
      let userMoney;
      try {
        userMoney = await usersData.get(user, "money");
      } catch (err) {
        console.error("Error retrieving user money:", err);
        return message.reply(`${lianeBank}\n\n✧ There was an error retrieving your account details.`);
      }

      // Check cooldown
      if (Date.now() - lastLotteryTime < cooldown) {
        const remainingTime = cooldown - (Date.now() - lastLotteryTime);
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you need to wait ${hours} hours and ${minutes} minutes before buying another lottery ticket.`);
      }

      const ticketCost = 500;
      if (userMoney < ticketCost) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money to buy a lottery ticket. You need ${ticketCost}💵.`);
      }

      const prize = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
      const winChance = Math.random();

      try {
        if (winChance < 0.1) {
          // User wins the lottery
          await usersData.set(user, { money: userMoney + prize });
          bankData[user].lastLotteryTime = Date.now();
          fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
            if (err) {
              console.error("Error saving bank data:", err);
              return message.reply(`${lianeBank}\n\n✧ There was an error saving the lottery data.`);
            }
          });
          return message.reply(`${lianeBank}\n\n✧ Congratulations, ${userName}! You won the lottery and received ${prize}💵!`);
        } else {
          // User did not win the lottery
          await usersData.set(user, { money: userMoney - ticketCost });
          bankData[user].lastLotteryTime = Date.now();
          fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
            if (err) {
              console.error("Error saving bank data:", err);
              return message.reply(`${lianeBank}\n\n✧ There was an error saving the lottery data.`);
            }
          });
          return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you didn't win the lottery. Better luck next time!`);
        }
      } catch (err) {
        console.error("Error updating user data:", err);
        return message.reply(`${lianeBank}\n\n✧ There was an error processing your lottery ticket.`);
      }
    } else if (command === "blackjack") {
      const betAmount = parseInt(args[1]);
      const userMoney = await usersData.get(event.senderID, "money");

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Please enter a valid bet amount, ${userName}.`);
      }

      if (userMoney < betAmount) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money to place this bet.`);
      }

      const getCard = () => Math.floor(Math.random() * 11) + 1; // Cards between 1 and 11

      let userHand = getCard() + getCard();
      let dealerHand = getCard() + getCard();

      const userPlay = () => {
        while (userHand < 17) {
          userHand += getCard();
        }
        return userHand;
      };

      const dealerPlay = () => {
        while (dealerHand < 17) {
          dealerHand += getCard();
        }
        return dealerHand;
      };

      userHand = userPlay();
      dealerHand = dealerPlay();

      let transactionType = '';
      let symbol = '♦️'; // Blackjack symbol

      if (userHand > 21) {
        await usersData.set(event.senderID, { money: userMoney - betAmount });
        transactionType = 'Blackjack Loss';
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you busted with ${userHand}. You lost ${betAmount}💵. ${symbol}`);
      }

      if (dealerHand > 21 || userHand > dealerHand) {
        const winAmount = betAmount * 2; // Double the bet amount
        await usersData.set(event.senderID, { money: userMoney + winAmount });
        transactionType = 'Blackjack Win';
        return message.reply(`${lianeBank}\n\n✧ Congratulations, ${userName}! You won with ${userHand} against the dealer's ${dealerHand} and received ${winAmount}💵. ${symbol}`);
      }

      if (userHand < dealerHand) {
        await usersData.set(event.senderID, { money: userMoney - betAmount });
        transactionType = 'Blackjack Loss';
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you lost with ${userHand} against the dealer's ${dealerHand}. You lost ${betAmount}💵. ${symbol}`);
      }

      transactionType = 'Blackjack Tie';
      return message.reply(`${lianeBank}\n\n✧ It's a tie with ${userHand}. No money won or lost. ${symbol}`);
    } else if (command === "harvest") {
      const investmentAmount = parseInt(args[1]);

      if (isNaN(investmentAmount) || investmentAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid investment amount.💸`);
      }

      const riskOutcome = Math.random() < 0.7;
      const potentialReturns = investmentAmount * (riskOutcome ? 2 : 0.2);

      if (riskOutcome) {
        bankData[user].bank -= investmentAmount;
        bankData[user].transactions.push({ type: 'Harvest Investment Loss', amount: investmentAmount, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Your high-risk investment of ${investmentAmount}$ was risky, and you lost your money. `);
      } else {
        bankData[user].bank += potentialReturns;
        bankData[user].transactions.push({ type: 'Harvest Investment Return', amount: potentialReturns, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Congratulations! Your high-risk investment of ${investmentAmount}$ paid off, and you earned ${potentialReturns}$ in returns! 🎉`);
      }
    } else if (command === "bet") {
      const betAmount = parseInt(args[1]);

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid bet amount.💸`);
      }

      if (betAmount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to place this bet.`);
      }

      const outcome = Math.random() < 0.5;

      if (outcome) {
        const winnings = betAmount * 2;
        bankData[user].bank += winnings;
        bankData[user].transactions.push({ type: 'Bet Win', amount: winnings, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! You won the bet!\n\n💲 Bet amount: ${betAmount}$\n\n💰 You won: ${winnings}$\n\n💰 New bank balance: ${bankData[user].bank}$`);
      } else {
        bankData[user].bank -= betAmount;
        bankData[user].transactions.push({ type: 'Bet Loss', amount: betAmount, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Better luck next time ${userName}! You lost the bet.\n\n💲 Bet amount: ${betAmount}$\n\n💰 New bank balance: ${bankData[user].bank}$`);
      }
    } else if (command === "coinflip") {
      const betAmount = parseInt(args[1]);
      const guess = args[2];

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid bet amount.💸`);
      }

      if (betAmount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to place this bet.`);
      }

      if (!guess || (guess !== "heads" && guess !== "tails")) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter your guess as either "heads" or "tails".`);
      }
      const outcome = Math.random() < 0.5;
      const result = outcome ? "heads" : "tails";

      if (guess === result) {
        const winnings = betAmount * 2;
        bankData[user].bank += winnings;
      } else {
        bankData[user].bank -= betAmount;
      }

      bankData[user].transactions.push({ type: 'Coinflip', amount: betAmount, timestamp: Date.now() }); // Added transaction record
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${lianeBank}\n\n✧ Coin flip result: ${result}\n\n💲 Bet amount: ${betAmount}$\n\n💰 New bank balance: ${bankData[user].bank}$`);
    } else if (command === "roulette") {
      const betAmount = parseInt(args[1]);
      const betType = args[2];

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid bet amount.💸`);
      }

      if (betAmount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to place this bet.`);
      }

      if (!betType || (betType !== "red" && betType !== "black" && betType !== "green")) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter your bet type as either "red," "black," or "green".`);
      }

      const colorOptions = ["red", "black", "green"];
      const winningColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const winnings = betType === winningColor ? betAmount * 2 : 0;

      if (winnings > 0) {
        bankData[user].bank += winnings;
      } else {
        bankData[user].bank -= betAmount;
      }

      bankData[user].transactions.push({ type: 'Roulette', amount: betAmount, timestamp: Date.now() }); // Added transaction record
      fs.writeFileSync("bank.json", JSON.stringify(bankData));

      return message.reply(`${lianeBank}\n\n✧ Roulette result: ${winningColor}\n\n💲 Bet amount: ${betAmount}$\n\n💰 New bank balance: ${bankData[user].bank}$`);

    } else if (command === "guess") {
      const betAmount = parseInt(args[1]);
      const userGuess = parseInt(args[2]);
      const userMoney = await usersData.get(event.senderID, "money");

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Please enter a valid bet amount, ${userName}.`);
      }

      if (isNaN(userGuess) || userGuess < 1 || userGuess > 10) {
        return message.reply(`${lianeBank}\n\n✧ Please guess a number between 1 and 10, ${userName}.`);
      }

      if (userMoney < betAmount) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money to place this bet.`);
      }

      const correctNumber = Math.floor(Math.random() * 10) + 1;
      const winAmount = betAmount * 10; // Win 10 times the bet amount
      const doubleOption = args[3] === "double"; // Check if the user wants to double their money
      let transactionType = '';
      let symbol = '🔢';

      if (userGuess === correctNumber) {
        if (doubleOption) {
          // Attempt to double the winnings
          const success = Math.random() < 0.5; // 50% chance to double the winnings
          if (success) {
            await usersData.set(event.senderID, { money: userMoney + winAmount * 2 });
            transactionType = 'Guess the Number Double Win';
            return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! You successfully doubled your winnings to ${winAmount * 2}💵.`);
          } else {
            await usersData.set(event.senderID, { money: userMoney });
            transactionType = 'Guess the Number Double Loss';
            return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you failed to double your winnings. You kept your original winnings of ${winAmount}💵.`);
          }
        } else {
          await usersData.set(event.senderID, { money: userMoney + winAmount });
          transactionType = 'Guess the Number Win';
          return message.reply(`${lianeBank}\n\n✧ Congratulations, ${userName}! You guessed the correct number ${correctNumber} and won ${winAmount}💵. Use "guess <amount> <number> double" to try doubling your winnings.`);
        }
      } else {
        await usersData.set(event.senderID, { money: userMoney - betAmount });
        transactionType = 'Guess the Number Loss';
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you guessed ${userGuess} but the correct number was ${correctNumber}. You lost ${betAmount}💵. ${symbol}`);
      }
    } else if (command === "gamble") {
      const betAmount = parseInt(args[1]);

      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid bet amount.💸`);
      }

      if (betAmount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to place this bet.`);
      }

      const winChance = Math.random();
      const winAmount = betAmount * 3;

      if (winChance > 0.5) {
        bankData[user].bank += winAmount;
        bankData[user].transactions.push({ type: 'Gambling Win', amount: winAmount, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! You won the gamble!\n\n💲 Bet amount: ${betAmount}$\n\n💰 You won: ${winAmount}$\n\n💰 New bank balance: ${bankData[user].bank}$`);
      } else {
        bankData[user].bank -= betAmount;
        bankData[user].transactions.push({ type: 'Gambling Loss', amount: betAmount, timestamp: Date.now() }); // Added transaction record
        fs.writeFileSync("bank.json", JSON.stringify(bankData));
        return message.reply(`${lianeBank}\n\n✧ Better luck next time ${userName}! You lost the gamble.\n\n💲 Bet amount: ${betAmount}$\n\n💰 New bank balance: ${bankData[user].bank}$`);
      }
    } else if (command === "balance") {
      return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Your current bank balance is ${bankData[user].bank}💵.\n\nMore Options:\n⦿ Bank Deposit\n⦿ Bank Withdraw\n⦿ Bank Richest\n⦿ Bank Interest\n⦿ Bank Transfer\n⦿ Bank Loan\n⦿ Bank Repay\n⦿ Bank Heist\n⦿ Bank Bet\n⦿ Bank Dice\n⦿ Bank Slot\n⦿ Bank Harvest\n⦿ Bank Gamble`);
    } else if (command === "interest") {
      // Ensure bankData and user are defined
      if (!bankData || !bankData[user]) {
        return message.reply(`${lianeBank}\n\n✧ Error: Bank data not found for user.`);
      }

      const currentBalance = bankData[user].bank || 0;
      const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;
      const interestRate = 0.05;
      const interestDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Calculate the time elapsed since last interest claim
      const timeSinceLastClaim = Date.now() - lastInterestClaimed;

      if (timeSinceLastClaim >= interestDuration) {
        const interestAmount = Math.floor(currentBalance * interestRate);
        bankData[user].bank += interestAmount;
        bankData[user].lastInterestClaimed = Date.now();
        bankData[user].transactions.push({ type: 'Interest', amount: interestAmount, timestamp: Date.now() }); // Added transaction record

        // Write updated bankData to file
        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
          if (err) {
            console.error("Error writing to bank.json:", err);
            return message.reply(`${lianeBank}\n\n✧ There was an error updating the bank data.`);
          }
        });

        return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! You earned an interest of ${interestAmount}💵 on your bank balance.\n\nMore Options:\n⦿ Balance\n⦿ Bank Transfer\n⦿ Bank Loan\n⦿ Bank Richest\n⦿ Bank Heist\n⦿ Bank Bet\n⦿ Bank Dice\n⦿ Bank Coinflip\n⦿ Bank Roulette\n⦿ Bank Slot\n⦿ Bank Harvest\n⦿ Bank Gamble`);
      } else {
        const remainingTime = interestDuration - timeSinceLastClaim;
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! You have already claimed your bank interest. Please wait ${hours} hours and ${minutes} minutes to claim again.\n\nMore Options:\n⦿ Balance\n⦿ Bank Transfer\n⦿ Bank Loan\n⦿ Bank Richest\n⦿ Bank Heist\n⦿ Bank Bet\n⦿ Bank Dice\n⦿ Bank Coinflip\n⦿ Bank Roulette\n⦿ Bank Slot\n⦿ Bank Harvest\n⦿ Bank Gamble`);
      }
    } else if (command === "transfer") {
      if (!recipientUID || isNaN(recipientUID)) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid user ID of the recipient.`);
      }

      const recipientData = bankData[recipientUID];
      if (!recipientData) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! The recipient does not have a bank account.`);
      }

      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid transfer amount.💸`);
      }

      if (amount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to transfer.`);
      }

      bankData[user].bank -= amount;
      recipientData.bank += amount;
      bankData[user].transactions.push({ type: 'Transfer Out', amount, timestamp: Date.now() }); // Added transaction record
      recipientData.transactions.push({ type: 'Transfer In', amount, timestamp: Date.now() }); // Added transaction record

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Successful transfer! ${amount}💵 has been transferred from your bank account to the recipient's bank account.\n\nMore Options:\n⦿ Balance\n⦿ Bank Richest`);
    } else if (command === "loan") {
      const amount = parseInt(args[1]);
      const userMoney = await usersData.get(event.senderID, "money");
      const currentLoan = bankData[user].loan || 0;
      const loanDueDate = bankData[user].loanDueDate || 0;

      if (currentLoan > 0 && Date.now() < loanDueDate) {
        const remainingTime = loanDueDate - Date.now();
        const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! You already have an existing loan. Please repay your loan first before taking another one. Loan Due in ${days} days, ${hours} hours, and ${minutes} minutes.`);
      }

      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid loan amount.`);
      }

      if (userMoney < amount) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money to take this loan.`);
      }

      // Update user balance and loan details
      await usersData.set(event.senderID, { money: userMoney + amount });
      bankData[user].loan = amount;
      bankData[user].loanDueDate = Date.now() + (2 * 24 * 60 * 60 * 1000); // Loan due in 2 days
      bankData[user].transactions.push({ type: 'Loan', amount, timestamp: Date.now() }); // Added transaction record

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Loan successfully taken! ${amount}💵 has been added to your bank account. Please repay the loan before the due date.\n\nMore Options:\n⦿ Balance\n⦿ Bank Transfer\n⦿ Bank Repay\n⦿ Bank Richest\n⦿ Bank Heist\n⦿ Bank Bet\n⦿ Bank Dice\n⦿ Bank Coinflip\n⦿ Bank Roulette\n⦿ Bank Slot\n⦿ Bank Harvest\n⦿ Bank Gamble`);
    } else if (command === "repay") {
      const currentLoan = bankData[user].loan || 0;
      if (currentLoan <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! You don't have any pending loans at the moment.`);
      }

      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter a valid repayment amount.`);
      }

      if (amount > bankData[user].bank) {
        return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you don't have enough money in your bank account to repay the loan.`);
      }

      bankData[user].loan -= amount;
      bankData[user].bank -= amount;
      bankData[user].transactions.push({ type: 'Repay Loan', amount, timestamp: Date.now() }); // Added transaction record

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });

      return message.reply(`${lianeBank}\n\n✧ Loan successfully repaid! ${amount}💵 has been deducted from your bank account.\n\nMore Options:\n⦿ Balance\n⦿ Bank Transfer\n⦿ Bank Loan\n⦿ Bank Richest\n⦿ Bank Heist\n⦿ Bank Bet\n⦿ Bank Dice\n⦿ Bank Coinflip\n⦿ Bank Roulette\n⦿ Bank Slot\n⦿ Bank Harvest\n⦿ Bank Gamble`);
    } else if (command === "check") {
      const targetUID = args[1] || user;

      // Check if the targetUID exists in bankData
      if (!bankData[targetUID]) {
        return message.reply(`${lianeBank}\n\n✧ User with UID ${targetUID} not found.`);
      }

      const transactions = bankData[targetUID].transactions || [];

      if (transactions.length === 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! ${targetUID} does not have any transaction records at the moment.`);
      }

      const transactionList = transactions
        .map((transaction) => {
          let symbol;
          switch (transaction.type) {
            case 'Deposit':
              symbol = '🌐';
              break;
            case 'Withdraw':
              symbol = '📤';
              break;
            case 'Dice Roll Win':
            case 'Dice Roll Loss':
              symbol = '🎲';
              break;
            case 'Slot Win':
            case 'Slot Loss':
              symbol = '🎰';
              break;
            case 'Heist Win':
            case 'Heist Loss':
              symbol = '♻️';
              break;
            case 'Harvest Investment Return':
            case 'Harvest Investment Loss':
              symbol = '🌱';
              break;
            case 'Bet Win':
            case 'Bet Loss':
              symbol = '🎉';
              break;
            case 'Coinflip Win':
            case 'Coinflip Loss':
              symbol = '💹';
              break;
            case 'Roulette Win':
            case 'Roulette Loss':
              symbol = '🎡'; // Use a different symbol for Roulette
              break;
            case 'Gambling Win':
            case 'Gambling Loss':
              symbol = '🃏';
              break;
            case 'Loan':
              symbol = '💸';
              break;
            case 'Guess the Number Double Win':
              case 'Guess the Number Double Loss':
              case 'Guess the Number Win':
              case 'Guess the Number Loss':
              symbol = '🏷️';
              break;
            case 'Repay Loan':
              symbol = '💰';
              break;
            case 'Transfer Out':
            case 'Transfer In':
              symbol = '💵';
              break;
            case 'Interest':
              symbol = '🔥';
              break;
            default:
              symbol = '🟢'; // Default symbol for unknown types
              break;
          }

          return `✧ ${symbol} ${transaction.type}: ${transaction.amount}💵 - ${new Date(transaction.timestamp).toLocaleString()}`;
        })
        .join("\n");

      return message.reply(`${lianeBank}\n\n✧ Transaction History for ${targetUID}\n\n${transactionList}`);
    } else {
      return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please use one of our services:\n\n⦿ Bank balance\n⦿ Bank deposit\n⦿ Bank withdraw\n⦿ Bank interest\n⦿ Bank transfer\n⦿ Bank loan\n⦿ Bank repay\n⦿ Bank richest\n⦿ Bank heist\n⦿ Bank bet\n⦿ Bank dice\n⦿ Bank check\n⦿ Bank coinflip\n⦿ Bank roulette\n⦿ Bank slot\n⦿ Bank blackjack\n⦿ Bank lottery\n⦿ Bank guess\n⦿ Bank harvest\n⦿ Bank gamble`);
    }
  },
};
