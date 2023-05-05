import fetch from 'node-fetch';

async function fetchEvents() {
  const response = await fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/events.json');
  const data = await response.json();
  const events = data.filter(event => new Date(event.start).getFullYear() >= 2016);
  return events;
}

export { fetchEvents };
