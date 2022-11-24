import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import {
  mockOtherProvinceData,
  mockRegionData,
  EResponseLevel,
  EEventStatus,
  mockEventEntity,
  mockCombinedEvents,
} from '@libs/entities-lib/event';
import {
  mockOptionItemData,
  OptionItem,
} from '@libs/entities-lib/optionItem';
import helpers from '@/ui/helpers/helpers';
import {
  ECanadaProvinces,
} from '@libs/shared-lib/types';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { mockStorage } from '@/storage';
import moment from '@libs/shared-lib/plugins/moment';
import Component from '../EventForm.vue';

const event = mockEventEntity();
const mockEvents = mockCombinedEvents();
event.schedule.scheduledCloseDate = moment(event.schedule.scheduledCloseDate).toISOString();
event.schedule.scheduledOpenDate = moment(event.schedule.scheduledOpenDate).toISOString();
event.responseDetails.dateReported = moment(event.responseDetails.dateReported).toISOString();
event.fillEmptyMultilingualAttributes = jest.fn();

const storage = mockStorage();
storage.event.actions.fetchEventTypes = jest.fn(() => mockOptionItemData());
storage.event.actions.fetchAll = jest.fn(() => mockCombinedEvents());
storage.event.actions.fetchOtherProvinces = jest.fn(() => mockOtherProvinceData());
storage.event.actions.fetchRegions = jest.fn(() => mockRegionData());
storage.event.getters.eventTypes = jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e)));

