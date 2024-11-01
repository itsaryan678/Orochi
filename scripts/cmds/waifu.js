const axios = require('axios');

module.exports = {
  config: {
    name: "waifu",
    version: "1.0",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "get random waifu",
    longDescription: "",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      let res = await axios.get(`https://c-v5.onrender.com/api/waifu`);
      let res2 = res.data;
      let img = res2.url;

      const form = {
        body: `Waifu 🥀😘`
      };
      if (img)
        form.attachment = await global.utils.getStreamFromURL(img);
      message.reply(form);
    } catch (e) {
      message.reply(`🥺 Not Found`);
    }
  }
};
