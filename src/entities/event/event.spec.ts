import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';
import { Event } from './event';
import { mockEventsSearchData } from './event.mock';
import { EEventCallCentreStatus, EEventStatus } from './event.types';

const mockEventData = mockEventsSearchData()[0];

describe('>>> Event', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const event = new Event(mockEventData);
      expect(event.id).toBe('7c076603-580a-4400-bef2-5ddececb0123');
    });

    it('should instantiate name', () => {
      const event = new Event(mockEventData);
      expect(event.name).toEqual({
        translation: {
          en: 'Gatineau Floods 2021',
          fr: 'Inondations Gatineau 2021',
        },
      });
    });

    it('should instantiate call centres', () => {
      const event = new Event(mockEventData);
      expect(event.callCentres).toEqual([{
        name: {
          translation: {
            en: 'z call center 1',
            fr: 'call center 1 fr',
          },
        },
        startDate: new Date('2021-03-01T00:00:00Z'),
        endDate: null,
        status: EEventCallCentreStatus.Active,
        details: {
          translation: {
            en: 'call center 1 details',
            fr: 'call center 1  details fr',
          },
        },
      }, {
        name: {
          translation: {
            en: 'call center 2',
            fr: 'call center 2 fr',
          },
        },
        startDate: new Date('2021-03-01T00:00:00Z'),
        endDate: null,
        status: EEventCallCentreStatus.Active,
        details: {
          translation: {
            en: 'call center 1 details',
            fr: 'call center 1  details fr',
          },
        },
      }]);
    });

    it('should instantiate agreements', () => {
      const event = new Event(mockEventData);
      expect(event.agreements).toEqual([{
        name: {
          translation: {
            en: 'agreement 1',
            fr: 'agreement 1 fr',
          },
        },
        startDate: new Date('2021-03-01T00:00:00Z'),
        endDate: null,
        agreementType: {
          optionItemId: '1',
          specifiedOther: 'abc',
        },
        agreementTypeName: {
          translation: {
            en: 'agreement type 1',
            fr: 'agreement type 1 fr',
          },
        },
        details: {
          translation: {
            en: 'agreement 1 details',
            fr: 'agreement 1  details fr',
          },
        },
      }]);
    });

    it('should instantiate registration locations', () => {
      const event = new Event(mockEventData);
      expect(event.registrationLocations).toEqual([{
        status: 2,
        name: {
          translation: {
            en: 'test en',
            fr: 'test fr',
          },
        },
        address: {
          country: 'CA',
          streetAddress: 'test address',
          unitSuite: null,
          province: 2,
          city: 'test',
          postalCode: 'h2k2k2',
        },
      }, {
        name: {
          translation: {
            en: 'registration test',
            fr: 'registration test',
          },
        },
        status: 1,
        address: {
          country: 'CA',
          streetAddress: '5150 Yonge Street',
          unitSuite: null,
          province: 9,
          city: 'Toronto',
          postalCode: 'M2N 6L7',
        },
      }]);
    });

    it('should instantiate shelter locations', () => {
      const event = new Event(mockEventData);
      expect(event.shelterLocations).toEqual([
        {
          id: 'shelter-id-1',
          name: {
            translation: {
              en: 'shelter en',
              fr: 'shelter fr rt',
            },
          },
          status: 2,
          address: {
            country: 'CA',
            streetAddress: '2295 Rue Bercy',
            unitSuite: null,
            province: 11,
            city: 'Montréal',
            postalCode: 'H2K 2V6',
          },
        },
        {
          id: 'shelter-id-2',
          name: {
            translation: {
              en: 'shelter 1 en',
              fr: 'shelter 1 fr',
            },
          },
          status: 1,
          address: {
            country: 'CA',
            streetAddress: '5157 Avenue de Courtrai',
            unitSuite: null,
            province: 11,
            city: 'Montréal',
            postalCode: 'H3W 0A9',
          },
        },
      ]);
    });

    it('should instantiate description', () => {
      const event = new Event(mockEventData);
      expect(event.description).toEqual({
        translation: {
          en: 'Desc EN',
          fr: 'Desc FR',
        },
      });
    });

    it('should instantiate eventStatus', () => {
      const event = new Event(mockEventData);
      expect(event.eventStatus).toEqual(1);
    });

    it('should instantiate eventTypeId', () => {
      const event = new Event(mockEventData);
      expect(event.eventTypeId).toEqual('41c362cc-3bed-4707-97e3-732ef3a2ebbf');
    });

    it('should instantiate eventTypeName', () => {
      const event = new Event(mockEventData);
      expect(event.eventTypeName).toEqual({
        translation: {
          en: 'Flood',
          fr: 'Inondation',
        },
      });
    });

    it('should instantiate created', () => {
      const event = new Event(mockEventData);
      expect(event.created).toEqual(new Date('2021-01-20T15:12:03.4219037Z'));
    });

    it('should instantiate location', () => {
      const event = new Event(mockEventData);
      expect(event.location).toEqual({
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
      });
    });

    it('should instantiate provinceName', () => {
      const event = new Event(mockEventData);
      expect(event.provinceName).toEqual({
        translation: {
          en: 'Alberta',
          fr: 'Alberta FR',
        },
      });
    });

    it('should instantiate relatedEventsInfos', () => {
      const event = new Event(mockEventData);
      expect(event.relatedEventsInfos).toEqual([{
        id: '87776243-696f-426b-b961-31ee98e3a4cd',
        eventName: {
          translation: {
            en: 'Vegas Earthquake 2021',
            fr: 'Vegas Earthquake 2021 FR',
          },
        },
      }]);
    });

    it('should instantiate registration link', () => {
      const event = new Event(mockEventData);
      expect(event.registrationLink).toEqual({
        translation: {
          en: 'https://www.redcross.ca/gatineau-floods-2021',
          fr: 'https://www.redcross.ca/inondations-gatineau-2021',
        },
      });
    });

    it('should instantiate responseLevelName', () => {
      const event = new Event(mockEventData);
      expect(event.responseLevelName).toEqual({
        translation: {
          en: 'Level1',
          fr: 'Niveau1',
        },
      });
    });

    it('should instantiate selfRegistrationEnabled', () => {
      const event = new Event(mockEventData);
      expect(event.selfRegistrationEnabled).toEqual(false);
    });

    it('should instantiate scheduleEventStatusName', () => {
      const event = new Event(mockEventData);
      expect(event.scheduleEventStatusName).toEqual({
        translation: {
          en: 'On hold',
          fr: 'En attente',
        },
      });
    });

    it('should instantiate tenantId', () => {
      const event = new Event(mockEventData);
      expect(event.tenantId).toEqual('7c076603-580a-4400-bef2-5ddececb0931');
    });

    it('should instantiate schedule', () => {
      const event = new Event(mockEventData);
      expect(event.schedule).toEqual({
        status: EEventStatus.OnHold,
        scheduledOpenDate: new Date('2021-03-01T00:00:00.000Z'),
        scheduledCloseDate: new Date('2021-05-15T15:00:00.000Z'),
        openDate: new Date('2021-03-31T15:23:00.755Z'),
        closeDate: new Date('2021-03-31T15:23:09.367Z'),
        updateReason: null,
        timestamp: new Date('2021-03-31T15:23:16.069Z'),
      });
    });

    it('should instantiate scheduleHistory', () => {
      const event = new Event(mockEventData);
      expect(event.scheduleHistory).toEqual([
        {
          status: EEventStatus.Open,
          scheduledOpenDate: new Date('2021-03-31T00:00:00Z'),
          scheduledCloseDate: new Date('2021-05-31T00:00:00Z'),
          openDate: new Date('2021-03-31T15:23:00.755Z'),
          closeDate: null,
          updateReason: null,
          timestamp: new Date('2021-03-31T15:23:00.755Z'),
        },
        {
          status: EEventStatus.Closed,
          scheduledOpenDate: new Date('2021-03-31T00:00:00Z'),
          scheduledCloseDate: new Date('2021-05-31T00:00:00Z'),
          openDate: new Date('2021-03-31T15:23:00.755Z'),
          closeDate: new Date('2021-03-31T15:23:09.367Z'),
          updateReason: 'Close Reason',
          timestamp: new Date('2021-03-31T15:23:09.367Z'),
        },
        {
          status: EEventStatus.Archived,
          scheduledOpenDate: new Date('2021-03-31T00:00:00Z'),
          scheduledCloseDate: new Date('2021-05-31T00:00:00Z'),
          openDate: new Date('2021-03-31T15:23:00.755Z'),
          closeDate: new Date('2021-03-31T15:23:09.367Z'),
          updateReason: null,
          timestamp: new Date('2021-03-31T15:23:13.508Z'),
        },
        {
          status: EEventStatus.OnHold,
          scheduledOpenDate: null,
          scheduledCloseDate: null,
          openDate: new Date('2021-03-31T15:23:00.755Z'),
          closeDate: new Date('2021-03-31T15:23:09.367Z'),
          updateReason: null,
          timestamp: new Date('2021-03-31T15:23:16.069Z'),
        },
      ]);
    });

    it('should instantiate responseDetails', () => {
      const event = new Event(mockEventData);
      expect(event.responseDetails).toEqual({
        responseLevel: 3,
        eventType: {
          optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
          specifiedOther: '',
        },
        dateReported: new Date('2021-01-01T00:00:00Z'),
        assistanceNumber: '+15144544545',
      });
    });
  });

  describe('>> computed getters', () => {
    describe('hasBeenOpen', () => {
      it('returns true if at least one item in scheduleHistory has Open status', () => {
        const event = new Event(mockEventData);

        event.scheduleHistory = [{
          status: EEventStatus.Open,
          openDate: '2021-01-01T00:00:00Z',
          closeDate: null,
          scheduledOpenDate: '2021-01-01T00:00:00Z',
          scheduledCloseDate: null,
          timestamp: '2021-01-01T00:00:00Z',
          updateReason: '',
        }, {
          status: EEventStatus.OnHold,
          openDate: '2021-01-01T00:00:00Z',
          closeDate: null,
          scheduledOpenDate: '2021-01-01T00:00:00Z',
          scheduledCloseDate: null,
          timestamp: '2021-01-01T00:00:00Z',
          updateReason: '',
        }];

        expect(event.hasBeenOpen).toBe(true);
      });

      it('returns false if the scheduleHistory does not have any items with Open status', () => {
        const event = new Event(mockEventData);

        event.scheduleHistory = [{
          status: EEventStatus.Closed,
          openDate: '2021-01-01T00:00:00Z',
          closeDate: null,
          scheduledOpenDate: '2021-01-01T00:00:00Z',
          scheduledCloseDate: null,
          timestamp: '2021-01-01T00:00:00Z',
          updateReason: '',
        }, {
          status: EEventStatus.OnHold,
          openDate: '2021-01-01T00:00:00Z',
          closeDate: null,
          scheduledOpenDate: '2021-01-01T00:00:00Z',
          scheduledCloseDate: null,
          timestamp: '2021-01-01T00:00:00Z',
          updateReason: '',
        }];

        expect(event.hasBeenOpen).toBe(false);
      });
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const event = new Event(mockEventData);

      expect(event.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('name is required', () => {
        const event = new Event(mockEventData);

        event.name = null;

        expect(event.validate()).toContain('The name is required');

        event.name = { translation: {} };

        expect(event.validate()).toContain('The name is required');

        event.name = { translation: { en: '', fr: '' } };

        expect(event.validate()).toContain('The name is required');
      });

      test(`the name field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new Event(mockEventData);

        event.name.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The name field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new Event(mockEventData);

        event.description.translation.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new Event(mockEventData);

        event.description.translation.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test('registrationLink is required', () => {
        const event = new Event(mockEventData);

        event.registrationLink = null;

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { translation: {} };

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { translation: { en: '', fr: '' } };

        expect(event.validate()).toContain('The registrationLink is required');
      });

      test(`the registration link field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new Event(mockEventData);

        event.registrationLink.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The registrationLink field exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('> validation location', () => {
      test('location is required', () => {
        const event = new Event(mockEventData);

        event.location = null;

        expect(event.validate()).toContain('The location field is required');
      });

      test('location province is required', () => {
        const event = new Event(mockEventData);

        event.location.province = null;

        expect(event.validate()).toContain('The location.province field is required');
      });

      test('location provinceOther is required if province is Other', () => {
        const event = new Event(mockEventData);

        event.location.province = ECanadaProvinces.OT;

        event.location.provinceOther = null;

        expect(event.validate()).toContain('The location.provinceOther field is required');
      });

      test(`the provinceOther field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new Event(mockEventData);

        event.location.province = ECanadaProvinces.OT;

        event.location.provinceOther.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The location.provinceOther field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the region field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new Event(mockEventData);

        event.location.region.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The location.region field exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('> validation schedule', () => {
      test('schedule is required', () => {
        const event = new Event(mockEventData);

        event.schedule = null;

        expect(event.validate()).toContain('The schedule field is required');
      });

      test('event status is required', () => {
        const event = new Event(mockEventData);

        event.schedule.status = null;

        expect(event.validate()).toContain('The schedule.status field is required');
      });
    });

    describe('> validation responseDetails', () => {
      test('responseDetails is required', () => {
        const event = new Event(mockEventData);

        event.responseDetails = null;

        expect(event.validate()).toContain('The responseDetails field is required');
      });

      test('responseLevel is required', () => {
        const event = new Event(mockEventData);

        event.responseDetails.responseLevel = null;

        expect(event.validate()).toContain('The responseDetails.responseLevel field is required');
      });

      test('eventType is required', () => {
        const event = new Event(mockEventData);

        event.responseDetails.eventType = null;

        expect(event.validate()).toContain('The responseDetails.eventType field is required');
      });

      test('dateReported is required', () => {
        const event = new Event(mockEventData);

        event.responseDetails.dateReported = null;

        expect(event.validate()).toContain('The responseDetails.dateReported field is required');
      });

      test('assistance number is required', () => {
        const event = new Event(mockEventData);

        event.responseDetails.assistanceNumber = null;

        expect(event.validate()).toContain('The responseDetails.assistanceNumber field is required');
      });

      test(`assistance number has max length ${MAX_LENGTH_SM}`, () => {
        const event = new Event(mockEventData);

        event.responseDetails.assistanceNumber = 'x'.repeat(MAX_LENGTH_SM + 1);

        expect(event.validate()).toContain(`The responseDetails.assistanceNumber field exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });
  });
});
