import { Event, mockEventsData } from '@/entities/event';
import { mockHttp } from '@/services/httpClient.mock';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  test('createEvent is linked to the correct URL', async () => {
    await service.createEvent(new Event(mockEventsData()[0]));
    expect(http.post).toHaveBeenCalledWith('/event/events', expect.anything());
  });

  test('createEvent converts the event entity to the correct payload', async () => {
    await service.createEvent(new Event(mockEventsData()[0]));
    expect(http.post).toHaveBeenCalledWith('/event/events', {
      assistanceNumber: '514 454 4545',
      dateReported: new Date('2021-01-01T00:00:00.000Z'),
      description: {
        translation: {
          en: 'Desc EN',
          fr: 'Desc FR',
        },
      },
      name: {
        translation: {
          en: 'Gatineau Floods 2021',
          fr: 'Inondations Gatineau 2021',
        },
      },
      province: 11,
      provinceOther: {
        translation: {
          en: '',
          fr: '',
        },
      },
      region: {
        translation: {
          en: '',
          fr: '',
        },
      },
      relatedEvents: [],
      responseLevel: 3,
      scheduledCloseDate: new Date('2021-06-15T00:00:00.000Z'),
      scheduledOpenDate: new Date('2021-03-15T00:00:00.000Z'),
    });
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
