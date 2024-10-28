const axios = require('axios');
const { imgur } = require('imgur-upload-api');

module.exports = {
 config: {
 name: "imgur",
 aliases: [],
 version: "1.0",
 author: "Rômeo",
 role: 0, 
 shortDescription: "Uploads an image or video to Imgur.",
 longDescription: "Allows users to upload an image or video to Imgur via a provided URL or attached media.",
 category: "tools",
 guide: "{p}imgur <link or reply to media> - Upload media to Imgur.",
 usages: "Link or media reply",
 cooldowns: 5, 
 dependencies: {
 "axios": "",
 "imgur-upload-api": ""
 }
 },

 onStart: async function ({ api, event, args }) {
 try {
 
 let linkanh = event.messageReply?.attachments[0]?.url || args.join(" ");

 if (!linkanh) {
 return api.sendMessage('➜ Please provide an image or video link or reply to media.', event.threadID, event.messageID);
 }

 
 linkanh = linkanh.replace(/\s/g, '');
 if (!/^https?:\/\//.test(linkanh)) {
 return api.sendMessage('➜ Invalid URL: URL must start with http:// or https://', event.threadID, event.messageID);
 }

 
 const attachments = event.messageReply?.attachments || [];
 const allPromises = attachments.map(item => {
 const encodedItemUrl = encodeURI(item.url);
 return imgur(encodedItemUrl);
 });

 
 const results = await Promise.all(allPromises);
 const imgurLinks = results.map(result => result.data.link);

 return api.sendMessage(`Uploaded Imgur Links:\n${imgurLinks.join('\n')}`, event.threadID, event.messageID);

 } catch (error) {
 
 console.error("Error during Imgur upload: ", error.message || error);

 return api.sendMessage('➜ An error occurred while uploading the image or video.', event.threadID, event.messageID);
 }
 }
};
