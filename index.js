import { Client, GatewayIntentBits } from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
} from "@discordjs/voice";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  const ownerId = process.env.OWNER_ID;

  // 너가 음성채널 들어감
  if (newState.member.id === ownerId && newState.channel) {
    joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });
    console.log("🎧 따라 들어감");
  }

  // 너가 음성채널 나감
  if (oldState.member.id === ownerId && !newState.channel) {
    const connection = getVoiceConnection(oldState.guild.id);
    connection?.destroy();
    console.log("👋 따라 나감");
  }
});

client.login(process.env.TOKEN);
