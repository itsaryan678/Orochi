const axios = require('axios');

const ArYAN = [
  'ai'
];

module.exports = {
  config: {
    name: 'ai',
    version: '1.0',
    author: 'ArYAN',
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'This is a large Ai language model trained by OpenAi, designed to assist with a wide range of tasks.',
    },
    guide: {
      en: '\nAi < question >\n\n🔎 𝗚𝘂𝗶𝗱𝗲\nAi what is the capital of France?',
    },
  },

  langs: {
    en: {
      noQuestion: 'Please provide your question.',
      final: '',
      loading: 'Answering your question, please wait...',
      error: 'An error occurred. Please try again later.',
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

      if (!prompt) {
        return message.reply(getLang("noQuestion"));
      }

      const loadingMessage = getLang("loading");
      const loadingReply = await message.reply(loadingMessage);

      const response = await axios.get(`https://c-v5.onrender.com/chat/coral?prompt=${encodeURIComponent(prompt)}`);

      if (response.status !== 200 || !response.data || !response.data.response) {
        throw new Error('Invalid or missing response from API');
      }

      const messageText = response.data.response;

      const finalMsg = `${messageText}`;
      api.editMessage(finalMsg, loadingReply.messageID);

      console.log('Sent answer as a reply to user');
    } catch (error) {
      console.error(`Failed to get answer: ${error.message}`);
      api.sendMessage(
        getLang("error"),
        event.threadID
      );
    }
  }
};
