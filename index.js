import { Client, GatewayIntentBits, Events, ChannelType } from "discord.js";
import dotenv from "dotenv";
import express from "express";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";

dotenv.config();

// Render Keep Alive
const app = express();
app.get("/", (_req, res) => res.send("ok"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http server :${PORT}`));

const TOKEN = process.env.TOKEN;
const TARGET_USER_ID = process.env.TARGET_USER_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
});

// 유저 따라서 들어가기
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const userJoined = !oldState.channelId && newState.channelId;
  const userMoved = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

  if (!(userJoined || userMoved)) return;
  if (newState.member?.id !== TARGET_USER_ID) return;

  const channel = newState.channel;
  if (!channel) return;

  joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
});

// 유저 나가면 같이 나가기
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const userLeft = oldState.channelId && !newState.channelId;
  if (!userLeft) return;
  if (oldState.member?.id !== TARGET_USER_ID) return;

  const conn = getVoiceConnection(oldState.guild.id);
  if (conn) conn.destroy();
});

client.once(Events.ClientReady, () => {
  console.log(`ready: ${client.user.tag}`);
});

client.login(TOKEN);
