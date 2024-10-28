const axios = require('axios');

async function tempmailGet() {
 const response = await axios.get('https://c-v5.onrender.com/tempmail/gen');
 return response.data;
}

async function tempmailInbox(email) {
 const response = await axios.get(`https://c-v5.onrender.com/tempmail/inbox?email=${email}`);
 return response.data;
}

module.exports = {
 config: {
 name: "tempmail",
 aliases: ["tm"],
 version: "1.0.0",
 author: "ArYAN",
 role: 0,
 countDown: 5,
 longDescription: {
 en: "Generate temporary email and check inbox"
 },
 category: "info",
 guide: {
 en: "{p}tempmail <subcommand>\n\nFor Example:\n{p}tempmail gen\n{p}tempmail inbox <tempmail>"
 }
 },
 onStart: async function ({ api, event, args }) {
 try {
 if (args.length === 0) {
 return api.sendMessage(this.config.guide.en, event.threadID, event.messageID);
 }

 if (args[0] === "gen") {
 try {
 const response = await tempmailGet();
 const tempEmail = response.email;
 api.sendMessage(`📮|𝗧𝗲𝗺𝗽𝗺𝗮𝗶𝗹\n━━━━━━━━━━━━━\n\n𝖧𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝗆𝖺𝗂𝗅\n\n📥|𝗘𝗺𝗮𝗶𝗹\n➤ ${tempEmail}`, event.threadID, event.messageID);
 } catch (error) {
 console.error("❌ | Error", error);
 api.sendMessage("❌|Unable to generate email address. Please try again later...", event.threadID, event.messageID);
 }
 } else if (args[0].toLowerCase() === "inbox" && args.length === 2) {
 const email = args[1];
 try {
 const response = await tempmailInbox(email);
 const inboxMessages = response.map(({ form, date, subject, message }) => 
 `📍|𝗧𝗲𝗺𝗺𝗮𝗶𝗹 𝗜𝗻𝗯𝗼𝘅\n━━━━━━━━━━━━━━━\n\n𝖧𝖾𝗋𝖾 𝗂𝗌 𝗒𝗈𝗎𝗋 𝗍𝖾𝗆𝗉𝗆𝖺𝗂𝗅 𝗂𝗇𝖻𝗈𝗑\n\n🔎 𝗙𝗿𝗼𝗺\n${form}\n📅 𝗗𝗮𝘁𝗲\n${date}\n📭 𝗦𝘂𝗯𝗷𝗲𝗰𝘁\n➤ ${subject || 'Not Found'}\n📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲\n➤ ${message}`).join('\n\n');
 api.sendMessage(inboxMessages, event.threadID, event.messageID);
 } catch (error) {
 console.error("🔴 Error", error);
 api.sendMessage("❌|Can't get any mail yet. Please send mail first.", event.threadID, event.messageID);
 }
 } else {
 api.sendMessage("❌ | Use 'Tempmail gen' to generate email and 'Tempmail inbox {email}' to get the inbox emails.", event.threadID, event.messageID);
 }

 } catch (error) {
 console.error(error);
 return api.sendMessage(`An error occurred. Please try again later.`, event.threadID, event.messageID);
 }
 }
};
