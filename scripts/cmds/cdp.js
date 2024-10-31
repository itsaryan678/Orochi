const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
 config: {
 name: "cdp",
 aliases: ["coupledp"],
 version: "1.0",
 author: "ArYAN",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "couple dp"
 },
 longDescription: {
 en: "couple dp"
 },
 category: "media",
 guide: {
 en: "{pn}"
 }
 },

 onStart: async function ({ api, event, args }) {
 try {
 const { data } = await axios.get(
 "https://c-v5.onrender.com/v1/cdp/get"
 );

 const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
 fs.writeFileSync(__dirname + "/tmp/img1.png", Buffer.from(maleImg.data, "utf-8"));
 const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
 fs.writeFileSync(__dirname + "/tmp/img2.png", Buffer.from(femaleImg.data, "utf-8"));

 const msg = "Here is your couple dp 💜(◕ᴗ◕✿)";
 const allImages = [
 fs.createReadStream(__dirname + "/tmp/img1.png"),
 fs.createReadStream(__dirname + "/tmp/img2.png")
 ];

 return api.sendMessage({
 body: msg,
 attachment: allImages
 }, event.threadID, event.messageID);
 } catch (error) {
 console.error(error);
 }
 }
};
