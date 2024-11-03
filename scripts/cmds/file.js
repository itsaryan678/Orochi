const fs = require('fs');
const path = require('path');

module.exports = {
  config: { 
    name: "file", 
    author: "ArYAN",
    role: 2,
    category: "owner"   
  },
  
  onStart: async ({ message, args, api, event }) => {
    // Check if user has VIP permission
 const permission = global.GoatBot.config.vipUser;
 if (!permission.includes(event.senderID)) {
 api.sendMessage("You don't have enough permission to use this command. Only My Authors Have Access.", event.threadID, event.messageID);
 return;
 }

		const filePath = path.join(__dirname, `${args[0]}.js`);
    if (!args[0] || !fs.existsSync(filePath)) {
      return api.sendMessage("File not found or not provided.", event.threadID, event.messageID);
    }
    api.sendMessage({ body: fs.readFileSync(filePath, 'utf8') }, event.threadID);
  }
};
