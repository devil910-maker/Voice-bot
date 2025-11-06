// index.js
import { Client, GatewayIntentBits, Events, ChannelType } from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// ---------- Render keep-alive ----------
const app = express();
app.get("/", (_req, res) => res.send("ok"));
app.get("/health", (_req, res) => res.json({ ok: true }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http server :${PORT}`));

// ---------- ENV ----------
const TOKEN = process.env.TOKEN;                  // 봇 토큰
const GUILD_ID = process.env.GUILD_ID;            // 서버 ID (옵션)
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID; // 기본 채널 (옵션)
const TARGET_USER_ID = process.env.TARGET_USER_ID;      // 따라갈 유저 ID

// ---------- Client ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // 필수
  ],
});

// ---------- helpers ----------
function connectToVoice(channel) {
  // 기존 연결 있으면 채널 비교 후 이동
  const prev = getVoiceConnection(channel.guild.id);
  if (prev) {
    const same =
      prev.joinConfig.channelId && prev.joinConfig.channelId === channel.id;
    if (same) return prev;
    try { prev.destroy(); } catch {}
  }

  const conn = joinVoiceChannel({
    guildId: channel.guild.id,
    channelId: channel.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false,
  });
  return conn;
}

async function followUser(newState) {
  const ch = newState.channel;
  if (!ch || ch.type !== ChannelType.GuildVoice) return;

  // 이미 그 채널에 붙어있으면 패스
  const conn = getVoiceConnection(ch.guild.id);
  if (conn?.joinConfig.channelId === ch.id) return;

  try {
    const c = connectToVoice(ch);
    await entersState(c, VoiceConnectionStatus.Ready, 10_000);
    console.log(`joined #${ch.name}`);
  } catch (e) {
    console.error("join error:", e?.message || e);
  }
}

function leaveIfWithTarget(oldState) {
  const left = oldState.channelId && !oldState.newState?.channelId;
  const wasTarget = oldState.member?.id === TARGET_USER_ID;
  if (!left || !wasTarget) return;

  const conn = getVoiceConnection(oldState.guild.id);
  if (conn && conn.joinConfig.channelId === oldState.channelId) {
    try {
      conn.destroy();
      console.log("left with target");
    } catch (e) {
      console.error("leave error:", e?.message || e);
    }
  }
}

// ---------- events ----------
client.once(Events.ClientReady, async () => {
  console.log(`ready: ${client.user.tag}`);
  if (VOICE_CHANNEL_ID) {
    try {
      const ch = await client.channels.fetch(VOICE_CHANNEL_ID);
      if (ch?.type === ChannelType.GuildVoice) {
        console.log(`default voice channel: ${ch.name}`);
      }
    } catch {}
  }
});

// 유저 이동/입장 감지
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  // 대상 유저가 들어오거나 이동
  if (
    TARGET_USER_ID &&
    newState.member?.id === TARGET_USER_ID &&
    newState.channelId &&
    oldState.channelId !== newState.channelId
  ) {
    await followUser(newState);
  }

  // 대상 유저가 나감
  if (TARGET_USER_ID && oldState.member?.id === TARGET_USER_ID) {
    const actuallyLeft = oldState.channelId && !newState.channelId;
    if (actuallyLeft) leaveIfWithTarget(oldState);
  }
});

// 안전 종료
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    try { getVoiceConnection(GUILD_ID || "")?.destroy(); } catch {}
    process.exit(0);
  });
}

client.login(TOKEN);
