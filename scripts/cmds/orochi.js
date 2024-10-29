const axios = require('axios');

const ArYAN = [
  '.chi',
  '.orochi',
];

module.exports = {
  config: {
    name: 'orochi',
    aliases: ["chi"],
    version: '1.0.1',
    author: 'ArYAN',
    role: 0,
    category: 'ai',
    guide: {
      en: '.chi what is capital of France?',
    },
  },

  langs: {
    en: {
      final: "",
      loading: 'loading...'
    }
  },

  onStart: async function () {},
  onChat: async function ({ api, event, args, getLang, message }) {
    try {
      const prefix = ArYAN.find((p) => event.body && event.body.toLowerCase().startsWith(p));

      if (!prefix) {
        return;
      }

      const prompt = event.body.substring(prefix.length).trim();

      const loadingMessage = getLang("loading");
      const loadingReply = await message.reply(loadingMessage);
      
      const response = await axios.get(`https://c-v5.onrender.com/api/gpt4o?prompt=${encodeURIComponent(prompt)}`);

      if (response.status !== 200 || !response.data || !response.data.answer) {
        throw new Error('Invalid or missing response from API');
      }

      const messageText = response.data.answer; 

      const finalMsg = `${messageText}`;
      api.editMessage(finalMsg, loadingReply.messageID);

      console.log('Sent answer as a reply to user');
    } catch (error) {
      console.error(`Hello there! How can I assist you today?`);
      api.sendMessage(
        `${error.message}.`,
        event.threadID
      );
    }
  }
};
