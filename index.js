import { Client, GatewayIntentBits, Events } from "discord.js";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TARGET_USER_ID = process.env.TARGET_USER_ID; // 너 디스코드 ID
const TOKEN = process.env.TOKEN;

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  // 들어옴 감지
  if (newState.id === TARGET_USER_ID && newState.channel) {
    console.log("🎧 대상 유저 입장 → 봇 입장 시도");

    joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });
  }

  // 나감 감지 → 봇도 나감
  const connection = getVoiceConnection(oldState.guild.id);
  if (oldState.id === TARGET_USER_ID && oldState.channel && !newState.channel) {
    console.log("🚪 대상 유저 퇴장 → 봇도 퇴장");
    if (connection) connection.destroy();
  }
});

client.login(TOKEN);
