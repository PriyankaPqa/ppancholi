import { Event, EEventStatus, mockEventsSearchData } from '@/entities/event';
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
        specifiedOther: null,
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
      scheduledCloseDate: null,
      scheduledOpenDate: null,
      status: EEventStatus.OnHold,
    }, { globalHandler: false });
  });

  test('updateEvent is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    await service.updateEvent(event);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${event.id}`, expect.anything(), { globalHandler: false });
  });

  test('updateEvent converts the event entity to the correct payload', async () => {
    const event = new Event(mockEventsSearchData()[0]);

    await service.updateEvent(event);

    expect(http.patch).toHaveBeenCalledWith(`/event/events/${event.id}`, {
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
        specifiedOther: null,
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
      scheduledCloseDate: null,
      scheduledOpenDate: null,
      reOpenReason: null,
      status: EEventStatus.OnHold,
      selfRegistrationEnabled: false,
    }, { globalHandler: false });
  });

  test('toggleSelfRegistration is linked to the correct url', async () => {
    await service.toggleSelfRegistration('ID', false);
    expect(http.patch).toHaveBeenCalledWith('/event/events/ID/self-registration-enabled', { selfRegistrationEnabled: false });
  });

  test('searchEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchEvents(params);
    expect(http.get).toHaveBeenCalledWith('/search/event-projections', { params, isOData: true });
  });

  test('searchMyEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchMyEvents(params);
    expect(http.get).toHaveBeenCalledWith('/search/event-projections-main-information', { params, isOData: true });
  });

  describe('setEventStatus', () => {
    it('calls the open endpoint if the status is open and hasBeenOpen is false', async () => {
      await service.setEventStatus('ID', EEventStatus.Open, false);
      expect(http.post).toHaveBeenCalledWith('event/events/ID/open', {});
    });

    it('calls the re-open endpoint if the status is open and hasBeenOpen is true', async () => {
      await service.setEventStatus('ID', EEventStatus.Open, true, 'reason');
      expect(http.post).toHaveBeenCalledWith('event/events/ID/re-open', {
        reOpenReason: 'reason',
      });
    });

    it('calls the close endpoint if the status is closed', async () => {
      await service.setEventStatus('ID', EEventStatus.Closed, false, 'reason');
      expect(http.post).toHaveBeenCalledWith('event/events/ID/close', {
        closeReason: 'reason',
      });
    });

    it('calls the place on hold endpoint if the status is OnHold', async () => {
      await service.setEventStatus('ID', EEventStatus.OnHold, false, 'reason');
      expect(http.post).toHaveBeenCalledWith('event/events/ID/place-on-hold', {});
    });

    it('calls the archive endpoint if the status is Archived', async () => {
      await service.setEventStatus('ID', EEventStatus.Archived, false, 'reason');
      expect(http.post).toHaveBeenCalledWith('event/events/ID/archive', {});
    });
  });

  test('addCallCentre is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const callCentre = event.callCentres[0];
    const { id } = event;
    await service.addCallCentre(id, callCentre);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/call-centres`, callCentre, { globalHandler: false });
  });

  test('editCallCentre is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const callCentre = event.callCentres[0];
    const { id } = event;
    await service.editCallCentre(id, callCentre);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${id}/call-centres/${callCentre.id}`, callCentre, { globalHandler: false });
  });

  test('addAgreement calls the correct URL with the right payload ', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.addAgreement(id, agreement);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/agreement`, {
      name: agreement.name,
      details: agreement.details,
      startDate: new Date(agreement.startDate).toISOString(),
      endDate: null,
      agreementType: {
        optionItemId: agreement.agreementType.optionItemId,
        specifiedOther: agreement.agreementType.specifiedOther,
      },
    }, { globalHandler: false });
  });

  test('editAgreement calls the correct URL with the right payload ', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.editAgreement(id, agreement);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${id}/agreement/${agreement.id}`, {
      name: agreement.name,
      details: agreement.details,
      startDate: new Date(agreement.startDate).toISOString(),
      endDate: null,
      agreementType: {
        optionItemId: agreement.agreementType.optionItemId,
        specifiedOther: agreement.agreementType.specifiedOther,
      },
    },
    { globalHandler: false });
  });

  test('removeAgreement calls the correct URL with the right payload', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const agreementId = event.agreements[0].id;
    const { id } = event;
    await service.removeAgreement(id, agreementId);
    expect(http.delete).toHaveBeenCalledWith(`/event/events/${id}/agreement/${agreementId}`);
  });

  test('addRegistrationLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.addRegistrationLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/registration-location`, location, { globalHandler: false });
  });

  test('editRegistrationLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.editRegistrationLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${id}/registration-location/${location.id}`, location, { globalHandler: false });
  });

  test('addShelterLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.addShelterLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/shelter-location`, location, { globalHandler: false });
  });

  test('editShelterLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.editShelterLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`/event/events/${id}/shelter-location/${location.id}`, location, { globalHandler: false });
  });
});
