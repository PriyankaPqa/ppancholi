import {
  Event, EEventStatus, mockEventsSearchData,
} from '@/entities/event';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createEvent is linked to the correct URL', async () => {
    await service.createEvent(new Event(mockEventsSearchData()[0]));
    expect(http.post).toHaveBeenCalledWith('/event/events', expect.anything(), { globalHandler: false });
  });

  test('createEvent converts the event entity to the correct payload', async () => {
    await service.createEvent(new Event(mockEventsSearchData()[0]));
    expect(http.post).toHaveBeenCalledWith('/event/events', {
      assistanceNumber: '+15144544545',
      dateReported: '2021-01-01T00:00:00.000Z',
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
      eventType: {
        optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
        specifiedOther: '',
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
      relatedEventIds: ['87776243-696f-426b-b961-31ee98e3a4cd'],
      responseLevel: 3,
      scheduledCloseDate: '2021-06-15T00:00:00.000Z',
      scheduledOpenDate: '2021-03-15T00:00:00.000Z',
      status: EEventStatus.OnHold,
    }, { globalHandler: false });
  });

  test('updateEvent is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    await service.updateEvent(event);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${event.id}/edit`, expect.anything(), { globalHandler: false });
  });

  test('updateEvent converts the event entity to the correct payload', async () => {
    const event = new Event(mockEventsSearchData()[0]);

    await service.updateEvent(event);

    expect(http.patch).toHaveBeenCalledWith(`/event/events/${event.id}/edit`, {
      assistanceNumber: '+15144544545',
      dateReported: '2021-01-01T00:00:00.000Z',
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
      eventType: {
        optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
        specifiedOther: '',
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
      relatedEventIds: ['87776243-696f-426b-b961-31ee98e3a4cd'],
      responseLevel: 3,
      scheduledCloseDate: '2021-06-15T00:00:00.000Z',
      scheduledOpenDate: '2021-03-15T00:00:00.000Z',
      reOpenReason: '',
      status: EEventStatus.OnHold,
    }, { globalHandler: false });
  });

  test('searchEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchEvents(params);
    expect(http.get).toHaveBeenCalledWith('/search/event-projections', { params, isOData: true });
  });
});
