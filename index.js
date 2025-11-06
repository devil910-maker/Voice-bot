import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv/config.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
} from "@discordjs/voice";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const TOKEN = process.env.TOKEN;
const TARGET_ID = process.env.TARGET_ID;

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("voiceStateUpdate", (oldState, newState) => {

  // 들어감
  if (newState.member.id === TARGET_ID && newState.channel) {
    joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator
    });
    console.log("🎧 따라 들어감");
  }

  // 나감
  if (oldState.member.id === TARGET_ID && !newState.channel) {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
      connection.destroy();
      console.log("👋 따라 나감");
    }
  }
});

client.login(TOKEN);
