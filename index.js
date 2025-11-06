import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv/config.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TARGET_ID = process.env.TARGET_ID; // 너의 유저 ID
const TOKEN = process.env.TOKEN; // 봇 토큰

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 너가 음성채널 들어가면 → 봇도 따라옴
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    // 너가 음성채널에 "들어간 경우"
    if (newState.member.id === TARGET_ID && newState.channel) {
      const channel = newState.channel;
      const connection = await channel.join();
      console.log("🎧 들어감");
    }

    // 너가 음성채널에서 "나간 경우"
    if (oldState.member.id === TARGET_ID && !newState.channel) {
      const connection = oldState.channel?.guild?.me?.voice?.connection;
      if (connection) {
        connection.disconnect();
        console.log("👋 나감");
      }
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(TOKEN);
