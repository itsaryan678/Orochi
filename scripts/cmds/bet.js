let winRate = 0.8; // Default win rate set to 40%

module.exports = {
 config: {
 name: "bet",
 aliases: [],
 version: "2.1",
 author: "Team Calyx",
 countDown: 0,
 shortDescription: {
 en: "Bet game",
 },
 longDescription: {
 en: "A simple betting game where you can double or triple your bet—or lose it all. ",
 },
 category: "fun",
 },
 langs: {
 en: {
 invalid_amount: "Please enter a valid bet amount.",
 not_enough_money: "You don't have enough money to place this bet.",
 win_message: "Congratulations! You won %1$💸 and multiplied your bet by %2$! 🎉",
 lose_message: "You lost %1$... 😔",
 invalid_win_rate: "Please enter a valid win rate between 0 and 100.",
 win_rate_updated: "Win rate successfully updated to %1$%.",
 admin_only: "Only bot admins can set the win rate.",
 win_rate_required: "Please specify the win rate.",
 },
 },
 onStart: async function ({ args, message, event, usersData, getLang }) {
 const { senderID } = event;

 
 if (args[0] && args[0].toLowerCase() === "setwinrate") {
 // Check if the sender is an admin
 if (!isAdmin(senderID)) {
 return message.reply(getLang("admin_only"));
 }

 const newWinRate = parseFloat(args[1]);

 
 if (isNaN(newWinRate) || newWinRate < 0 || newWinRate > 100) {
 return message.reply(getLang("invalid_win_rate"));
 }

 winRate = newWinRate / 100; 
 return message.reply(getLang("win_rate_updated", newWinRate));
 }

 
 const betAmount = parseInt(args[0]);

 if (isNaN(betAmount) || betAmount <= 0) {
 return message.reply(getLang("invalid_amount"));
 }

 const userData = await usersData.get(senderID);

 if (betAmount > userData.money) {
 return message.reply(getLang("not_enough_money"));
 }

 const win = Math.random() < winRate; // Use current win rate

 let winnings = 0;
 let multiplier = 1;

 if (win) {
 multiplier = getRandomMultiplier(); // Get random multiplier (2 or 3)
 winnings = betAmount * multiplier; 
 } else {
 winnings = -betAmount; 
 }

 await usersData.set(senderID, {
 money: userData.money + winnings,
 data: userData.data,
 });

 const messageText = getBetResultMessage(win, winnings, multiplier, getLang);

 return message.reply(messageText);
 },
};

 
function isAdmin(userID) {
 return global.GoatBot.config.adminBot.includes(userID); 
}

function getRandomMultiplier() {
 const multipliers = [2, 3]; // Only Double and Triple
 return multipliers[Math.floor(Math.random() * multipliers.length)];
}

function getBetResultMessage(win, winnings, multiplier, getLang) {
 if (win) {
 return getLang("win_message", winnings, multiplier) + " 🎉";
 } else {
 return getLang("lose_message", -winnings) + " 😔";
 }
}
