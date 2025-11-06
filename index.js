client.on("voiceStateUpdate", (oldState, newState) => {
  const ownerId = process.env.OWNER_ID;

  // 너가 들어갔을 때 → 따라 들어감
  if (newState.member.id === ownerId && newState.channel) {
    joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });
    console.log("🎧 들어감");
  }

  // 너가 음성채널에서 **사라졌는지** 체크
  const botConnection = getVoiceConnection(oldState.guild.id);
  const ownerStillInVoice =
    newState.guild.members.cache.get(ownerId)?.voice?.channel;

  // 너가 음성채널에 **없다면** → 봇 퇴장
  if (botConnection && !ownerStillInVoice) {
    botConnection.destroy();
    console.log("👋 나감");
  }
});
