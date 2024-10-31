const axios = require('axios');

const ArYAN = [
  '.chi',
  '.orochi',
];

module.exports = {
  config: {
    name: 'orochi',
    aliases: ["chi"],
    version: '1.0',
    author: 'ArYAN',
    role: 0,
    category: 'ai',
    guide: {
      en: '',
    },
  },

  onStart: async function () {},
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = ArYAN.find((p) => event.body && event.body.toLowerCase().startsWith(p));

      if (!prefix) {
        return;
      }

      const prompt = event.body.substring(prefix.length).trim();

      if (!prompt) {
        return message.reply("🤖 𝗢𝗿𝗼𝗰𝗵𝗶\n\nHello! How can I assist you today ?");
      }

      const response = await axios.get(`https://c-v5.onrender.com/api/orochi?prompt=${encodeURIComponent(prompt)}`);

      if (response.status !== 200 || !response.data || !response.data.answer) {
        throw new Error('Invalid or missing response from API');
      }

      const messageText = response.data.answer;

      await message.reply(messageText);

      console.log('Sent answer as a reply to user');
    } catch (error) {
      console.error(`Failed to get answer: ${error.message}`);
      api.sendMessage(
        "An error occurred. Please try again later.",
        event.threadID
      );
    }
  }
};
