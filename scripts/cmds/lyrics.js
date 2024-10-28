const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
 config: {
 name: 'lyrics',
 version: '2.2',
 author: 'ArYAN',
 role: 0,
 category: 'media',
 longDescription: {
 en: 'This command allows you to search song lyrics from Google',
 },
 guide: {
 en: '{p}lyrics [ Song Name ]',
 },
 },

 onStart: async function ({ api, event, args, message }) {
 const a = 'https://c-v5.onrender.com';
 const d = {
 lyrics: '/api/lyrics',
 usage: '/api/usage'
 };

 try {
 const songName = args.join(" ");
 if (!songName) {
 api.sendMessage("Please provide a song name!", event.threadID, event.messageID);
 return;
 }

 api.setMessageReaction("⏰", event.messageID, () => {}, true);
 const startTime = new Date().getTime();

 const lyricsResponse = await axios.get(`${a}${d.lyrics}?songName=${encodeURIComponent(songName)}`);
 const { lyrics, title, artist, image } = lyricsResponse.data;

 if (!lyrics) {
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 api.sendMessage("Sorry, lyrics not found. Please provide another song name!", event.threadID, event.messageID);
 return;
 }

 const usageResponse = await axios.get(`${a}${d.usage}`);
 const totalRequests = usageResponse.data.totalRequests;

 const endTime = new Date().getTime();
 const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

 let messageContent = `🎶 𝗟𝗬𝗥𝗜𝗖𝗦\n\nℹ| 𝗧𝗶𝘁𝗹𝗲: ${title}\n👑| 𝗔𝗿𝘁𝗶𝘀𝘁: ${artist}\n📦| 𝗧𝗼𝘁𝗮𝗹 𝗥𝗲𝗾𝘂𝗲𝘀𝘁𝘀: ${totalRequests}\n⏰| 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken} sec\n\n🔎| 𝗟𝘆𝗿𝗶𝗰𝘀\n━━━━━━━━━━━━━━━\n${lyrics}`;
 messageContent += ``;

 const attachment = await global.utils.getStreamFromURL(image);

 api.setMessageReaction("✅", event.messageID, () => {}, true);

 message.reply({
 body: messageContent,
 attachment
 });
 } catch (error) {
 console.error(error);
 api.setMessageReaction("❌", event.messageID, () => {}, true);
 api.sendMessage("Sorry, there was an error getting the lyrics! " + error.message, event.threadID, event.messageID);
 }
 }
};
