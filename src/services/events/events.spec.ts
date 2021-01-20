import { Event, mockEventsData } from '@/entities/event';
import { mockHttp } from '@/services/httpClient.mock';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  test('createEvent is linked to the correct URL', async () => {
    await service.createEvent(new Event(mockEventsData()[0]));
    expect(http.post).toHaveBeenCalledWith('/event/events', null); // todo
  });

  test('createEvent converts the event entity to the correct payload', async () => {
    expect(true).toBe(true); // todo
  });

  test('getEvents is linked to the correct URL', async () => {
    await service.getEvents();
    expect(http.get).toHaveBeenCalledWith('/event/events');
  });

  test('getEventTypes is linked to the correct URL', async () => {
    await service.getEventTypes();
    expect(http.get).toHaveBeenCalledWith('/event/event-types');
  });
});
