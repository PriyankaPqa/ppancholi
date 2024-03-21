import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';
import { mockEventSummary } from '@libs/entities-lib/event';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';
import Routes from '@/constants/routes';
import { mockProvider } from '@/services/provider';
import Component from './EventsSelector.vue';

const localVue = createLocalVue();
const vuetify = new Vuetify();
const services = mockProvider();
let wrapper;

const doMount = (shallow = true, fetchAllEvents = false, otherOptions = {}) => {
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
    ...otherOptions,
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

  describe('Computed', () => {
    describe('isOnRegistrationPage', () => {
      it('should return true when user on Registration page', () => {
        doMount(true, true, {
          mocks: {
            $services: services,
            $route: { name: Routes.registration.home.name },
          },
        });
        expect(wrapper.vm.isOnRegistrationPage).toBe(true);
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
          filter: { and: [{ 'Name/Translation/en': { contains: 'test' } }] },
          orderBy: 'Schedule/OpenDate desc',
          queryType: 'full',
          searchMode: 'all',
          top: 10,
        });
      });

      it('should fetch active events corresponding to the query', async () => {
        await wrapper.vm.fetchEvents('test', 10);
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          orderBy: 'Schedule/OpenDate desc',
          queryType: 'full',
          searchMode: 'all',
          filter: { Schedule: { Status: 'Open' }, and: [{ 'Name/Translation/en': { contains: 'test' } }] },
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
        wrapper.vm.$services.events.searchMyEvents = jest.fn(() => ({ value: [mockEventSummary({ id: '1' }), mockEventSummary({ id: '2' })] }));
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.events).toEqual([new RegistrationEvent(mockEventSummary({ id: '2' }))]);
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
        await wrapper.vm.fetchEventsByIds(['1', '2']);
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: 'Id in(1,2)',
          top: 999,
        });
      });

      it('should call searchMyEvents with proper params if param is a value non empty', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds('1');
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: 'Id in(1)',
          top: 999,
        });
      });

      it('should call searchMyEvents with proper params if param is an object with a key id', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchEventsByIds({ id: '1' });
        expect(wrapper.vm.$services.events.searchMyEvents).toHaveBeenCalledWith({
          filter: 'Id in(1)',
          top: 999,
        });
      });
    });
  });
});
