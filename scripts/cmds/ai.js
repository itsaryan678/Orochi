const { post, get } = require("axios");
module.exports = {
 config: { 
 name: "ai", // Changed from "gpt" to "ai"
 category: "ai" 
 },
 onStart() {},
 
 onChat: async ({ message: { reply: r }, args: a, event: { senderID: s, threadID: t, body: b, messageReply: msg}, commandName, usersData, globalData, role }) => {
 const cmd = `${module.exports.config.name}`; // Now "ai"
 const pref = `${utils.getPrefix(t)}`;
 const pr = [`${pref}${cmd}`, `${cmd}`];
 const _m = "ai"; // Changed from "gpt" to "ai"
 if (a[0] && pr.some(x => a[0].toLowerCase() === x)) {
 const p = a.slice(1);
 const assistant = [
 "lover", 
 "helpful", 
 "friendly", 
 "toxic", 
 "bisaya", 
 "horny", 
 "tagalog", 
 "makima", 
 "godmode", 
 "default"
 ];
 const models = {
 1: "llama", 
 2: "gemini" 
 };
 let ads = "";
 if(role === 2) {
 ads = `To change model use:\n${cmd} model <num>\nTo allow NSFW use:\n${cmd} nsfw on/off`;
 }
 const num = assistant.map((i, x) => `${x + 1}. ${i}`).join("\n");
 const { name, settings, gender } = await usersData.get(s);
 const gen = gender === 2 ? 'male' : 'female';
 const sys = settings.system || "helpful";
 let url = undefined;
 if (msg && ["photo", "audio"].includes(msg.attachments[0]?.type)) {
 url = { link: msg.attachments[0].url, type: msg.attachments[0].type === "photo" ? "image" : "mp3" };
 }
 if (!p.length) return r(`Hello ${name}, choose your assistant:\n${num}\nExample: ${cmd} set friendly\n\n${ads}`);
 const mods = await globalData.get(_m) || { data: {} };
 if (p[0].toLowerCase() === "set" && p[1]?.toLowerCase()) {
 const choice = p[1].toLowerCase();
 if (assistant.includes(choice)) {
 await usersData.set(s, { settings: { system: choice } });
 return r(`Assistant changed to ${choice}`);
 }
 return r(`Invalid choice.\nAllowed: ${num}\nExample: ai set friendly`); // Updated example from "gpt" to "ai"
 }
 if (p[0] === 'nsfw') {
 if (role < 2) {
 return r("You don't have permission to use this.");
 }
 if (p[1].toLowerCase() === 'on') {
 mods.data.nsfw = true; 
 await globalData.set(_m, mods);
 return r(`Successfully turned on NSFW. NSFW features are now allowed to use.`);
 } else if (p[1].toLowerCase() === 'off') {
 mods.data.nsfw = false; 
 await globalData.set(_m, mods);
 return r(`Successfully turned off NSFW. NSFW features are now disabled.`);
 } else {
 return r(`Invalid usage: to toggle NSFW, use 'nsfw on' or 'nsfw off'.`);
 }
 }
 if (p[0].toLowerCase() === "model") {
 if (role < 2) {
 return r("You don't have permission to use this.");
 }
 const _model = models[p[1]]; 
 if (_model) {
 try {
 mods.data.model = _model;
 await globalData.set(_m, mods);
 return r(`Successfully changed model to ${_model}`);
 } catch (error) {
 return r(`Error setting model: ${error}`);
 }
 } else {
 return r(`Please choose only number\navailable models:\n${Object.entries(models).map(([id, name]) => `${id}: ${name}`).join("\n")}\n\nExample: ${pref}${cmd} model 1`); // Updated example from "gpt" to "ai"
 }
 }
 let Gpt = await globalData.get(_m); // Variable name can stay as Gpt or be changed to Ai for consistency
 if (!Gpt || Gpt === "undefined") {
 await globalData.create(_m, { data: { model: "llama", nsfw: false } }); 
 Gpt = await globalData.get(_m);
 }
 const { data: { nsfw, model } } = Gpt;
 const { result, media } = await ai(p.join(" "), s, name, sys, gen, model, nsfw, url);
 
 let attachments;
 if (media && media.startsWith("https://cdn")) {
 attachments = await global.utils.getStreamFromURL(media, "spotify.mp3");
 } else if (media) {
 attachments = await global.utils.getStreamFromURL(media);
 }
 
 const rs = {
 body: result,
 mentions: [{ id: s, tag: name }]
 };
 
 if (attachments) {
 rs.attachment = attachments;
 }
 
 const { messageID: m } = await r(rs);
 global.GoatBot.onReply.set(m, { commandName, s, model, nsfw });
 }
 },
 
 onReply: async ({ 
 Reply: { s, commandName, model, nsfw }, 
 message: { reply: r }, 
 args: a, 
 event: { senderID: x, body: b, attachments, threadID: t }, 
 usersData 
 }) => {
 const cmd = `${module.exports.config.name}`; // Now "ai"
 const pref = `${utils.getPrefix(t)}`;
 const { name, settings, gender } = await usersData.get(x);
 const sys = settings.system || "helpful";
 if (s !== x || b?.toLowerCase().startsWith(cmd) || b?.toLowerCase().startsWith(pref + cmd) || b?.toLowerCase().startsWith(pref + "unsend")) return;

 let url = null;
 let prompt = a.join(" ");
 if (!b.includes(".")) {
 const img = attachments?.[0];
 if (img) {
 if (img.type === "sticker" && img.ID === "369239263222822") {
 prompt = "👍";
 } else {
 url = (img.type === "sticker") 
 ? { link: img.url, type: "image" } 
 : (img.type === "photo") 
 ? { link: img.url, type: "image" } 
 : (img.type === "audio") 
 ? { link: img.url, type: "mp3" } 
 : null;
 if (url) prompt = ".";
 }
 }
 }

 const { result, media } = await ai(prompt || ".", x, name, sys, gender === 2 ? 'male' : 'female', model, nsfw, url);
 const rs = {
 body: result,
 mentions: [{ id: x, tag: name }]
 };
 if (media) {
 if (media.startsWith('https://cdn')) {
 rs.attachment = await global.utils.getStreamFromURL(media, "spotify.mp3");
 } else {
 rs.attachment = await global.utils.getStreamFromURL(media);
 }
 }
 const { messageID } = await r(rs);
 global.GoatBot.onReply.set(messageID, { commandName, s, sys, model, nsfw, url });
 }
};

