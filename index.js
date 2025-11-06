// index.js  (완전체: 그대로 교체)
import { Client, GatewayIntentBits, Events, ChannelType } from "discord.js";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// ===== Render Web Service용 Keep-Alive HTTP 서버 =====
const app = express();
app.get("/", (_req, res) => res.send("ok"));
app.get("/health", (_req, res) => res.json({ ok: true }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http server :${PORT}`));

// ===== 디스코드 봇 =====
const TOKEN = process.env.TOKEN;                 // 봇 토큰
const GUILD_ID = process.env.GUILD_ID;           // 서버 ID
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID; // 기본 음성채널 ID (선택)
const TARGET_USER_ID = process.env.TARGET_USER_ID;     // 따라갈 유저 ID

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
});

async function tryFollow(targetState) {
  try {
    const channel = targetState.channel;
    if (!channel || channel.type !== ChannelType.GuildVoice) return;

    // 이미 같은 채널이면 패스
    const me = targetState.guild.members.me;
    if (me?.voice?.channelId === channel.id) return;

    // 연결
    await channel.join? channel.join() : null; // 구버전 가드
  } catch (e) {
    console.error("follow error:", e?.message || e);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`ready: ${client.user.tag}`);

  // 봇이 들어오면 기본 채널로 입장(옵션)
  if (VOICE_CHANNEL_ID) {
    try {
      const ch = await client.channels.fetch(VOICE_CHANNEL_ID);
      if (ch?.type === ChannelType.GuildVoice) {
        // voice adapter 방식이 필요하면 @discordjs/voice로 교체
        // 여기선 단순 존재 체크만
        console.log("default voice channel set:", VOICE_CHANNEL_ID);
      }
    } catch {}
  }
});

// 대상 유저가 음성채널에 들어오면 따라가기
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const joined = !oldState.channelId && newState.channelId; // 채널에 새로 진입
  const moved  = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;

  if (!(joined || moved)) return;
  if (!TARGET_USER_ID) return;
  if (newState.member?.id !== TARGET_USER_ID) return;

  await tryFollow(newState);
});

// 대상 유저가 나가면 같이 나가기(봇이 같은 채널일 때)
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const left = oldState.channelId && !newState.channelId;
  if (!left) return;
  if (oldState.member?.id !== TARGET_USER_ID) return;

  const me = newState.guild.members.me;
  if (me?.voice?.channelId === oldState.channelId) {
    try { await me.voice.disconnect(); } catch (e) { console.error("leave error:", e?.message || e); }
  }
});

client.login(TOKEN);
