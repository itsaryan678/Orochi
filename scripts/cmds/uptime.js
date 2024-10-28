const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs-extra');
const path = require('path');

module.exports = {
 config: {
 name: "uptime",
 aliases: ["up"],
 version: "1.1",
 author: "Team Calyx",
 role: 0,
 category: "system",
 guide: {
 en: "Use {p}info"
 }
 },
 onStart: async function ({ message, event, api }) {

 const timeStart = Date.now(); // Start time for ping calculation

 // Format current date and time in Bangladesh time (UTC+6)
 const currentTime = new Date();
 const options = { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
 const formattedDate = currentTime.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' });
 const formattedTime = currentTime.toLocaleString('en-GB', options);

 const uptime = process.uptime();
 const formattedUptime = formatMilliseconds(uptime * 1000);

 const totalMemory = os.totalmem();
 const freeMemory = os.freemem();
 const usedMemory = totalMemory - freeMemory;

 const diskUsage = await getDiskUsage();
 const ping = Date.now() - timeStart; // Calculate ping as the difference between now and the start time
 const hostname = os.hostname();

 const systemInfo = {
 os: `${os.type()} ${os.release()} (${os.arch()})`,
 hostname: hostname,
 cpu: `${os.cpus()[0].model} (${os.cpus().length} core(s))`,
 ram: `${prettyBytes(usedMemory)} / ${prettyBytes(totalMemory)} (used)`,
 freeRam: `${prettyBytes(freeMemory)}`,
 storage: `${prettyBytes(diskUsage.used)} / ${prettyBytes(diskUsage.total)} (used)`,
 freeStorage: `${prettyBytes(diskUsage.total - diskUsage.used)}`,
 loadAvg: os.loadavg()[0] // 1-minute load average
 };

 const userName = event.senderID ? await getUserName(event.senderID, api) : "Unknown User";
 
 // Fetch the count of dependencies from package.json
 const packages = getPackages();
 const packageCount = Object.keys(packages).length;

 const response = `📅 Date: ${formattedDate}\n`
 + `⏰ Current time: ${formattedTime}\n`
 + `🤖 Bot Uptime: ${formattedUptime}\n`
 + `🗂 Number of packages: ${packageCount}\n`
 + `🔣 Bot status: smooth\n`
 + `📋 OS: ${systemInfo.os}\n`
 + `🏷 Hostname: Heroku\n`
 + `💾 CPU: ${systemInfo.cpu}\n`
 + `📊 RAM: ${systemInfo.ram}\n`
 + `🛢 Free RAM: ${systemInfo.freeRam}\n`
 + `🗄 Storage: ${systemInfo.storage}\n`
 + `📑 Free Storage: ${systemInfo.freeStorage}\n`
 + `🛜 Ping: ${ping}ms\n`
 + `👤 Requested by: ${userName}`;

 message.reply(response);
 }
};

async function getDiskUsage() {
 const { stdout } = await exec('df -k /');
 const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
 return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

async function getUserName(userID, api) {
 try {
 const userInfo = await api.getUserInfo(userID);
 return userInfo[userID].name || "Unknown User";
 } catch (error) {
 return "Unknown User";
 }
}

function formatMilliseconds(ms) {
 const seconds = Math.floor(ms / 1000);
 const minutes = Math.floor(seconds / 60);
 const hours = Math.floor(minutes / 60);
 
 return `${String(hours).padStart(2, '0')}h ${String(minutes % 60).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`;
}

function prettyBytes(bytes) {
 const units = ['B', 'KB', 'MB', 'GB', 'TB'];
 let i = 0;
 while (bytes >= 1024 && i < units.length - 1) {
 bytes /= 1024;
 i++;
 }
 return `${bytes.toFixed(2)} ${units[i]}`;
}

function getPackages() {
 try {
 const packageJsonPath = path.join(__dirname, '..', '..', 'package.json'); // Adjust path if necessary
 const packageJson = fs.readJsonSync(packageJsonPath);
 return packageJson.dependencies || {};
 } catch (error) {
 return {};
 }
}
