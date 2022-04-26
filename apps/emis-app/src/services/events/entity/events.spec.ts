import {
  EEventStatus,
  EventEntity,
  mockEventEntities,
} from '@/entities/event';
import { mockSearchParams } from '@/test/helpers';
import { IHttpMock, mockHttp } from '@libs/core-lib/services/http-client';
import { EventsService } from './events';

describe('>>> Events Service', () => {
  let http: IHttpMock;
  let service: EventsService;

  beforeEach(() => {
    http = mockHttp();
    service = new EventsService(http as never);
    jest.clearAllMocks();
  });

  test('createEvent is linked to the correct URL', async () => {
    await service.createEvent(new EventEntity(mockEventEntities()[0]));
    expect(http.post).toHaveBeenCalledWith(service.baseUrl, expect.anything(), { globalHandler: false });
  });

  test('createEvent converts the event entity to the correct payload', async () => {
    await service.createEvent(new EventEntity(mockEventEntities()[0]));
    expect(http.post).toHaveBeenCalledWith(service.baseUrl, {
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
      scheduledCloseDate: '2021-05-15T15:00:00.000Z',
      scheduledOpenDate: '2021-03-01T00:00:00.000Z',
      status: EEventStatus.OnHold,
    }, { globalHandler: false });
  });

  test('updateEvent is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    await service.updateEvent(event);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${event.id}`, expect.anything(), { globalHandler: false });
  });

  test('updateEvent converts the event entity to the correct payload', async () => {
    const event = new EventEntity(mockEventEntities()[0]);

    await service.updateEvent(event);

    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${event.id}`, {
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
      scheduledCloseDate: '2021-05-15T15:00:00.000Z',
      scheduledOpenDate: '2021-03-01T00:00:00.000Z',
      reOpenReason: 'For reasons',
      status: EEventStatus.OnHold,
      selfRegistrationEnabled: false,
    }, { globalHandler: false });
  });

  test('toggleSelfRegistration is linked to the correct url', async () => {
    await service.toggleSelfRegistration('ID', false);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/ID/self-registration-enabled`, { selfRegistrationEnabled: false });
  });

  test('searchMyEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchMyEvents(params);
    expect(http.get).toHaveBeenCalledWith('event/search/events', { params, isOData: true });
  });

  describe('setEventStatus', () => {
    it('calls the open endpoint if the status is open and hasBeenOpen is false', async () => {
      await service.setEventStatus('ID', EEventStatus.Open, false);
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/ID/open`, {});
    });

    it('calls the re-open endpoint if the status is open and hasBeenOpen is true', async () => {
      await service.setEventStatus('ID', EEventStatus.Open, true, 'reason');
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/ID/re-open`, {
        reOpenReason: 'reason',
      });
    });

    it('calls the close endpoint if the status is closed', async () => {
      await service.setEventStatus('ID', EEventStatus.Closed, false, 'reason');
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/ID/close`, {
        closeReason: 'reason',
      });
    });

    it('calls the place on hold endpoint if the status is OnHold', async () => {
      await service.setEventStatus('ID', EEventStatus.OnHold, false, 'reason');
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/ID/place-on-hold`, {});
    });

    it('calls the archive endpoint if the status is Archived', async () => {
      await service.setEventStatus('ID', EEventStatus.Archived, false, 'reason');
      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/ID/archive`, {});
    });
  });

  test('addCallCentre is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const callCentre = event.callCentres[0];
    const { id } = event;
    await service.addCallCentre(id, callCentre);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/call-centres`, callCentre, { globalHandler: false });
  });

  test('editCallCentre is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const callCentre = event.callCentres[0];
    const { id } = event;
    await service.editCallCentre(id, callCentre);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/call-centres/${callCentre.id}`, callCentre, { globalHandler: false });
  });

  test('addAgreement calls the correct URL with the right payload ', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.addAgreement(id, agreement);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/agreement`, {
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
    const event = new EventEntity(mockEventEntities()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.editAgreement(id, agreement);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/agreement/${agreement.id}`, {
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
    const event = new EventEntity(mockEventEntities()[0]);
    const agreementId = event.agreements[0].id;
    const { id } = event;
    await service.removeAgreement(id, agreementId);
    expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${id}/agreement/${agreementId}`);
  });

  test('addRegistrationLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.addRegistrationLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-location`, location, { globalHandler: false });
  });

  test('editRegistrationLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.editRegistrationLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-location/${location.id}`, location, { globalHandler: false });
  });

  test('addShelterLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.addShelterLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/shelter-location`, location, { globalHandler: false });
  });

  test('editShelterLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.editShelterLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/shelter-location/${location.id}`, location, { globalHandler: false });
  });

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`event/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('event/search/events', { params, isOData: true });
    });
  });
});
