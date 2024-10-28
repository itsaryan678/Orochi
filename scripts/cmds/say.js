const axios = require('axios');

module.exports = {
    config: {
        name: "say",
        version: "1.0",
        author: "ArYAN",
        countDown: 5,
        role: 0,
        shortDescription: "say something",
        longDescription: "",
        category: "fun",
        guide: {
            vi: "{pn} text ",
            en: "{pn} text "
        }
    },
    onStart: async function ({ api, message, args, event }) {
        try {
            let text = "";

            if (event.messageReply) {
                text = event.messageReply.body;
            } else {
                text = args.join(" ");
            }

            let say = encodeURIComponent(text);
            let url = `https://c-v5.onrender.com/tts?text=${say}&lang=en`;

            message.reply({
                body: "",
                attachment: await global.utils.getStreamFromURL(url)
            });
        } catch (e) {
            console.log(e);
            message.reply(`error`);
        }
    }
};
