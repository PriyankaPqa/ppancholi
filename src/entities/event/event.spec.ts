import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';
import { Event } from './event';
import { mockEventsData } from './event.mock';

const mockEventData = mockEventsData()[0];

describe('>>> User', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const event = new Event(mockEventData);
      expect(event.id).toBe('7c076603-580a-4400-bef2-5ddececb0931');
    });

    it('should instantiate created', () => {
      const event = new Event(mockEventData);
      expect(event.created).toEqual(new Date('2021-01-20T15:12:03.4219037Z'));
    });

    it('should instantiate timestamp', () => {
      const event = new Event(mockEventData);
      expect(event.timestamp).toEqual(new Date('2021-01-20T15:12:03.4230487Z'));
    });

    it('should instantiate name', () => {
      const event = new Event(mockEventData);
      expect(event.name).toEqual({
        value: {
          en: 'Gatineau Floods 2021',
          fr: 'Inondations Gatineau 2021',
        },
      });
    });

    it('should instantiate description', () => {
      const event = new Event(mockEventData);
      expect(event.description).toEqual({
        value: {
          en: 'Desc EN',
          fr: 'Desc FR',
        },
      });
    });

    it('should instantiate registration link', () => {
      const event = new Event(mockEventData);
      expect(event.registrationLink).toEqual({
        value: {
          en: 'https://www.redcross.ca/gatineau-floods-2021',
          fr: 'https://www.redcross.ca/inondations-gatineau-2021',
        },
      });
    });

    it('should instantiate location', () => {
      const event = new Event(mockEventData);
      expect(event.location).toEqual({
        province: 11,
        provinceOthers: {
          value: {},
        },
        region: {
          value: {},
        },
      });
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
      });
    });

    it('should instantiate responseDetails', () => {
      const event = new Event(mockEventData);
      expect(event.responseDetails).toEqual({
        responseLevel: 3,
        eventType: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
        dateReported: new Date('2021-01-01T00:00:00Z'),
        assistanceNumber: '514 454 4545',
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

        event.name = { value: {} };

        expect(event.validate()).toContain('The name is required');

        event.name = { value: { en: '', fr: '' } };

        expect(event.validate()).toContain('The name is required');
      });

      test(`the name field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new Event(mockEventData);

        event.name.value.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The name field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new Event(mockEventData);

        event.description.value.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new Event(mockEventData);

        event.description.value.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test('registrationLink is required', () => {
        const event = new Event(mockEventData);

        event.registrationLink = null;

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { value: {} };

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { value: { en: '', fr: '' } };

        expect(event.validate()).toContain('The registrationLink is required');
      });

      test(`the registration link field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new Event(mockEventData);

        event.registrationLink.value.en = 'x'.repeat(MAX_LENGTH_MD + 1);

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

      test('location provinceOthers is required if province is Other', () => {
        const event = new Event(mockEventData);

        event.location.province = ECanadaProvinces.Other;

        event.location.provinceOthers = null;

        expect(event.validate()).toContain('The location.provinceOthers field is required');
      });

      test(`the provinceOthers field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new Event(mockEventData);

        event.location.province = ECanadaProvinces.Other;

        event.location.provinceOthers.value.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The location.provinceOthers field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the region field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new Event(mockEventData);

        event.location.region.value.en = 'x'.repeat(MAX_LENGTH_MD + 1);

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
