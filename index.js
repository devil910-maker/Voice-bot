import 'dotenv/config';
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_req, res) => res.send("OK"));
app.listen(PORT, () => console.log(`[WEB] listening on ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const OWNER_ID = process.env.OWNER_ID;

client.on("voiceStateUpdate", (oldState, newState) => {
  // 들어왔을 때 봇이 아님 + 방 입장
  if (!oldState.channelId && newState.channelId && newState.id === OWNER_ID) {
    joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator
    });
    console.log(">>> 주인 입장 → 봇 따라감");
  }

  // 나갔을 때
  if (oldState.channelId && !newState.channelId && oldState.id === OWNER_ID) {
    const conn = getVoiceConnection(oldState.guild.id);
    if (conn) conn.destroy();
    console.log(">>> 주인 퇴장 → 봇도 나감");
  }
});

client.once("ready", () => {
  console.log(`✅ 로그인 완료: ${client.user.tag}`);
});

client.login(process.env.TOKEN);
