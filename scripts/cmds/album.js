const axios = require('axios');
const fs = require('fs');

module.exports = {
 config: {
 name: "album",
 aliases: [],
 version: "2.1",
 author: "ArYAN",
 countDown: 5,
 role: 0,
 shortDescription: {
 vi: "Lấy video ngẫu nhiên từ một danh mục đã chỉ định.",
 en: "Get a random video from the specified category."
 },
 longDescription: {
 vi: "Lấy video ngẫu nhiên từ một danh mục đã chỉ định.",
 en: "Fetches a random video from a specified category."
 },
 category: "media",
 guide: {
 en: "{pn} <category>\n- Get a random video from the specified category"
 }
 },
 onStart: async ({ api, event, args }) => {
 if (!args[0]) {
 const message = "👑 𝗔𝗟𝗕𝗨𝗠𝗦 ( 𝖻𝖾𝗍𝖺 )\n━━━━━━━━━━━━━\n\n➨ 1. English\n➨ 2. Anime\n➨ 3. Hindi\n➨ 4. Free Fire\n➨ 5. Football\nSoon I will add more albums categories.\n\n➨ Please reply or provide valid album category number.";
 api.sendMessage(message, event.threadID, (error, info) => {
 if (error) return console.error(error);
 global.GoatBot.onReply.set(info.messageID, {
 commandName: module.exports.config.name,
 type: "reply",
 messageID: info.messageID,
 author: event.senderID,
 });
 });
 } else {
 const command = args.shift().toLowerCase();
 const category = getCategoryName(command);

 if (!category) {
 api.sendMessage(`❌ Invalid category. Please enter a valid album category.`, event.threadID, event.messageID);
 return;
 }

 if (command === "stream") {
 api.sendMessage(`Streaming video from category: ${category}`, event.threadID);
 streamVideo(api, event.threadID, category);
 } else {
 api.sendMessage(`⚙ fetching video from category: ${category}, please be patient...`, event.threadID, event.messageID);
 fetchVideo(api, event.threadID, category);
 }
 }
 },
 onReply: async ({ api, event, Reply }) => {
 if (event.type === "message_reply" && Reply.author === event.senderID) {
 const category = getCategoryName(event.body);

 if (!category) {
 api.sendMessage(`❌ Invalid category. Please enter a valid album category.`, event.threadID, event.messageID);
 return;
 }

 api.sendMessage(`⚙ fetching video from category: ${category}`, event.threadID, event.messageID);
 fetchVideo(api, event.threadID, category);
 }
 }
};

function getCategoryName(command) {
 switch (command) {
 case "1":
 return "english";
 case "2":
 return "anime";
 case "3":
 return "hindi"; 
 case "4":
 return "ff";
 case "5":
 return "football";
 default:
 return null;
 }
}

async function fetchVideo(api, threadID, category) {
 try {
 const response = await axios.get(`https://c-v5.onrender.com/api/album?category=${encodeURIComponent(category.toLowerCase())}`);
 const video = response.data;
 const videoBuffer = await axios.get(video.url, { responseType: 'arraybuffer' });
 const filename = `${category}_${Date.now()}.mp4`;
 fs.writeFileSync(filename, videoBuffer.data);
 api.sendMessage({
 body: `👑 𝗔𝗟𝗕𝗨𝗠𝗦 ( 𝖻𝖾𝗍𝖺 )\n━━━━━━━━━━━━━\n\nHere is a video from ${category}\n\nENJOY...💜`,
 attachment: fs.createReadStream(filename)
 }, threadID, () => fs.unlinkSync(filename));
 } catch (error) {
 console.error(error);
 handleApiError(error, api, threadID, category);
 }
}

async function streamVideo(api, threadID, category) {
 try {
 const response = await axios.get(`https://c-v5.onrender.com/api/album?category=${encodeURIComponent(category.toLowerCase())}`);
 const video = response.data;
 const videoBuffer = await axios.get(video.url, { responseType: 'arraybuffer' });
 const filename = `${category}_${Date.now()}.mp4`;
 fs.writeFileSync(filename, videoBuffer.data);
 api.sendMessage({
 body: `👑 𝗔𝗟𝗕𝗨𝗠𝗦 ( 𝖻𝖾𝗍𝖺 )\n━━━━━━━━━━━━━\n\nStreaming video from ${category}\n\nENJOY...💜`,
 attachment: fs.createReadStream(filename)
 }, threadID, () => fs.unlinkSync(filename));
 } catch (error) {
 console.error(error);
 handleApiError(error, api, threadID, category);
 }
}

function handleApiError(error, api, threadID, category) {
 if (error.response && error.response.status === 404) {
 api.sendMessage(`❌ The category "${category}" could not be found. Please check the available categories.`, threadID);
 } else {
 api.sendMessage(`❌ An error occurred: ${error.message}`, threadID);
 }
}
