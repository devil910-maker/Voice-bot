import "dotenv/config.js";
import {
  Client,
  GatewayIntentBits,
  Events
} from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState
} from "@discordjs/voice";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;
const OWNER_ID = process.env.OWNER_ID;

client.once(Events.ClientReady, () => {
  console.log(`✅ 봇 로그인됨: ${client.user.tag}`);
});

// ✅ 핵심: “내가 음성채널에 있는가” 기준으로 동작
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

  const meInVoice = newState.guild.members.cache.get(OWNER_ID)?.voice?.channel;

  // 너가 음성채널에 **있다** → 봇도 그 채널에 있어야 함
  if (meInVoice) {
    const conn = getVoiceConnection(newState.guild.id);

    if (!conn || conn.joinConfig.channelId !== meInVoice.id) {
      joinVoiceChannel({
        channelId: meInVoice.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
      });

      console.log("🎧 주인님 위치 감지 → 봇 입장 / 이동");

      // 연결 안정화 기다림
      try { await entersState(conn, VoiceConnectionStatus.Ready, 5000); } catch {}
    }
  }

  // 너가 음성채널에 **없다** → 봇도 나감
  else {
    const conn = getVoiceConnection(oldState.guild.id);
    if (conn) {
      conn.destroy();
      console.log("👋 주인님 없음 → 봇 퇴장");
    }
  }
});

client.login(TOKEN);
