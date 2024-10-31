module.exports = {
 config: {
 name: "mention",
 aliases: ["tag"],
 version: "1.3",
 author: "Samir || ArYAN",
 role: 0,
 shortDescription: {
 en: "Mention a user",
 },
 longDescription: {
 en: "Mention a user using their name",
 },
 category: "info",
 guide: {
 en: "{p}mention <name> [text]",
 },
 },
 onStart: async function ({ event, message, args, usersData }) {
 const { senderID, messageReply } = event;
 let id;
 let text;

 const findUserByName = async (name) => {
 const allUsers = await usersData.getAll();
 const keyWord = name.toLowerCase();
 return allUsers.filter(user => (user.name || "").toLowerCase().includes(keyWord));
 };

 if (args.length > 0) {
 let nameArg = args.slice(0, 2).join(" "); // Search by first 2 words
 let searchResults = await findUserByName(nameArg);

 if (searchResults.length === 0 && args.length > 2) {
 nameArg = args.slice(0, 3).join(" ");
 searchResults = await findUserByName(nameArg);
 }

 if (searchResults.length === 0) {
 return message.reply(`No user found with the name "${nameArg}".`);
 }

 const user = searchResults[0]; 
 id = user.userID; // Get user ID
 text = args.slice(nameArg.split(" ").length).join(" ");
 } else if (messageReply && messageReply.senderID) {
 id = parseInt(messageReply.senderID); 
 text = args.join(" ");
 } else {
 id = parseInt(senderID); 
 text = args.join(" ");
 }

 if (isNaN(id)) {
 return message.reply("Invalid user ID.");
 }

 const userData = await usersData.get(id);
 if (!userData) {
 return message.reply("User data not found.");
 }

 const mention = [{ id, tag: userData.name }];

 try {
 await message.reply({
 body: `${userData.name} ${text}`,
 mentions: mention,
 });
 } catch (error) {
 message.reply("Error while mentioning the user. Please try again later.");
 }
 },
};
