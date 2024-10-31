const axios = require("axios");
const tinyurl = require("tinyurl");

module.exports = {
 config: {
 name: "art",
 role: 0,
 author: "ArYAN",
 countDown: 5,
 longDescription: "Convert your images into Anime Art",
 category: "ai",
 guide: {
 en: "${pn} reply to an image"
 }
 },
 onStart: async function ({ message, api, args, event }) {
 const text = args.join(" ");

 if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
 return message.reply("Please reply to an image.");
 }

 const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
 api.setMessageReaction("⏰", event.messageID, () => {}, true);

 const lado = `https://c-v5.onrender.com/i2art?url=${imgurl}`;

 try {
 const shortUrl = await tinyurl.shorten(lado);

 const response = await axios({
 url: lado,
 method: "GET",
 responseType: "stream"
 });

 message.reply("✅| Generating, please wait...", async (err, info) => {
 if (err) {
 return message.reply("❌| Failed to send the generating message.");
 }

 message.reply({
 body: `${shortUrl}`,
 attachment: response.data
 }, () => {
 message.unsend(info.messageID);
 api.setMessageReaction("✅", event.messageID, () => {}, true);
 });
 });

 } catch (error) {
 message.reply("❌| Failed to generate art, please try again.");
 console.error("Error generating art:", error);
 }
 }
};
