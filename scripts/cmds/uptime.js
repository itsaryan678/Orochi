const os = require("os");
const fs = require("fs-extra");

const startTime = new Date(); // Moved outside onStart

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "stats"],
    author: "ArYAN",
    countDown: 0,
    role: 0,
    category: "system",
    longDescription: {
      en: "Get System Information",
    },
  },
  
  onStart: async function ({ api, event, args, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;

      const seconds = uptimeInSeconds;
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secondsLeft = Math.floor(seconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const loadAverage = os.loadavg();
      const cpuUsage =
        os
          .cpus()
          .map((cpu) => cpu.times.user)
          .reduce((acc, curr) => acc + curr) / os.cpus().length;

      const totalMemoryGB = os.totalmem() / 1024 ** 3;
      const freeMemoryGB = os.freemem() / 1024 ** 3;
      const usedMemoryGB = totalMemoryGB - freeMemoryGB;

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const currentDate = new Date();
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const date = currentDate.toLocaleDateString("en-US", options);
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      });

      const timeStart = Date.now();
      await api.sendMessage({
        body: "ðŸ”Ž| checking........",
      }, event.threadID);

      const ping = Date.now() - timeStart;

      let pingStatus = "â›”| ð–¡ð–ºð–½ ð–²ð—’ð—Œð—ð–¾ð—†";
      if (ping < 1000) {
        pingStatus = "âœ…| ð–²ð—†ð—ˆð—ˆð—ð— ð–²ð—’ð—Œð—ð–¾ð—†";
      }
      const systemInfo = `â™¡   âˆ©_âˆ©
 ï¼ˆâ€žâ€¢ ÖŠ â€¢â€ž)â™¡
â•­â”€âˆªâˆªâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
â”‚ ð—¨ð—£ð—§ð—œð— ð—˜ ð—œð—¡ð—™ð—¢
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
â”‚ ðŸ¤– ð—•ð—¢ð—§ ð—œð—¡ð—™ð—¢ 
â”‚ ð™½ð™°ð™¼ð™´: ð™¶ðš˜ðšŠðšð™±ðš˜ðš
â”‚ ð™»ð™°ð™½ð™¶: ð™½ðš˜ðšðšŽðš“ðšœ
â”‚ ð™¿ðšð™µð™¸ðš‡: .
â”‚ ð™³ð™´ðš…ðš‚: ð™°ðš›ðš¢ ðšƒðšŽðšŠðš–
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
â”‚ â° ð—¥ð—¨ð—¡ð—§ð—œð— ð—˜
â”‚  ${uptimeFormatted}
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
â”‚ ðŸ‘‘ ð—¦ð—¬ð—¦ð—§ð—˜ð—  ð—œð—¡ð—™ð—¢
â”‚ð™¾ðš‚: ${os.type()} ${os.arch()}
â”‚ð™»ð™°ð™½ð™¶ ðš…ð™´ðš: ${process.version}
â”‚ð™²ð™¿ðš„ ð™¼ð™¾ð™³ð™´ð™»: ${os.cpus()[0].model}
â”‚ðš‚ðšƒð™¾ðšð™°ð™¶ð™´: ${usedMemoryGB.toFixed(2)} GB / ${totalMemoryGB.toFixed(2)} GB
â”‚ð™²ð™¿ðš„ ðš„ðš‚ð™°ð™¶ð™´: ${cpuUsage.toFixed(1)}%
â”‚ðšð™°ð™¼ ðš„ðš‚ð™¶ð™´: ${process.memoryUsage().heapUsed / 1024 / 1024} MB;
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
â”‚ âœ… ð—¢ð—§ð—›ð—˜ð—¥ ð—œð—¡ð—™ð—¢
â”‚ð™³ð™°ðšƒð™´: ${date}
â”‚ðšƒð™¸ð™¼ð™´: ${time}
â”‚ðš„ðš‚ð™´ðšðš‚: ${allUsers.length}
â”‚ðšƒð™·ðšð™´ð™°ð™³ðš‚: ${allThreads.length}
â”‚ð™¿ð™¸ð™½ð™¶: ${ping}ðš–ðšœ
â”‚ðš‚ðšƒð™°ðšƒðš„ðš‚: ${pingStatus}
â•°â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€âŸ¡
`;

      api.sendMessage(
        {
          body: systemInfo,
        },
        event.threadID,
        (err, messageInfo) => {
          if (err) {
            console.error("Error sending message with attachment:", err);
          } else {
            console.log(
              "Message with attachment sent successfully:",
              messageInfo,
            );
          }
        },
      );
    } catch (error) {
      console.error("Error retrieving system information:", error);
      api.sendMessage(
        "Unable to retrieve system information.",
        event.threadID,
        event.messageID,
      );
    }
  },
};
