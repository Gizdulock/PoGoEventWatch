import { fetchEvents } from './fetchEvents.mjs';
import { updateEvents } from './updateEvents.mjs';
import { resendEvents } from './resendEvents.mjs';
import Discord from 'discord.js';

const prefix = process.env.PREFIX;
const textChannelId = process.env.TEXT_CHANNEL_ID;
const adminId = process.env.ADMIN_ID;

const sendMessage = async (channel, content) => {
  const delay = 1000; // várakozási idő 1 másodperc
  const messages = content instanceof Array ? content : [content];
  for (let i = 0; i < messages.length; i++) {
    await channel.send(messages[i]);
    if (i < messages.length - 1) {
      // Ha több üzenetet kell küldeni, várunk 1 másodpercet
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  events: async (message) => {
    const events = await fetchEvents();
    const filteredEvents = events.filter(event => new Date(event.start) > new Date('2015-12-31')); // Filter out events whose start date is before Jan 1, 2016
    filteredEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    const embed = new Discord.MessageEmbed()
      .setTitle('Upcoming Pokemon Go Events')
      .setColor('#0099ff')
  
    filteredEvents.forEach(event => {
      embed.addField(event.name, `${getFormattedDate(event.start)} - ${getFormattedDate(event.end)}\n${event.description}`)
    })
    
    message.channel.send({ embeds: [embed] });
  },
  update: async (message) => {
    if (message.author.id !== adminId) {
      message.reply('You do not have permission to use this command.');
      return;
    }
    const messageText = await updateEvents();
    message.reply(messageText);
  },
  resend: async (message) => {
    if (message.author.id !== adminId) {
      message.reply('You do not have permission to use this command.');
      return;
    }
    const messageText = await resendEvents(client, textChannelId);
    message.reply(messageText);
  },
  currentevent: async (message) => {
    const events = await fetchEvents();
    const currentEvents = getCurrentEvents(events);
    const embed = new Discord.MessageEmbed()
      .setTitle('Current Pokemon Go Events')
      .setColor('#0099ff');
    currentEvents.forEach(event => {
      embed.addField(event.name, `${getFormattedDate(event.start)} - ${getFormattedDate(event.end)}\n${event.description}`);
    });
    message.channel.send({ embeds: [embed] });
  },
  detailedevents: async (message) => {
  const events = await fetchEvents();
  const embed = new Discord.MessageEmbed()
    .setTitle('Detailed Pokemon Go Events')
    .setColor('#0099ff');
  for (const event of events) {
    const detailedEvent = {
      Name: event.name,
      Start: event.start,
      End: event.end,
      "Event Details": event.bonuses.join(', ') || "None",
      "Event Pokemon Spawn": event.spawns.join(', ') || "None",
      "Event Raids": event.raids.join(', ') || "None",
      "Event Hatchable Eggs": event.eggs.join(', ') || "None",
    };
    embed.fields = [];
    for (const [key, value] of Object.entries(detailedEvent)) {
      embed.addField(key, value);
    }
    await message.channel.send({ embeds: [embed] });
    await new Promise(resolve => setTimeout(resolve, 200)); // várakozás 200 ms-ig a következő üzenet előtt
  }
},

};

function getCurrentEvents(events) {
  const now = new Date();
  return events.filter(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return start <= now && end >= now;
  });
}

function getFormattedDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

