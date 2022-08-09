import { ECanadaProvinces } from '@libs/shared-lib/types';
import { MAX_LENGTH_LG, MAX_LENGTH_MD, MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { EventEntity } from './event';
import { mockEventEntity } from './event.mock';
import { EEventCallCentreStatus, EEventStatus, IEventEntity } from './event.types';

const mockEvent:IEventEntity = mockEventEntity();

describe('>>> EventEntity', () => {
  describe('>> constructor', () => {
    it('should instantiate name', () => {
      const event = new EventEntity(mockEvent);
      expect(event.name).toEqual(mockEvent.name);
    });

    it('should instantiate call centres', () => {
      const event = new EventEntity(mockEvent);
      expect(event.callCentres).toEqual([
        {
          id: 'call-centre-1',
          name: {
            translation: {
              en: 'z call center 1',
              fr: 'call center 1 fr',
            },
          },
          startDate: new Date('2021-03-01T00:00:00.000Z'),
          endDate: null,
          status: EEventCallCentreStatus.Active,
          details: {
            translation: {
              en: 'call center 1 details',
              fr: 'call center 1  details fr',
            },
          },
        },
        {
          id: 'call-centre-2',
          name: {
            translation: {
              en: 'call center 2',
              fr: 'call center 2 fr',
            },
          },
          startDate: new Date('2021-03-01T00:00:00.000Z'),
          endDate: null,
          status: EEventCallCentreStatus.Active,
          details: {
            translation: {
              en: 'call center 1 details',
              fr: 'call center 1  details fr',
            },
          },
        },
      ]);
    });

    it('should instantiate agreements', () => {
      const event = new EventEntity(mockEvent);
      expect(event.agreements).toEqual(
        [{
          id: 'agreement-id-1',
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
          details: {
            translation: {
              en: 'agreement 1 details',
              fr: 'agreement 1  details fr',
            },
          },
        },
        ],
      );
    });

    it('should instantiate registration locations', () => {
      const event = new EventEntity(mockEvent);
      expect(event.registrationLocations).toEqual(mockEvent.registrationLocations);
    });

    it('should instantiate shelter locations', () => {
      const event = new EventEntity(mockEvent);
      expect(event.shelterLocations).toEqual(mockEvent.shelterLocations);
    });

    it('should instantiate description', () => {
      const event = new EventEntity(mockEvent);
      expect(event.description).toEqual(mockEvent.description);
    });

    it('should instantiate eventStatus', () => {
      const event = new EventEntity(mockEvent);
      expect(event.eventStatus).toEqual(mockEvent.eventStatus);
    });

    it('should instantiate location', () => {
      const event = new EventEntity(mockEvent);
      expect(event.location).toEqual(mockEvent.location);
    });

    it('should instantiate registration link', () => {
      const event = new EventEntity(mockEvent);
      expect(event.registrationLink).toEqual(mockEvent.registrationLink);
    });

    it('should instantiate selfRegistrationEnabled', () => {
      const event = new EventEntity(mockEvent);
      expect(event.selfRegistrationEnabled).toEqual(mockEvent.selfRegistrationEnabled);
    });

    it('should instantiate schedule', () => {
      const event = new EventEntity(mockEvent);
      expect(event.schedule).toEqual({
        status: EEventStatus.OnHold,
        scheduledOpenDate: new Date('2021-03-01T00:00:00Z'),
        scheduledCloseDate: new Date('2021-05-15T15:00:00Z'),
        openDate: new Date('2021-03-31T15:23:00.755Z'),
        closeDate: new Date('2021-03-31T15:23:09.367Z'),
        updateReason: 'For reasons',
        timestamp: new Date('2021-03-31T15:23:16.069Z'),
      });
    });

    it('should instantiate scheduleHistory', () => {
      const event = new EventEntity(mockEvent);
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
      const event = new EventEntity(mockEvent);
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

    it('should instantiate relatedEventIds', () => {
      const event = new EventEntity(mockEvent);
      expect(event.relatedEventIds).toEqual(mockEvent.relatedEventIds);
    });
  });

  describe('>> computed getters', () => {
    describe('hasBeenOpen', () => {
      it('returns true if at least one item in scheduleHistory has Open status', () => {
        const event = new EventEntity(mockEvent);

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
        const event = new EventEntity(mockEvent);

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
      const event = new EventEntity(mockEvent);

      expect(event.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('name is required', () => {
        const event = new EventEntity(mockEvent);

        event.name = null;

        expect(event.validate()).toContain('The name is required');

        event.name = { translation: {} };

        expect(event.validate()).toContain('The name is required');

        event.name = { translation: { en: '', fr: '' } };

        expect(event.validate()).toContain('The name is required');
      });

      test(`the name field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new EventEntity(mockEvent);

        event.name.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The name field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new EventEntity(mockEvent);

        event.description.translation.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test(`the description field has a max of ${MAX_LENGTH_LG} characters`, () => {
        const event = new EventEntity(mockEvent);

        event.description.translation.en = 'x'.repeat(MAX_LENGTH_LG + 1);

        expect(event.validate()).toContain(`The description field exceeds max length of ${MAX_LENGTH_LG}`);
      });

      test('registrationLink is required', () => {
        const event = new EventEntity(mockEvent);

        event.registrationLink = null;

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { translation: {} };

        expect(event.validate()).toContain('The registrationLink is required');

        event.registrationLink = { translation: { en: '', fr: '' } };

        expect(event.validate()).toContain('The registrationLink is required');
      });

      test(`the registration link field has a max of ${MAX_LENGTH_MD} characters`, () => {
        const event = new EventEntity(mockEvent);

        event.registrationLink.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The registrationLink field exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('> validation location', () => {
      test('location is required', () => {
        const event = new EventEntity(mockEvent);

        event.location = null;

        expect(event.validate()).toContain('The location field is required');
      });

      test('location province is required', () => {
        const event = new EventEntity(mockEvent);

        event.location.province = null;

        expect(event.validate()).toContain('The location.province field is required');
      });

      test('location provinceOther is required if province is Other', () => {
        const event = new EventEntity(mockEvent);

        event.location.province = ECanadaProvinces.OT;

        event.location.provinceOther = null;

        expect(event.validate()).toContain('The location.provinceOther field is required');
      });

      test(`the provinceOther field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new EventEntity(mockEvent);

        event.location.province = ECanadaProvinces.OT;

        event.location.provinceOther.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The location.provinceOther field exceeds max length of ${MAX_LENGTH_MD}`);
      });

      test(`the region field has a max length of ${MAX_LENGTH_MD}`, () => {
        const event = new EventEntity(mockEvent);

        event.location.region.translation.en = 'x'.repeat(MAX_LENGTH_MD + 1);

        expect(event.validate()).toContain(`The location.region field exceeds max length of ${MAX_LENGTH_MD}`);
      });
    });

    describe('> validation schedule', () => {
      test('schedule is required', () => {
        const event = new EventEntity(mockEvent);

        event.schedule = null;

        expect(event.validate()).toContain('The schedule field is required');
      });

      test('event status is required', () => {
        const event = new EventEntity(mockEvent);

        event.schedule.status = null;

        expect(event.validate()).toContain('The schedule.status field is required');
      });
    });

    describe('> validation responseDetails', () => {
      test('responseDetails is required', () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails = null;

        expect(event.validate()).toContain('The responseDetails field is required');
      });

      test('responseLevel is required', () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails.responseLevel = null;

        expect(event.validate()).toContain('The responseDetails.responseLevel field is required');
      });

      test('eventType is required', () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails.eventType = null;

        expect(event.validate()).toContain('The responseDetails.eventType field is required');
      });

      test('dateReported is required', () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails.dateReported = null;

        expect(event.validate()).toContain('The responseDetails.dateReported field is required');
      });

      test('assistance number is required', () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails.assistanceNumber = null;

        expect(event.validate()).toContain('The responseDetails.assistanceNumber field is required');
      });

      test(`assistance number has max length ${MAX_LENGTH_SM}`, () => {
        const event = new EventEntity(mockEvent);

        event.responseDetails.assistanceNumber = 'x'.repeat(MAX_LENGTH_SM + 1);

        expect(event.validate()).toContain(`The responseDetails.assistanceNumber field exceeds max length of ${MAX_LENGTH_SM}`);
      });
    });
  });
});
