import {
  Event, EEventStatus, mockEventsSearchData, IEventAgreementInfos, IEventCallCentre, IEventGenericLocation,
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
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/call-centres`, expect.anything());
  });

  test('editCallCentre is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const callCentre1 = event.callCentres[0];
    const callCentre2 = { ...event.callCentres[0], startDate: null } as IEventCallCentre;
    const { id } = event;
    await service.editCallCentre(id, { originalCallCentre: callCentre1, updatedCallCentre: callCentre2 });
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/call-centres/edit`, expect.anything());
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
    });
  });

  test('editAgreement is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const agreement1 = event.agreements[0];
    const agreement2 = {
      ...event.agreements[0],
      startDate: null,
      agreementType: {
        optionItemId: '2',
        specifiedOther: '',
      },
    } as IEventAgreementInfos;
    const { id } = event;
    await service.editAgreement(id, { originalAgreement: agreement1, updatedAgreement: agreement2 });
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/agreement/edit`, {
      originalAgreement: {
        name: agreement1.name,
        details: agreement1.details,
        startDate: new Date(agreement1.startDate).toISOString(),
        endDate: null,
        agreementType: {
          optionItemId: agreement1.agreementType.optionItemId,
          specifiedOther: agreement1.agreementType.specifiedOther,
        },
      },
      updatedAgreement: {
        name: agreement2.name,
        details: agreement2.details,
        startDate: null,
        endDate: null,
        agreementType: {
          optionItemId: agreement2.agreementType.optionItemId,
          specifiedOther: null,
        },
      },
    });
  });

  test('removeAgreement calls the correct URL with the right payload', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.removeAgreement(id, agreement);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/agreement/remove`, {
      name: agreement.name,
      details: agreement.details,
      startDate: new Date(agreement.startDate).toISOString(),
      endDate: null,
      agreementType: {
        optionItemId: agreement.agreementType.optionItemId,
        specifiedOther: agreement.agreementType.specifiedOther,
      },
    });
  });

  test('addRegistrationLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.addRegistrationLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/registration-location`, expect.anything());
  });

  test('editRegistrationLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const originalRegistrationLocation = event.registrationLocations[0];
    const updatedRegistrationLocation = {
      ...originalRegistrationLocation,
      address: {
        city: 'Laval',
      },
    } as IEventGenericLocation;
    const { id } = event;
    await service.editRegistrationLocation(id, { originalRegistrationLocation, updatedRegistrationLocation });
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/registration-location/edit`, expect.anything());
  });

  test('addShelterLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.addShelterLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/shelter-location`, expect.anything());
  });

  test('editShelterLocation is linked to the correct URL', async () => {
    const event = new Event(mockEventsSearchData()[0]);
    const originalShelterLocation = event.shelterLocations[0];
    const updatedShelterLocation = {
      ...originalShelterLocation,
      address: {
        city: 'Laval',
      },
    } as IEventGenericLocation;
    const { id } = event;
    await service.editShelterLocation(id, { originalShelterLocation, updatedShelterLocation });
    expect(http.post).toHaveBeenCalledWith(`/event/events/${id}/shelter-location/edit`, expect.anything());
  });
});
