import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockEventsData, mockOtherProvinceData, mockRegionData, Event, EResponseLevel, EEventStatus,
} from '@/entities/event';
import {
  mockEventTypeData,
} from '@/entities/eventType';
import helpers from '@/ui/helpers';
import {
  ECanadaProvinces,
} from '@/types';
import moment from '@/ui/plugins/moment';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import Component from '../EventForm.vue';

const event = new Event(mockEventsData()[0]);
event.schedule.scheduledCloseDate = event.schedule.scheduledCloseDate.toString();
event.schedule.scheduledOpenDate = event.schedule.scheduledOpenDate.toString();
event.responseDetails.dateReported = event.responseDetails.dateReported.toString();
event.fillEmptyMultilingualAttributes = jest.fn();

describe('EventForm.vue', () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
        },
        data() {
          return {
            prefixRegistrationLink: 'https://mytest.test/',
          };
        },
      });
    });

    describe('copyRegistrationLink', () => {
      it('calls copyToClipBoard with right parameters', () => {
        helpers.copyToClipBoard = jest.fn();
        wrapper.vm.copyRegistrationLink();
        expect(helpers.copyToClipBoard).toHaveBeenCalledWith('https://mytest.test/gatineau-floods-2021');
      });

      it('displays a toast success toast notification', () => {
        helpers.copyToClipBoard = jest.fn();
        wrapper.vm.copyRegistrationLink();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('eventSummary.copyLinkSuccessful');
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode', () => {
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('calls fillEmptyMultilingualAttributes entity method', () => {
        wrapper.vm.setLanguageMode('fr');
        expect(event.fillEmptyMultilingualAttributes).toHaveBeenCalledTimes(1);
      });
    });

    describe('setAssistanceNumber', () => {
      it('sets assistanceNumber with the phone object', () => {
        const phoneObject = { number: '12345', countryISO2: 'fr', e164Number: '12345' };
        wrapper.vm.setAssistanceNumber(phoneObject);
        expect(wrapper.vm.assistanceNumber).toEqual(phoneObject);
      });

      it('sets the assistanceNumber of the localEvent to the e164Number', () => {
        const phoneObject = { number: '12345', countryISO2: 'fr', e164Number: '12345' };
        wrapper.vm.setAssistanceNumber(phoneObject);
        expect(wrapper.vm.localEvent.responseDetails.assistanceNumber).toEqual(phoneObject.e164Number);
      });
    });

    describe('clearRegionAndOtherProvince', () => {
      it('clears the provinceOther and region fields', () => {
        wrapper.vm.localEvent.location.provinceOther = { translation: { en: 'en', fr: 'fr' } };
        wrapper.vm.localEvent.location.region = { translation: { en: 'en', fr: 'fr' } };
        wrapper.vm.clearRegionAndOtherProvince();

        expect(wrapper.vm.localEvent.location.provinceOther).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });

        expect(wrapper.vm.localEvent.location.region).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
        },
        data() {
          return {
            prefixRegistrationLink: 'https://mytest.test/',
          };
        },
      });
    });

    describe('isStatusOpen', () => {
      it('returns true if the status is open, false otherwise', () => {
        wrapper.vm.localEvent.schedule.status = EEventStatus.Open;
        expect(wrapper.vm.isStatusOpen).toBeTruthy();

        wrapper.vm.localEvent.schedule.status = EEventStatus.OnHold;
        expect(wrapper.vm.isStatusOpen).toBeFalsy();
      });

      it('set the status of the event to open if true, onHold otherwise', () => {
        wrapper.vm.localEvent.schedule.status = null;
        wrapper.vm.isStatusOpen = true;
        expect(wrapper.vm.localEvent.schedule.status).toEqual(EEventStatus.Open);

        wrapper.vm.isStatusOpen = false;
        expect(wrapper.vm.localEvent.schedule.status).toEqual(EEventStatus.OnHold);
      });

      it('set scheduledOpenDate to today if true, null otherwise', () => {
        wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
        wrapper.vm.isStatusOpen = true;
        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toEqual(wrapper.vm.today);

        wrapper.vm.isStatusOpen = false;
        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toEqual(null);
      });

      it('set scheduledCloseDate to null if false', () => {
        wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-01-02';
        wrapper.vm.isStatusOpen = true;
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toEqual('2020-01-02');

        wrapper.vm.isStatusOpen = false;
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toEqual(null);
      });
    });

    describe('otherProvinceSelected', () => {
      it('returns true if other province has been selected, false otherwise', () => {
        wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
        expect(wrapper.vm.otherProvinceSelected).toBeTruthy();
        wrapper.vm.localEvent.location.province = ECanadaProvinces.AB;
        expect(wrapper.vm.otherProvinceSelected).toBeFalsy();
      });
    });

    describe('provinceOther', () => {
      it('returns the correct value', () => {
        wrapper.vm.localEvent.location.provinceOther = { translation: { en: 'TEST EN', fr: 'TEST FR' } };
        expect(wrapper.vm.provinceOther).toEqual('TEST EN');
        wrapper.vm.languageMode = 'fr';
        expect(wrapper.vm.provinceOther).toEqual('TEST FR');
      });
    });

    describe('otherProvincesSorted', () => {
      it('returns the otherProvinces in alphabetical order', async () => {
        await flushPromises();

        const otherProvinces = mockOtherProvinceData();
        expect(wrapper.vm.otherProvincesSorted).toEqual([
          otherProvinces[1], // California
          otherProvinces[0], // New York
        ]);
      });
    });

    describe('region', () => {
      it('returns the correct value', () => {
        wrapper.vm.localEvent.location.region = { translation: { en: 'TEST EN', fr: 'TEST FR' } };
        expect(wrapper.vm.region).toEqual('TEST EN');
        wrapper.vm.languageMode = 'fr';
        expect(wrapper.vm.region).toEqual('TEST FR');
      });
    });

    describe('regionsSorted', () => {
      it('returns the regions in alphabetical order for the selected province', async () => {
        await flushPromises();

        wrapper.vm.localEvent.location.province = ECanadaProvinces.BC;
        expect(wrapper.vm.regionsSorted).toEqual([]);

        wrapper.vm.localEvent.location.province = ECanadaProvinces.AB;
        const regions = mockRegionData();
        expect(wrapper.vm.regionsSorted).toEqual([
          regions[1], // Northern Alberta
          regions[0], // Southern Alberta
        ]);
      });
    });

    describe('responseLevels', () => {
      it('returns the proper data', () => {
        expect(wrapper.vm.responseLevels).toEqual(helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level'));
      });
    });

    describe('eventTypesSorted', () => {
      it('returns the event types from the store', async () => {
        await flushPromises();
        expect(wrapper.vm.eventTypesSorted).toEqual(wrapper.vm.$storage.event.getters.eventTypes());
      });
    });

    describe('relatedEventsSorted', () => {
      it('returns the events from the store', async () => {
        await flushPromises();
        expect(wrapper.vm.relatedEventsSorted).toEqual(wrapper.vm.$storage.event.getters.events());
      });
    });

    describe('canadianProvinces', () => {
      it('returns the proper data', () => {
        const provinces = helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
        const index = provinces.findIndex((e) => e.value === ECanadaProvinces.OT);
        expect(wrapper.vm.canadianProvinces).toEqual([
          ...provinces.slice(0, index),
          ...provinces.slice(index + 1),
          provinces[index],
        ]);
      });
    });

    describe('responseLevels', () => {
      it('returns the proper data', () => {
        expect(wrapper.vm.responseLevels).toEqual(helpers.enumToTranslatedCollection(EResponseLevel, 'event.response_level'));
      });
    });

    describe('scheduledCloseDateRule', () => {
      it('returns the rule mustBeAfterOrSame if scheduledOpenDate and scheduledCloseDate are defined', () => {
        const rule = {
          mustBeAfterOrSame: { X: wrapper.vm.localEvent.schedule.scheduledCloseDate, Y: wrapper.vm.localEvent.schedule.scheduledOpenDate },
        };
        expect(wrapper.vm.scheduledCloseDateRule).toEqual(rule);
      });

      it('returns null if scheduledOpenDate or scheduledCloseDate are not defined', () => {
        wrapper.vm.localEvent.schedule.scheduledCloseDate = null;
        expect(wrapper.vm.scheduledCloseDateRule).toEqual(null);

        wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-12-01';
        wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
        expect(wrapper.vm.scheduledCloseDateRule).toEqual(null);
      });
    });

    describe('scheduledOpenDateRule', () => {
      it('returns the rule mustBeBeforeOrSame if scheduledOpenDate and scheduledCloseDate are defined', () => {
        const rule = {
          mustBeBeforeOrSame: { X: wrapper.vm.localEvent.schedule.scheduledOpenDate, Y: wrapper.vm.localEvent.schedule.scheduledCloseDate },
        };
        expect(wrapper.vm.scheduledOpenDateRule).toEqual(rule);
      });

      it('returns null if scheduledOpenDate or scheduledCloseDate are not defined', () => {
        wrapper.vm.localEvent.schedule.scheduledCloseDate = null;
        expect(wrapper.vm.scheduledOpenDateRule).toEqual(null);

        wrapper.vm.localEvent.schedule.scheduledCloseDate = '2020-12-01';
        wrapper.vm.localEvent.schedule.scheduledOpenDate = null;
        expect(wrapper.vm.scheduledOpenDateRule).toEqual(null);
      });
    });

    describe('statusColor', () => {
      it('returns proper color for editMode', () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
          },
          data() {
            return {
              prefixRegistrationLink: 'https://mytest.test/',
            };
          },
        });

        expect(wrapper.vm.statusColor).toEqual('grey darken-2 white--text');
      });

      it('returns proper color for status is open', () => {
        wrapper.vm.isStatusOpen = true;
        expect(wrapper.vm.statusColor).toEqual('status_success white--text');
      });

      it('returns proper color for other case', () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.isStatusOpen = false;
        expect(wrapper.vm.statusColor).toEqual('status_green_pale black--text');
      });
    });

    describe('registrationLink', () => {
      it('return the registration link as the name applying lowercase and replace space by -', () => {
        wrapper.vm.localEvent.name.translation.en = 'THIS IS A TEST EVENT';
        expect(wrapper.vm.registrationLink).toBe('this-is-a-test-event');
      });
    });

    describe('today', () => {
      it('returns the date of today', () => {
        const today = moment(new Date()).format('YYYY-MM-DD');
        expect(wrapper.vm.today).toEqual(today);
      });
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
        },
        data() {
          return {
            prefixRegistrationLink: 'https://mytest.test/',
          };
        },
      });
    });

    describe('Event handlers', () => {
      test('Input on assistance number calls setAssistanceNumber', async () => {
        jest.spyOn(wrapper.vm, 'setAssistanceNumber').mockImplementation(() => {});

        const input = wrapper.findDataTest('event-phone').find('input');
        await input.setValue('1234567890');

        expect(wrapper.vm.setAssistanceNumber).toHaveBeenCalledWith({
          countryISO2: 'CA',
          e164Number: '+11234567890',
          number: '1234567890',
        });
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event: new Event(),
          isEditMode: false,
        },
        data() {
          return {
            languageMode: 'en',
            prefixRegistrationLink: 'https://mytest.test/',
            assistanceNumber: {},
          };
        },
      });
    });

    test('event name is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event name max is MAX_LENGTH_MD', async () => {
      wrapper.vm.localEvent.name.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event response level is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('event-level');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event province is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('event-province');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event province is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('event-province');
      expect(el.classes('invalid')).toBe(true);
    });

    test('provinceOther is required when displayed', async () => {
      wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.find('span[data-test="event-province-other"]').find('div');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event provinceOther max is MAX_LENGTH_MD', async () => {
      wrapper.vm.localEvent.location.province = ECanadaProvinces.OT;
      wrapper.vm.localEvent.location.provinceOther.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.find('span[data-test="event-province-other"]').find('div');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event region is not required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-region');
      expect(el.classes('invalid')).toBe(false);
    });

    test('eventType is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('event-type');
      expect(el.classes('invalid')).toBe(true);
    });

    test('eventType specify is required', async () => {
      await wrapper.setData({
        eventType: mockEventTypeData()[0],
      });

      expect(wrapper.findDataTest('event-type-specified-other').exists()).toBe(true);

      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-type-specified-other');
      expect(el.classes('invalid')).toBe(true);
    });

    test('assistanceNumber is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findDataTest('event-phone');
      expect(el.classes('error--text')).toBe(true);
    });

    test('description max is MAX_LENGTH_LG', async () => {
      wrapper.vm.localEvent.description.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_LG + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-description');
      expect(el.classes('invalid')).toBe(true);
    });
  });
});
