import fs from 'fs';
import { fetchEvents } from './fetchEvents.mjs';

async function updateEvents() {
  const allEvents = await fetchEvents(); // összes esemény lekérése
  const newEvents = allEvents.filter(event => (new Date(event.start)).getFullYear() >= 2016); // csak az 2016 utáni események kiválogatása
  const config = { events: newEvents, lastUpdated: new Date().toISOString() };
  fs.writeFileSync('./events.json', JSON.stringify(config, null, 2));
  return 'Events have been updated!';
}

export { updateEvents };

