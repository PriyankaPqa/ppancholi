import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { EEventSummarySections } from '@/types';

import Component from '../components/EventSummarySectionTitle.vue';

const localVue = createLocalVue();

describe('EventSummarySectionTitle.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          section: EEventSummarySections.CallCentre,
        },
        computed: {
          title() {
            return 'eventSummary.callCentre';
          },
        },
      });
    });

    describe('title', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-section-title');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('event-summary-section-title');
        expect(element.text()).toEqual('eventSummary.callCentre');
      });
    });

    describe('add button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('add-section-button');
        expect(element.exists()).toBeTruthy();
      });

      it('emits click-add-button with the right argument', async () => {
        const element = wrapper.findDataTest('add-section-button');
        await element.vm.$emit('click');
        expect(wrapper.emitted('click-add-button')[0][0]).toEqual(EEventSummarySections.CallCentre);
      });
    });
  });

  describe('data', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          section: EEventSummarySections.CallCentre,
        },
      });
    });

    describe('texts', () => {
      it('contains the right titles and labels', () => {
        expect(wrapper.vm.texts).toEqual({
          [EEventSummarySections.CallCentre]: {
            title: 'eventSummary.callCentre',
            buttonCaption: 'eventSummary.addCallCentre',
          },
          [EEventSummarySections.RegistrationLocation]: {
            title: 'eventSummary.registrationLocation',
            buttonCaption: 'eventSummary.addRegistrationLocation',
          },
          [EEventSummarySections.ShelterLocation]: {
            title: 'eventSummary.shelterLocation',
            buttonCaption: 'eventSummary.addShelterLocation',
          },
          [EEventSummarySections.Agreement]: {
            title: 'eventSummary.agreement',
            buttonCaption: 'eventSummary.addAgreement',
          },
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          section: EEventSummarySections.CallCentre,
        },
        data() {
          return {
            texts: {
              [EEventSummarySections.CallCentre]: {
                title: 'eventSummary.callCentre',
                buttonCaption: 'eventSummary.addCallCentre',
              },
            },
          };
        },
      });
    });
    describe('title', () => {
      it('return the right title', () => {
        expect(wrapper.vm.title).toEqual('eventSummary.callCentre');
      });
    });
    describe('buttonCaption', () => {
      it('return the right label', () => {
        expect(wrapper.vm.buttonCaption).toEqual('eventSummary.addCallCentre');
      });
    });
  });
});