describe('EventForm.vue', () => {
  let wrapper;
  const localVue = createLocalVue();

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
          isDirty: false,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
        },
        mocks: {
          $storage: storage,
        },
      });

      await flushPromises();

      const defaultEventType = mockOptionItemData()[1];

      expect(wrapper.vm.eventType).toEqual(defaultEventType);

      expect(wrapper.vm.localEvent.responseDetails.eventType.optionItemId).toBe(defaultEventType.id);
    });

    it('sets the right value from store into prefixRegistrationLink', async () => {
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
          isDirty: false,
        },
        mocks: {
          $storage: storage,
        },
      });

      expect(wrapper.vm.prefixRegistrationLink).toEqual('https://registration domain en/en/registration/');
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
          isDirty: false,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
          registrationLink() {
            return 'gatineau-floods-2021';
          },

        },
        mocks: {
          $storage: storage,
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

      it('calls fillEmptyMultilingualAttributes entity method', async () => {
        wrapper.vm.localEvent.fillEmptyMultilingualAttributes = jest.fn();
        await wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.localEvent.fillEmptyMultilingualAttributes).toHaveBeenCalledTimes(1);
      });
    });

    describe('setAssistanceNumber', () => {
      it('sets assistanceNumber with the phone object', () => {
        const phoneObject = { number: '12345', countryCode: 'fr', e164Number: '12345' };
        wrapper.vm.setAssistanceNumber(phoneObject);
        expect(wrapper.vm.assistanceNumber).toEqual(phoneObject);
      });

      it('sets the assistanceNumber of the localEvent to the e164Number', () => {
        const phoneObject = { number: '12345', countryCode: 'fr', e164Number: '12345' };
        wrapper.vm.setAssistanceNumber(phoneObject);
        expect(wrapper.vm.localEvent.responseDetails.assistanceNumber).toEqual(phoneObject.e164Number);
      });
    });

    describe('setRelatedEvents', () => {
      it('sets the correct events in the relatedEventsId', async () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: false,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.vm.setRelatedEvents([event.id]);
        expect(wrapper.vm.localEvent.relatedEventIds).toEqual([event.id]);
      });

      it('emits isDirty when called', async () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: false,
            isNameUnique: true,
            isDirty: false,
          },
          computed: {
            prefixRegistrationLink() {
              return 'https://mytest.test/';
            },
            relatedEventsSorted() {
              return [event];
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.vm.setRelatedEvents([event.id]);
        expect(wrapper.emitted('update:is-dirty')).toBeTruthy();
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
      it('emits update:is-name-unique to true if it is false', async () => {
        wrapper.setProps({ isNameUnique: false });
        await wrapper.vm.$nextTick();
        await wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:is-name-unique')[0][0]).toBe(true);
      });
    });

    describe('clearDescription', () => {
      it('clears the field description', async () => {
        wrapper.setData({
          localEvent: { description: { en: 'foo', fr: 'bar' } },
        });
        await wrapper.vm.clearDescription();
        expect(wrapper.vm.localEvent.description).toEqual({
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
      storage.event.getters.getAll = jest.fn(() => mockEvents);
      storage.event.getters.eventTypes = jest.fn(() => mockOptionItemData());
      wrapper = shallowMount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
          isDirty: false,
        },
        mocks: {
          $storage: storage,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
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
        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toEqual(moment(new Date()).format());

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
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            prefixRegistrationLink() {
              return 'https://mytest.test/';
            },
          },
        });

        const initialOpenDate = moment(wrapper.vm.localEvent.schedule.scheduledOpenDate).format('YYYY-MM-DD');
        const initialCloseDate = moment(wrapper.vm.localEvent.schedule.scheduledCloseDate).format('YYYY-MM-DD');

        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toBe(initialOpenDate);
        expect(wrapper.vm.localEvent.schedule.scheduledCloseDate).toBe(initialCloseDate);

        wrapper.vm.isStatusOpen = true;

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.schedule.scheduledOpenDate).toBe(moment(new Date()).format());
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

      it('sets the correct value into localEvent if the input is an object', () => {
        const otherProvinces = mockOtherProvinceData();

        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            otherProvincesSorted() {
              return otherProvinces;
            },
          },
        });

        wrapper.vm.provinceOther = otherProvinces[0];
        wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.location.provinceOther).toEqual(otherProvinces[0].provinceOther);
      });

      it('sets the correct value into localEvent if the input is a string that is in the provinces list and resets the values in newProvince', () => {
        const otherProvinces = mockOtherProvinceData();

        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            otherProvincesSorted() {
              return otherProvinces;
            },
          },
        });

        wrapper.vm.languageMode = 'en';
        wrapper.vm.provinceOther = otherProvinces[0].provinceOther.translation.en;
        wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.location.provinceOther).toEqual(otherProvinces[0].provinceOther);
        expect(wrapper.vm.newProvince).toEqual({ translation: {} });
      });

      it(
        'sets the correct value into localEvent if the input is a string that is  not in the provinces list and updates the values in newRegion',
        () => {
          const otherProvinces = mockOtherProvinceData();
          wrapper = shallowMount(Component, {
            localVue: createLocalVue(),
            propsData: {
              event,
              isEditMode: true,
              isNameUnique: true,
              isDirty: false,
            },
            data() {
              return {
                newProvince: { translation: {} },
              };
            },
            mocks: {
              $storage: storage,
            },
            computed: {
              otherProvincesSorted() {
                return otherProvinces;
              },
            },
          });

          wrapper.vm.languageMode = 'en';
          wrapper.vm.provinceOther = 'New province EN';
          wrapper.vm.$nextTick();

          expect(wrapper.vm.localEvent.location.provinceOther).toEqual({ translation: { en: 'New province EN' } });
          expect(wrapper.vm.newProvince).toEqual({ translation: { en: 'New province EN' } });
        },
      );
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

      it('sets the correct value into localEvent if the input is an object', () => {
        const region1 = { region: { translation: { en: 'TEST EN', fr: 'TEST FR' } } };
        const region2 = { region: { translation: { en: 'TEST_B EN', fr: 'TEST_B FR' } } };
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            regionsSorted() {
              return [region1, region2];
            },
          },
        });

        wrapper.vm.region = region1;
        wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.location.region).toEqual(region1.region);
      });

      it('sets the correct value into localEvent if the input is a string that is in the regions list and resets the values in newRegion', () => {
        const region1 = { region: { translation: { en: 'TEST EN', fr: 'TEST FR' } } };
        const region2 = { region: { translation: { en: 'TEST_B EN', fr: 'TEST_B FR' } } };
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            regionsSorted() {
              return [region1, region2];
            },
          },
        });

        wrapper.vm.languageMode = 'en';
        wrapper.vm.region = 'TEST EN';
        wrapper.vm.$nextTick();

        expect(wrapper.vm.localEvent.location.region).toEqual(region1.region);
        expect(wrapper.vm.newRegion).toEqual({ translation: {} });
      });

      it(
        'sets the correct value into localEvent if the input is a string that is  not in the regions list and updates the values in newRegion',
        () => {
          const region1 = { region: { translation: { en: 'TEST EN', fr: 'TEST FR' } } };
          const region2 = { region: { translation: { en: 'TEST_B EN', fr: 'TEST_B FR' } } };
          wrapper = shallowMount(Component, {
            localVue: createLocalVue(),
            propsData: {
              event,
              isEditMode: true,
              isNameUnique: true,
              isDirty: false,
            },
            data() {
              return {
                localEvent: { region: null },
                newRegion: { translation: {} },
              };
            },
            mocks: {
              $storage: storage,
            },
            computed: {
              regionsSorted() {
                return [region1, region2];
              },
            },
          });

          wrapper.vm.languageMode = 'en';
          wrapper.vm.region = 'New region EN';
          wrapper.vm.$nextTick();

          expect(wrapper.vm.localEvent.location.region).toEqual({ translation: { en: 'New region EN' } });
          expect(wrapper.vm.newRegion).toEqual({ translation: { en: 'New region EN' } });
        },
      );
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
      it('returns the event types from the store with the initial event appended to the list', async () => {
        expect(wrapper.vm.eventTypesSorted).toEqual(mockOptionItemData());
      });
    });

    describe('relatedEventsSorted', () => {
      it('returns the events from the store', async () => {
        expect(wrapper.vm.relatedEventsSorted).toEqual(mockEvents);
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
      it('returns the rule mustBeAfterOrSame if scheduledOpenDate and scheduledCloseDate are defined', async () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: false,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            eventTypesSorted() {
              return mockOptionItemData();
            },
          },
        });
        await wrapper.setData({
          localEvent: {
            schedule: {
              scheduledCloseDate: '2020-01-02',
              scheduledOpenDate: '2020-01-01',
            },
          },
        });
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
      it('returns the rule mustBeBeforeOrSame if scheduledOpenDate and scheduledCloseDate are defined', async () => {
        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: false,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            eventTypesSorted() {
              return mockOptionItemData();
            },
          },
        });
        await wrapper.setData({
          localEvent: {
            schedule: {
              scheduledCloseDate: '2020-01-02',
              scheduledOpenDate: '2020-01-01',
            },
          },
        });
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
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            prefixRegistrationLink() {
              return 'https://mytest.test/';
            },
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
        event.schedule.hasBeenOpen = true;
        event.schedule.status = EEventStatus.OnHold;

        wrapper = shallowMount(Component, {
          localVue: createLocalVue(),
          propsData: {
            event,
            isEditMode: true,
            isNameUnique: true,
            isDirty: false,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            prefixRegistrationLink() {
              return 'https://mytest.test/';
            },
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
          isDirty: false,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
          relatedEventsSorted() {
            return [event];
          },
        },
        store: {
          ...mockUserStateLevel(6),
        },
        mocks: {
          $storage: {
            event: {
              getters: {
                eventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
              },
              actions: {
                fetchEventTypes: jest.fn(() => mockOptionItemData()),
                fetchAll: jest.fn(() => mockCombinedEvents()),
                fetchOtherProvinces: jest.fn(() => mockOtherProvinceData()),
                fetchRegions: jest.fn(() => mockRegionData()),
              },
            },
            tenantSettings: storage.tenantSettings,
          },
        },
      });
    });

    describe('Event handlers', () => {
      test('Focusing out on assistance number calls setAssistanceNumber', async () => {
        jest.spyOn(wrapper.vm, 'setAssistanceNumber').mockImplementation(() => {});

        const phone = wrapper.findDataTest('event-phone');
        await phone.vm.$emit('focusout', {
          countryCode: 'CA',
          e164Number: '+11234567890',
          number: '1234567890',
        });

        expect(wrapper.vm.setAssistanceNumber).toHaveBeenCalledWith({
          countryCode: 'CA',
          e164Number: '+11234567890',
          number: '1234567890',
        });
      });

      test('clear button on description input calls clearDescription', async () => {
        jest.spyOn(wrapper.vm, 'clearDescription').mockImplementation(() => {});
        const field = wrapper.findDataTest('event-description');
        await field.vm.$emit('click:clear');
        expect(wrapper.vm.clearDescription).toHaveBeenCalled();
      });
    });

    describe('Events Selector', () => {
      it('should have fetch-all-events props', () => {
        const component = wrapper.findComponent(EventsSelector);
        expect(component.props('fetchAllEvents')).toBe(true);
      });
    });
  });

  describe('Validation rules', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: false,
          isNameUnique: true,
          isDirty: false,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
        },
        data() {
          return {
            languageMode: 'en',
            assistanceNumber: {
              number: '',
              countryCode: '',
              e164Number: '',
            },
          };
        },
        store: {
          ...mockUserStateLevel(6),
        },
        mocks: {
          $storage: {
            event: {
              getters: {
                eventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
              },
              actions: {
                fetchEventTypes: jest.fn(() => mockOptionItemData()),
                fetchAll: jest.fn(() => mockCombinedEvents()),
                fetchOtherProvinces: jest.fn(() => mockOtherProvinceData()),
                fetchRegions: jest.fn(() => mockRegionData()),
              },
            },
            tenantSettings: storage.tenantSettings,
          },
        },
      });
    });

    test('event name is required', async () => {
      wrapper.vm.localEvent.name.translation[wrapper.vm.languageMode] = '';
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event name max is MAX_LENGTH_MD', async () => {
      wrapper.vm.localEvent.name.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event response level is required', async () => {
      wrapper.vm.localEvent.responseDetails.responseLevel = null;
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('event-level');
      expect(el.classes('invalid')).toBe(true);
    });

    test('event province is required', async () => {
      wrapper.vm.localEvent.location.province = null;
      await wrapper.vm.$nextTick();
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
      await wrapper.setData({
        eventType: mockOptionItemData()[0],
      });

      expect(wrapper.findDataTest('event-type-specified-other').exists()).toBe(true);

      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-type-specified-other');
      expect(el.classes('invalid')).toBe(true);
    });

    test('assistanceNumber is required', async () => {
      wrapper = mount(Component, {
        localVue: createLocalVue(),
        propsData: {
          event,
          isEditMode: true,
          isNameUnique: true,
          isDirty: false,
        },
        computed: {
          prefixRegistrationLink() {
            return 'https://mytest.test/';
          },
        },
        store: {
          ...mockUserStateLevel(6),
        },
        mocks: {
          $storage: {
            event: {
              getters: {
                eventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
              },
              actions: {
                fetchEventTypes: jest.fn(() => mockOptionItemData()),
                fetchAll: jest.fn(() => mockCombinedEvents()),
                fetchOtherProvinces: jest.fn(() => mockOtherProvinceData()),
                fetchRegions: jest.fn(() => mockRegionData()),
              },
            },
            tenantSettings: storage.tenantSettings,
          },
        },
      });
      wrapper.vm.assistanceNumber = {
        number: '',
        countryCode: '',
        e164Number: '',
      };

      const el = wrapper.findDataTest('event-phone');

      await el.vm.$emit('focusout', {
        countryCode: '',
        e164Number: '',
        number: '',
      });

      await wrapper.vm.$refs.form.validate();
      await wrapper.vm.$nextTick();

      expect(el.find('.v-input').classes('error--text')).toBe(true);
    });

    test('description max is MAX_LENGTH_LG', async () => {
      wrapper.vm.localEvent.description.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_LG + 1);
      await wrapper.vm.$nextTick();
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('event-description');
      expect(el.classes('invalid')).toBe(true);
    });
  });

  describe('Permissions', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          event,
          isEditMode: true,
          isNameUnique: true,
          isDirty: false,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    test('the inputDisabled prop returns false if the user has level lower than 6', async () => {
      expect(wrapper.vm.inputDisabled).toBe(true);
    });

    test('all the inputs except for description are disabled for level 5', async () => {
      await wrapper.setRole('level5');

      expect(wrapper.findDataTest('event-name').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-level').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-province').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-region').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-type').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-phone').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-reported-date').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-switch-status').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-related-events').attributes('disabled')).toBe('disabled');
      expect(wrapper.findDataTest('event-description').attributes('disabled')).toBeFalsy();
    });

    test('the inputDisabled prop returns true if the user has level 6', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          event,
          isEditMode: true,
          isNameUnique: true,
          isDirty: false,
        },
        store: {
          ...mockUserStateLevel(6),
        },
        mocks: {
          $storage: {
            event: {
              getters: {
                eventTypes: jest.fn(() => mockOptionItemData().map((e) => new OptionItem(e))),
              },
              actions: {
                fetchEventTypes: jest.fn(() => mockOptionItemData()),
                fetchAll: jest.fn(() => mockCombinedEvents()),
                fetchOtherProvinces: jest.fn(() => mockOtherProvinceData()),
                fetchRegions: jest.fn(() => mockRegionData()),
              },
            },
            tenantSettings: storage.tenantSettings,
          },
        },
      });

      expect(wrapper.vm.inputDisabled).toBe(false);
    });
  });
});