//llama3-70b-8192
async function ai(prompt, id, name, system, gender, model, nsfw, link = "") {
 const g4o = async (p, m = "gemma2-9b-it") => post(atob(String.fromCharCode(...atob((await get(atob("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2p1bnpkZXZvZmZpY2lhbC90ZXN0L3JlZnMvaGVhZHMvbWFpbi90ZXN0LnR4dA=="))).data).split(" ").map(Number))),
 { 
 id, 
 prompt: p, 
 name, 
 model, 
 system, 
 customSystem: [
 {
 default: "You are helpful assistant"
 },
 {
 makima: "You are a friendly assistant, your name is makima"
 }
 ],
 gender, 
 nsfw,
 url: link ? link : undefined, /*@{object} { link, type: "image or mp3" } */
 config: [{ 
 gemini: {
 apikey: "AIzaSyAqigdIL9j61bP-KfZ1iz6tI9Q5Gx2Ex_o", 
 model: "gemini-1.5-flash"
 },
 llama: { model: m }
 }]
 },
 {
 headers: { 
 'Content-Type': 'application/json', 
 'Authorization': 'Bearer test' 
 } 
 });

 try {
 let res = await g4o(prompt);
 if (["i cannot", "i can't"].some(x => res.data.result.toLowerCase().startsWith(x))) {
 await g4o("clear");
 res = await g4o(prompt, "llama-3.1-70b-versatile");
 }
 return res.data;
 } catch {
 try {
 // await g4o("clear");
 return (await g4o(prompt, "llama-3.1-70b-versatile")).data;
 } catch (err) {
 const e = err.response?.data;
 const errorMessage = typeof e === 'string' ? e : JSON.stringify(e);

 return errorMessage.includes("Payload Too Large") ? { result: "Your text is too long" } : 
 errorMessage.includes("Service Suspended") ? { result: "The API has been suspended, please wait for the dev to replace the API URL" } :
 { result: e?.error || e || err.message };
 }
 }
   }
