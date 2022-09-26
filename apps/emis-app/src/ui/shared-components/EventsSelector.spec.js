import Vuetify from 'vuetify';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';
import { EEventStatus } from '@libs/entities-lib/event';
import Component from './EventsSelector.vue';

const localVue = createLocalVue();
const vuetify = new Vuetify();
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
