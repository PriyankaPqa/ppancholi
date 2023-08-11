import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from '../components/EventExceptionalAuthenticationSection.vue';

const localVue = createLocalVue();

const { pinia, eventStore } = useMockEventStore();
const excptAuth = { item: eventStore.getExceptionalAuthenticationTypes()[0], max: 5, count: 3 };

describe('EventExceptionalAuthenticationSection.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        excptAuth,
        eventId: 'some id',
        index: 0,
      },
      ...otherOptions,
    });
  };

  describe('Template', () => {
    beforeEach(() => {
      mountWrapper(true);
    });

    describe('name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-excptauth-section-name-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-excptauth-section-name-0');
        expect(element.text()).toEqual(wrapper.vm.excptAuth.item.name.translation.en);
      });
    });

    describe('stats', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-excptauth-section-stats-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-excptauth-section-stats-0');
        expect(JSON.parse(element.text())).toEqual({ key: 'eventSummary.exceptionalAuthenticationType.count', params: [{ count: 3, max: 5 }] });
      });
    });
  });
});
