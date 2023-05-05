import 'dotenv/config';
import Discord from 'discord.js';
import fs from 'fs';
import { fetchEvents } from './fetchEvents.mjs';
import { updateEvents } from './updateEvents.mjs';
import { resendEvents } from './resendEvents.mjs';
import commands from './commands.mjs';

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN;
const textChannelId = process.env.TEXT_CHANNEL_ID;
const serverId = process.env.SERVER_ID;
const adminId = process.env.ADMIN_ID;
const categoryChannelId = process.env.CATEGORY_CHANNEL_ID;
let currentEventMessages = [];
let lastUpdate = new Date(); // Initialize the variable to the current date and time

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  createEventChannels();
  updateEventMessage();
  setInterval(updateEventMessage, 60 * 60 * 1000);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (Object.keys(commands).includes(command)) {
    commands[command](message, args);
  }
});

async function createEventChannels() {
  const events = await fetchEvents();
  const currentEvents = getCurrentEvents(events);

  currentEvents.forEach(event => {
    const channelName = `${getFormattedDate(event.start)} - ${event.name}`;
    const guild = client.guilds.cache.get(serverId);
    const existingChannel = guild.channels.cache.find(channel => channel.type === 'GUILD_VOICE' && channel.name === channelName);
    if (!existingChannel) {
      guild.channels.create(channelName, {
        type: 'GUILD_VOICE',
        parentID: categoryChannelId
      }).then(channel => {
        setTimeout(() => {
          channel.delete();
        }, new Date(event.end) - new Date());
      });
    }
  });
}

function getCurrentEvents(events) {
  const now = new Date();
  return events.filter(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return start <= now && end >= now;
  });
}

async function updateEventMessage() {
  const events = await fetchEvents();
  const currentEvents = getCurrentEvents(events);

  const newEventMessages = currentEvents.map(event => `${getFormattedDate(event.start)} - ${event.name}`).sort();
  const removedEvents = currentEventMessages.filter(message => !newEventMessages.includes(message));
  const addedEvents = newEventMessages.filter(message => !currentEventMessages.includes(message));
  currentEventMessages = newEventMessages;

  if (addedEvents.length > 0 || removedEvents.length > 0) {
    lastUpdate = new Date(); // Update the lastUpdate variable to the current date and time
    updateEvents(textChannelId, currentEvents, addedEvents, removedEvents, lastUpdate); // Pass the lastUpdate variable to the updateEvents function
  }
}

function getFormattedDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

client.login(token);

