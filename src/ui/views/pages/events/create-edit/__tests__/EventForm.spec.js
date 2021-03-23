import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import {
  mockEventsSearchData, mockOtherProvinceData, mockRegionData, Event, EResponseLevel, EEventStatus,
} from '@/entities/event';
import {
  mockOptionItemData,
} from '@/entities/optionItem';
import helpers from '@/ui/helpers';
import {
  ECanadaProvinces,
} from '@/types';
import moment from '@/ui/plugins/moment';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import { localStorageKeys } from '@/constants/localStorage';
import Component from '../EventForm.vue';

const event = new Event(mockEventsSearchData()[0]);
event.schedule.scheduledCloseDate = moment(event.schedule.scheduledCloseDate).format('YYYY-MM-DD');
event.schedule.scheduledOpenDate = moment(event.schedule.scheduledOpenDate).format('YYYY-MM-DD');
event.responseDetails.dateReported = moment(event.responseDetails.dateReported).format('YYYY-MM-DD');
event.fillEmptyMultilingualAttributes = jest.fn();

describe('EventForm.vue', () => {
  let wrapper;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mounted', () => {
    it('sets the default event type if a default value', async () => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
        },
        data() {
          return {
            prefixRegistrationLink: 'https://mytest.test/',
          };
        },
      });

      await flushPromises();

      const defaultEventType = mockOptionItemData()[1];

      expect(wrapper.vm.eventType).toEqual(defaultEventType);

      expect(wrapper.vm.localEvent.responseDetails.eventType.optionItemId).toBe(defaultEventType.id);
    });

    it('sets the right value from store into prefixRegistrationLink', async () => {
      global.localStorage = {
        store: {},
        getItem: (key) => this.store[key],
        setItem: (key, value) => { this.store[key] = value; },
      };
      global.localStorage.setItem(localStorageKeys.prefixRegistrationLink.name, 'https://foo.test/');

      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
        },
      });

      expect(wrapper.vm.prefixRegistrationLink).toEqual('https://foo.test/');
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
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

    describe('setRelatedEvents', () => {
      it('sets the correct events in the relatedEventsInfos', async () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: false,
            isNameUnique: true,
          },
          data() {
            return {
              prefixRegistrationLink: 'https://mytest.test/',
            };
          },
          computed: {
            relatedEventsSorted() {
              return [event];
            },
          },
        });

        await wrapper.vm.setRelatedEvents([event.id]);
        expect(wrapper.vm.localEvent.relatedEventsInfos).toEqual([{
          id: event.id,
          eventName: event.name,
        }]);
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

    describe('resetAsUnique', () => {
      it('emits update:isNameUnique to true if it is false', async () => {
        wrapper.setProps({ isNameUnique: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:isNameUnique')[0][0]).toBe(true);
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
          isNameUnique: true,
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

      it('sets scheduledOpenData and scheduledCloseDate to initial values if toggling from OnHold => Open => OnHold in edit mode', async () => {
        const event = new Event(mockEventsSearchData()[0]);

        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
          },
          data() {
            return {
              prefixRegistrationLink: 'https://mytest.test/',
            };
          },
        });

        const initialOpenDate = moment(wrapper.vm.localEvent.schedule.scheduledOpenDate).format('YYYY-MM-DD');
        const initialCloseDate = moment(wrapper.vm.localEvent.schedule.scheduledCloseDate).format('YYYY-MM-DD');

        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toBe(initialOpenDate);
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toBe(initialCloseDate);

        wrapper.vm.isStatusOpen = true;

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toBe(wrapper.vm.today);
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toBe(initialCloseDate);

        wrapper.vm.isStatusOpen = false;

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toBe(initialOpenDate);
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toBe(initialCloseDate);
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

        const otherProvinces = mockOtherProvinceData().value;
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
        const regions = mockRegionData().value;
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
            isNameUnique: true,
          },
          data() {
            return {
              prefixRegistrationLink: 'https://mytest.test/',
            };
          },
        });

        expect(wrapper.vm.statusColor).toEqual('status_green_pale black--text');
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

      it('properly encodes the event name when in create mode', async () => {
        await wrapper.setData({
          localEvent: {
            ...wrapper.vm.localEvent,
            name: {
              translation: {
                en: 'Tempête Hivernale.Montréal >> 2021/Hello',
                fr: 'Tempête Hivernale.Montréal >> 2021/Hello',
              },
            },
          },
        });

        expect(wrapper.vm.registrationLink).toBe('tempete-hivernalemontreal-%3e%3e-2021-hello');
      });
    });

    describe('showReOpenInput', () => {
      it('returns true if the form is in edit mode, the event has previously been opened, and status is OnHold => Open', async () => {
        const event = new Event(mockEventsSearchData()[0]);
        event.schedule.hasBeenOpen = true;
        event.schedule.status = EEventStatus.OnHold;

        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
          },
          data() {
            return {
              prefixRegistrationLink: 'https://mytest.test/',
            };
          },
        });

        expect(wrapper.findDataTest('reopen-reason').exists()).toBe(false);

        wrapper.vm.isStatusOpen = true;

        await wrapper.vm.$nextTick();

        expect(wrapper.findDataTest('reopen-reason').exists()).toBe(true);
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
          isNameUnique: true,
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
          isNameUnique: true,
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

    test('eventType specify is required', async () => {
      await flushPromises();

      await wrapper.setData({
        eventType: mockOptionItemData()[0],
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
