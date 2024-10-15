const axios = require('axios');

const Prefixes = [
  'ai',
  'ask',
  'gpt',
  'openai',
  '@ai', // put here your AI names
];

module.exports = {
  config: {
    name: 'ai',
    version: '1.0.5',
    author: '©Custom AI', // don't change credits please 🙏🙂
    role: 0,
    category: 'ai',
    longDescription: {
      en: 'AI is designed to answer user queries and engage in conversations based on user input. It provides responses and insights on a wide range of topics.'
    },
    guide: {
      en: `
      Command: ai [question]
      - Use this command to ask a question to the AI chatbot.
      - Example: ai What is the weather like today?

      Reply with "reset" to clear the conversation history.
      `
    }
  },
  onStart: async () => {},
  onChat: async ({ api, event, args, message }) => {
    const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p));
    if (!prefix) return;

    const question = event.body.slice(prefix.length).trim();
    if (!question) {
      return message.reply("Hello! How can I assist you today?");
    }

    const uid = event.senderID;

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    const startTime = Date.now();

    try {
      const response = await axios.get('https://c-v1.onrender.com/c/v1', {
        params: {
          message: question,
          model: 'gpt',
          apiKey: '6a8f209e91d6',
          userId: uid
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from API');
      }

      const answer = response.data.response;
      const endTime = Date.now();
      const processTimeMs = endTime - startTime;
      const processTimeSec = (processTimeMs / 1000).toFixed(2);

      const replyMessage = await message.reply(`${answer}`); 
      global.GoatBot.onReply.set(replyMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: replyMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`Error fetching response: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
      message.reply(`⚠ An error occurred while processing your request. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, Reply, message }) => {
    const { author } = Reply;
    const userReply = event.body.trim();
    const userId = event.senderID;

    if (global.GoatBot.onReply.has(event.messageID)) {
      return;
    }

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    if (userReply.toLowerCase() === 'reset') {
      try {
        const response = await axios.get('https://c-v1.onrender.com/c/r', {
          params: { userId }
        });

        if (response.status !== 200 || !response.data.message) {
          throw new Error('Invalid or missing response from API');
        }

        message.reply("✅ The conversation history has been successfully cleared.");

        api.setMessageReaction("✅", event.messageID, () => {}, true);

      } catch (error) {
        console.error(`Error resetting conversation: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
        message.reply(`⚠ An error occurred while clearing the conversation history. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return;
    }

    const startTime = Date.now();

    try {
      const response = await axios.get('https://c-v1.onrender.com/c/v1', {
        params: {
          message: userReply,
          model: 'gpt',
          apiKey: '6a8f209e91d6',
          userId: userId
        }
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('Invalid or missing response from API');
      }

      const followUpResponse = response.data.response;
      const endTime = Date.now();
      const processTimeMs = endTime - startTime;
      const processTimeSec = (processTimeMs / 1000).toFixed(2);

      const followUpMessage = await message.reply(`${followUpResponse}`);

      global.GoatBot.onReply.set(followUpMessage.messageID, {
        commandName: module.exports.config.name,
        messageID: followUpMessage.messageID,
        author: event.senderID
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(`Error fetching follow-up response: ${error.message}, Status Code: ${error.response ? error.response.status : 'N/A'}`);
      message.reply(`⚠ An error occurred while processing your reply. Error: ${error.message}${error.response ? `, Status Code: ${error.response.status}` : ''}. Please try again later.`);

      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
