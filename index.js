process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

import 'dotenv/config';
import {
  Client, GatewayIntentBits, Partials
} from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  EndBehaviorType
} from '@discordjs/voice';
import prism from 'prism-media';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';

const TOKEN = process.env.TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USER_ID = '363853471516065823';   // ✅ 네 ID 고정

if (!TOKEN) throw new Error('TOKEN 없음');
if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 없음');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partial
