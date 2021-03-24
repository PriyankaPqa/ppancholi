import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';
import { Event } from './event';
import { mockEventsSearchData } from './event.mock';

const mockEventData = mockEventsSearchData()[0];

describe('>>> User', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const event = new Event(mockEventData);
      expect(event.id).toBe('7c076603-580a-4400-bef2-5ddececb0931');
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

    it('should instantiate scheduleEventOpenDate', () => {
      const event = new Event(mockEventData);
      expect(event.scheduleEventOpenDate).toEqual(new Date('2021-03-15T00:00:00Z'));
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
        status: 1,
        scheduledOpenDate: new Date('2021-03-15T00:00:00Z'),
        scheduledCloseDate: new Date('2021-06-15T00:00:00Z'),
        openDate: null,
        closeDate: null,
        closeReason: null,
        hasBeenOpen: false,
        reOpenReason: '',
      });
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
