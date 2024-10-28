const axios = require('axios');
const tinyurl = require('tinyurl');
const fs = require('fs');
const path = require('path');

const a = 'https://c-v5.onrender.com';
const d = {
  b: '/upscale',
  c: '/api/usage'
};

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "1.1",
    author: "ArYAN",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Upscale your image"
    },
    category: "media",
    guide: {
      en: "{pn} reply to an image or provide an image URL"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    let imageUrl;

    if (event.type === "message_reply") {
      const replyAttachment = event.messageReply.attachments[0];
      if (["photo", "sticker"].includes(replyAttachment?.type)) {
        imageUrl = replyAttachment.url;
      } else {
        return api.sendMessage(
          { body: "Please reply to an image." },
          event.threadID
        );
      }
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
      imageUrl = args[0];
    } else {
      return api.sendMessage(
        { body: "Please reply to an image or provide a valid image URL." },
        event.threadID
      );
    }

    try {
      api.setMessageReaction("⏰", event.messageID, () => {}, true);
      const startTime = new Date().getTime();

      const url = await tinyurl.shorten(imageUrl);

      const processMessage = await message.reply("🔎| Processing your request, please wait...");

      const upscaleUrl = `${a}${d.b}?url=${encodeURIComponent(url)}&upscale_factor=8&format=PNG`;
      const upscaleResponse = await axios.get(upscaleUrl);

      if (upscaleResponse.data?.status === "success" && upscaleResponse.data.data?.url) {
        const resultUrl = upscaleResponse.data.data.url;

        const usageResponse = await axios.get(`${a}${d.c}`);
        if (!usageResponse.data || !usageResponse.data.totalRequests) {
          throw new Error("Invalid response format from usage API");
        }

        const filePath = path.join('/tmp', 'upscaled_image.png');
        const writer = fs.createWriteStream(filePath);
        const imageResponse = await axios.get(resultUrl, { responseType: 'stream' });
        imageResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const endTime = new Date().getTime();
        const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await message.reply({
          body: `📦| 𝗠𝗼𝗱𝗲𝗹: UPSCALE\n🔮| 𝗧𝗼𝘁𝗮𝗹 𝗥𝗲𝗾: ${usageResponse.data.totalRequests}\n⏰| 𝗧𝗮𝗸𝗲𝗻 𝗧𝗶𝗺𝗲: ${timeTaken} sec.`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete the temporary file:", err);
        });
        
      } else {
        throw new Error("Upscale API returned an invalid response structure.");
      }
      
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`Error: ${error.message || "Invalid response from API."}`);
    }
  }
};
