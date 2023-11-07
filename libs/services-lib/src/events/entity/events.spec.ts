import {
  EEventStatus,
  EventEntity,
  mockEventEntities,
} from '@libs/entities-lib/event';
import { ISearchData } from '@libs/shared-lib/types';
import helpers from '@libs/shared-lib/helpers/helpers';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { EventsService } from './events';

export const mockSearchParams: ISearchData = {
  filter: 'foo',
};

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
    expect(http.post).toHaveBeenCalledWith(service.baseUrl, expect.anything(), { globalHandler: GlobalHandler.Partial });
  });

  test('createEvent converts the event entity to the correct payload', async () => {
    const relatedEvent = new EventEntity(mockEventEntities()[1]);
    const event = new EventEntity(mockEventEntities()[0]);
    event.authenticationTier1disabled = false;
    event.authenticationTier2disabled = true;

    await service.createEvent(event);
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
      relatedEventIds: [relatedEvent.id],
      responseLevel: 3,
      scheduledCloseDate: '2021-05-15T15:00:00.000Z',
      scheduledOpenDate: '2021-03-01T00:00:00.000Z',
      status: EEventStatus.OnHold,
      authenticationTier1disabled: false,
      authenticationTier2disabled: true,
    }, { globalHandler: GlobalHandler.Partial });
  });

  test('updateEvent is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    await service.updateEvent(event);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${event.id}`, expect.anything(), { globalHandler: GlobalHandler.Partial });
  });

  test('updateEvent converts the event entity to the correct payload', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    event.authenticationTier1disabled = false;
    event.authenticationTier2disabled = true;
    const relatedEvent = new EventEntity(mockEventEntities()[1]);

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
      relatedEventIds: [relatedEvent.id],
      responseLevel: 3,
      scheduledCloseDate: '2021-05-15T15:00:00.000Z',
      scheduledOpenDate: '2021-03-01T00:00:00.000Z',
      reOpenReason: 'For reasons',
      status: EEventStatus.OnHold,
      selfRegistrationEnabled: false,
      assessmentsForL0usersEnabled: false,
      registrationsForL0usersEnabled: false,
      authenticationTier1disabled: false,
      authenticationTier2disabled: true,
    }, { globalHandler: GlobalHandler.Partial });
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

  test('searchMyEventsById calls the helper callSearchInInBatches with the right params and return the right object', async () => {
    const ids = ['id-1', 'id-2'];
    helpers.callSearchInInBatches = jest.fn(); await service.searchMyEventsById(ids);
    expect(helpers.callSearchInInBatches).toHaveBeenCalledWith({
      searchInFilter: 'search.in(Entity/Id, \'{ids}\')',
      service,
      ids,
      api: 'searchMyEvents',
    });
  });

  test('searchMyRegistrationEvents is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchMyRegistrationEvents(params);
    expect(http.get).toHaveBeenCalledWith('event/search/events-open-for-registration', { params, isOData: true });
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
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/call-centres`, callCentre, { globalHandler: GlobalHandler.Partial });
  });

  test('editCallCentre is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const callCentre = event.callCentres[0];
    const { id } = event;
    await service.editCallCentre(id, callCentre);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/call-centres/${callCentre.id}`, callCentre, { globalHandler: GlobalHandler.Partial });
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
    }, { globalHandler: GlobalHandler.Partial });
  });

  test('editAgreement calls the correct URL with the right payload ', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const agreement = event.agreements[0];
    const { id } = event;
    await service.editAgreement(id, agreement);
    expect(http.patch).toHaveBeenCalledWith(
      `${service.baseUrl}/${id}/agreement/${agreement.id}`,
      {
        name: agreement.name,
        details: agreement.details,
        startDate: new Date(agreement.startDate).toISOString(),
        endDate: null,
        agreementType: {
          optionItemId: agreement.agreementType.optionItemId,
          specifiedOther: agreement.agreementType.specifiedOther,
        },
      },
      { globalHandler: GlobalHandler.Partial },
    );
  });

  test('removeAgreement calls the correct URL with the right payload', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const agreementId = event.agreements[0].id;
    const { id } = event;
    await service.removeAgreement(id, agreementId);
    expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${id}/agreement/${agreementId}`);
  });

  test('updateExceptionalAuthenticationType calls the correct URL with the right payload ', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const exceptionalAuthenticationType = event.exceptionalAuthenticationTypes;
    const { id } = event;
    await service.updateExceptionalAuthenticationType(id, exceptionalAuthenticationType);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/exceptionalAuthenticationTypes`, exceptionalAuthenticationType);
  });

  test('editEventConsent calls the correct URL with the right payload ', async () => {
    await service.editEventConsent('eventid', 'consentid');
    expect(http.patch).toHaveBeenCalledWith(
      `${service.baseUrl}/eventid/consent-statement`,
      {
        consentStatementId: 'consentid',
      },
      { globalHandler: GlobalHandler.Partial },
    );
  });

  test('addRegistrationLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.addRegistrationLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-location`, location, { globalHandler: GlobalHandler.Partial });
  });

  test('editRegistrationLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.registrationLocations[0];
    const { id } = event;
    await service.editRegistrationLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-location/${location.id}`, location, { globalHandler: GlobalHandler.Partial });
  });

  test('addRegistrationAssessment is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const assessment = event.registrationAssessments[0];
    const { id } = event;
    await service.addRegistrationAssessment(id, assessment);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-assessment`, assessment);
  });

  test('editRegistrationLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const assessment = event.registrationAssessments[0];
    const { id } = event;
    await service.editRegistrationAssessment(id, assessment);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-assessment/${assessment.id}`, assessment);
  });

  test('removeAgreement calls the correct URL with the right payload', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const assessment = event.registrationAssessments[0];
    const { id } = event;
    await service.removeRegistrationAssessment(id, assessment.id);
    expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/${id}/registration-assessment/${assessment.id}`);
  });

  test('addShelterLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.addShelterLocation(id, location);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${id}/shelter-location`, location, { globalHandler: GlobalHandler.Partial });
  });

  test('editShelterLocation is linked to the correct URL', async () => {
    const event = new EventEntity(mockEventEntities()[0]);
    const location = event.shelterLocations[0];
    const { id } = event;
    await service.editShelterLocation(id, location);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/shelter-location/${location.id}`, location, { globalHandler: GlobalHandler.Partial });
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

  test('toggleAssessmentsForL0Users is linked to the correct url', async () => {
    await service.toggleAssessmentsForL0Users('ID', false);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/ID/assessments-for-l0-users-enabled`, { assessmentsForL0UsersEnabled: false });
  });

  test('toggleRegistrationForL0Users is linked to the correct url', async () => {
    await service.toggleRegistrationForL0Users('ID', false);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/ID/registrations-for-l0-users-enabled`, { registrationsForL0UsersEnabled: false });
  });
});
