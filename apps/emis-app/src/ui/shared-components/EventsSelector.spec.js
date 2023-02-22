import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';
import { EEventStatus, mockCombinedEvent, mockCombinedEvents } from '@libs/entities-lib/event';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';
import { mockProvider } from '@/services/provider';
import Component from './EventsSelector.vue';

const localVue = createLocalVue();
const vuetify = new Vuetify();
const services = mockProvider();
let wrapper;

const doMount = (shallow = true, fetchAllEvents = false) => {
  const options = {
    localVue,
    vuetify,
    propsData: {
      label: 'test',
      dataTest: 'dataTest',
      itemValue: 'event.id',
      fetchAllEvents,
    },
    mocks: {
      $services: services,
    },
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
};

describe('EventsSelector.vue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    doMount();
  });

  describe('Template', () => {
    describe('VAutocompleteWithValidation', () => {
      it('should pass props disable-chip-delete', async () => {
        doMount();
        await wrapper.setProps({
          disableEventDelete: true,
        });

        const component = wrapper.findComponent(VAutocompleteWithValidation);
        const props = 'disableChipDelete';

        expect(component.props(props)).toBe(true);

        await wrapper.setProps({
          disableEventDelete: false,
        });

        expect(component.props(props)).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('should call fetchEvents', async () => {
        wrapper.vm.fetchEvents = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchEvents).toHaveBeenCalledWith('', wrapper.vm.initialNumberOfItems);
      });
    });
  });

  describe('Methods', () => {
    describe('fetchEvents', () => {
      it('should fetch all events corresponding to the query', async () => {
        doMount(true, true);
        await wrapper.vm.fetchEvents('test', 10);
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenLastCalledWith({
          filter: null,
          search: '((/.*test.*/ OR "\\"test\\""))',
          searchFields: 'Entity/Name/Translation/en',
          orderBy: 'Entity/Schedule/OpenDate desc',
          queryType: 'full',
          searchMode: 'all',
          top: 10,
        });
      });

      it('should fetch active events corresponding to the query', async () => {
        await wrapper.vm.fetchEvents('test', 10);
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          search: '((/.*test.*/ OR "\\"test\\""))',
          searchFields: 'Entity/Name/Translation/en',
          orderBy: 'Entity/Schedule/OpenDate desc',
          queryType: 'full',
          searchMode: 'all',
          filter: { Entity: { Schedule: { Status: EEventStatus.Open } } },
          top: 10,
        });
      });

      it('should emit fetch:done so we can do additional manipulation on events', async () => {
        await wrapper.vm.fetchEvents('test', 10);
        expect(wrapper.emitted('fetch:done')).toBeTruthy();
      });

      it('should filter the excluded event out', async () => {
        await wrapper.setProps({
          excludedEvent: '1',
        });
        wrapper.vm.$services.events.searchMyEvents = jest.fn(() => ({ value: [...mockCombinedEvents()] }));
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.events).toEqual([new RegistrationEvent(mockCombinedEvent({ id: '2' }, 1).entity)]);
      });
    });

    describe('fetchEventsByIds', () => {
      it('should do nothing if the param is an empty array', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds([]);
        expect(wrapper.vm.$services.events.searchMyEvents).not.toHaveBeenCalled();
      });

      it('should do nothing if the param is an empty value', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds('');
        expect(wrapper.vm.$services.events.searchMyEvents).not.toHaveBeenCalled();

        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds(null);
        expect(wrapper.vm.$services.events.searchMyEvents).not.toHaveBeenCalled();
      });

      it('should call searchMyEvents with proper params if param is an array', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds(['1']);
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['1'] } } },
          top: 999,
        });
      });

      it('should call searchMyEvents with proper params if param is a value non empty', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds('1');
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['1'] } } },
          top: 999,
        });
      });

      it('should call searchMyEvents with proper params if param is an object with a key id', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds({ id: '1' });
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: { Entity: { Id: { searchIn_az: ['1'] } } },
          top: 999,
        });
      });
    });
  });
});
