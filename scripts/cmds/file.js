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
    const filePath = path.join(__dirname, `${args[0]}.js`);
    if (!args[0] || !fs.existsSync(filePath)) {
      return api.sendMessage("File not found or not provided.", event.threadID, event.messageID);
    }
    api.sendMessage({ body: fs.readFileSync(filePath, 'utf8') }, event.threadID);
  }
};
