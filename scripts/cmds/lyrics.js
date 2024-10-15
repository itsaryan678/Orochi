const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: 'lyrics',
 version: '2.0',
 author: 'ArYAN',
 role: 0,
 category: 'music',
 longDescription: {
 en: 'This command allows you to search song lyrics from Google',
 },
 guide: {
 en: '{p}lyrics [ Song Name ]',
 },
 },

 onStart: async function ({ api, event, args }) {
 try {
 const songName = args.join(" ");
 if (!songName) {
 api.sendMessage("⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗧𝗶𝘁𝗹𝗲\n\n➤ Please provide a song name!", event.threadID, event.messageID);
 return;
 }

 const apiUrl = `https://c-v3.onrender.com/api/lyrics?songName=${encodeURIComponent(songName)}`;
 const response = await axios.get(apiUrl);
 const { lyrics, title, artist, image } = response.data;

 if (!lyrics) {
 api.sendMessage("⛔ 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱\n\n➤ Sorry, lyrics not found. Please provide another song name!", event.threadID, event.messageID);
 return;
 }

 let message = `🎶 𝗟𝗬𝗥𝗜𝗖𝗦\n\nℹ 𝗧𝗶𝘁𝗹𝗲\n➪ ${title}\n👑 𝗔𝗿𝘁𝗶𝘀𝘁\n➪ ${artist}\n🔎 𝗟𝘆𝗿𝗶𝗰𝘀\n━━━━━━━━━━━━━━━\n${lyrics}`;
 let attachment = await global.utils.getStreamFromURL(image);
 api.sendMessage({ body: message, attachment }, event.threadID, (err, info) => {
 let id = info.messageID;
 });
 } catch (error) {
 console.error(error);
 api.sendMessage("⛔ 𝗦𝗲𝗿𝘃𝗲𝗿 𝗘𝗿𝗿𝗼𝗿\n\n➤ Sorry, there was an error getting the lyrics! " + error.message, event.threadID, event.messageID);
 }
 },
};
