import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { Event, mockEventsSearchData } from '@/entities/event';
import helpers from '@/ui/helpers';

import Component from '../components/EventCallCentreSection.vue';

const localVue = createLocalVue();

const mockEvent = new Event(mockEventsSearchData()[0]);

describe('EventCallCentreSection.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          callCentre: mockEvent.callCentres[0],
        },
      });
    });

    describe('call centre name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-call-centre-section-name');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-call-centre-section-name');
        expect(element.text()).toEqual(wrapper.vm.callCentre.name.translation.en);
      });
    });

    describe('call centre status-chip', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-call-centre-section-status');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-call-centre-section-status');
        expect(element.props().status).toEqual(wrapper.vm.callCentre.status);
      });
    });

    describe('call centre start date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-call-centre-section-start-date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right date', () => {
        const element = wrapper.findDataTest('event-call-centre-section-start-date');
        expect(element.text()).toEqual(helpers.getStringDate(wrapper.vm.callCentre.startDate, 'll'));
      });
    });

    describe('call centre end date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-call-centre-section-end-date');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right date', () => {
        const element = wrapper.findDataTest('event-call-centre-section-end-date');
        expect(element.text()).toEqual('-');
      });
    });

    describe('call centre details', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-call-centre-section-details');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('event-call-centre-section-details');
        expect(element.text()).toEqual(wrapper.vm.callCentre.details.translation.en);
      });
    });

    describe('edit button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('edit-event-call-centre');
        expect(element.exists()).toBeTruthy();
      });

      it('emits submit, with the right data if form is valid', async () => {
        const element = wrapper.findDataTest('edit-event-call-centre');

        await element.vm.$emit('click');
        expect(wrapper.emitted('edit')[0][0]).toEqual(wrapper.vm.callCentre.name.translation.en);
      });
    });

    describe('info dialog', () => {
      it('does not rener when showInfoDialog is false', async () => {
        wrapper.vm.showInfoDialog = false;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('call-centre-info-dialog');
        expect(element.exists()).toBeFalsy();
      });

      it('renders when showInfoDialog is true', async () => {
        wrapper.vm.showInfoDialog = true;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('call-centre-info-dialog');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          callCentre: mockEvent.callCentres[0],
        },
      });
    });

    describe('infoData', () => {
      it('contains the correct data', () => {
        expect(wrapper.vm.infoData).toEqual({
          startDate: {
            key: 'eventSummary.callCentre.startDate',
            value: helpers.getStringDate(wrapper.vm.callCentre.startDate, 'll'),
          },
          endDate: {
            key: 'eventSummary.callCentre.endDate',
            value: '-',
          },
          details: {
            key: 'eventSummary.callCentre.details',
            value: wrapper.vm.callCentre.details.translation.en,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          callCentre: mockEvent.callCentres[0],
        },
      });
    });

    describe('editFromInfoDialog', () => {
      it('sets showInfoDialog to false', async () => {
        wrapper.vm.showInfoDialog = true;
        await wrapper.vm.editFromInfoDialog();
        expect(wrapper.vm.showInfoDialog).toBeFalsy();
      });

      it('emits edit with the right parameters', async () => {
        await wrapper.vm.editFromInfoDialog();
        expect(wrapper.emitted('edit')[0][0]).toBe(wrapper.vm.callCentre.name.translation.en);
      });
    });
  });
});
