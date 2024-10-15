const axios = require('axios');
const fs = require('fs');

module.exports = {
 config: {
 name: "gen2",
 version: "1.2",
 author: "ArYAN",
 countDown: 0,
 role: 0,
 longDescription: {
 en: ""
 },
 category: "media",
 guide: {
 en: "{p}anigen <prompt>"
 }
 },

 onStart: async function({ message, args, api, event }) {
 try {
 const prompt = args.join(" ");
 if (!prompt) {
 return message.reply("Please provide your prompts.");
 }

 api.setMessageReaction("⏰", event.messageID, () => {}, true);

 const startTime = new Date().getTime();

 const baseURL = `https://c-v3.onrender.com/v1/gen2?prompt=${encodeURIComponent(prompt)}`;

 const response = await axios.get(baseURL);
 const imageUrl = response.data[0];

 const endTime = new Date().getTime();
 const timeTaken = (endTime - startTime) / 1000;

 api.setMessageReaction("✅", event.messageID, () => {}, true);

 const fileName = 'gen.png';
 const filePath = `/tmp/${fileName}`;

 const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
 const writerStream = fs.createWriteStream(filePath);
 
 imageResponse.data.pipe(writerStream);

 writerStream.on('finish', function() {
 message.reply({
 body: ``,
 attachment: fs.createReadStream(filePath)
 });
 });

 writerStream.on('error', function(err) {
 console.error('Error writing the file:', err);
 message.reply("sex");
 });

 } catch (error) {
 console.error('Error generating image:', error);
 message.reply("chud gyi api");
 }
 }
};
