import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.on("ready", () => {
  console.log(`✅ 로그인 완료: ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.content === "!핑") {
    msg.reply("pong!");
  }
});

client.login(process.env.TOKEN);
