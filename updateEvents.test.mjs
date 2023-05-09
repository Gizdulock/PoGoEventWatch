import { updateEvents } from './updateEvents.mjs';

describe('updateEvents', () => {
  test('should update events', async () => {
    const result = await updateEvents();
    expect(result).toBe('Events have been updated!');
  });

  test('should write to events.json', async () => {
    await updateEvents();
    const events = JSON.parse(fs.readFileSync('./events.json'));
    expect(events.lastUpdated).toBeDefined();
    expect(events.events.length).toBeGreaterThan(0);
  });
});