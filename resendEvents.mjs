import fs from 'fs';
import Discord from 'discord.js';

async function resendEvents(client, textChannelId) {
  import Discord from 'discord.js';

  async function resendEvents(client, textChannelId) {
      let config;
      Added error handling for when `events.json` cannot be parsed.
      const lastUpdated = config.lastUpdated;
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
  const events = config.events.filter(event => new Date(event.start) > new Date('2016'));
  const lastUpdated = config.lastUpdated;
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  const embed = new Discord.MessageEmbed()
    .setTitle('Upcoming Pokemon Go Events')
    .setColor('#0099ff')
    .setDescription(events.map(event => `${event.name} - ${getFormattedDate(event.start)}`).join('\n'));
  const channel = await client.channels.fetch(textChannelId);
  await channel.send(`**Events as of ${lastUpdated}:**`);
  await channel.send({ embeds: [embed] });
  return 'Events have been resent!';
}

function getFormattedDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export { resendEvents };

