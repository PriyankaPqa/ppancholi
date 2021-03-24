import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { EEventStatus } from '@/entities/event';

import Component from '../components/EventStatusDialog.vue';

const localVue = createLocalVue();

describe('EventStatusDialog.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          toStatus: EEventStatus.Open,
          show: true,
        },
      });
    });

    describe('status-chip', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-summary-status-chip');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-summary-status-chip');
        expect(element.props().status).toEqual(EEventStatus.Open);
      });
    });
  });

  describe('data', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          toStatus: EEventStatus.Open,
          show: true,
        },
      });
    });

    describe('texts', () => {
      it('contains the right titles and labels', () => {
        expect(wrapper.vm.texts).toEqual({
          [EEventStatus.Open]: {
            title: 'event.status.confirmation.title.re-open',
            label: 'event.status.confirmation.label.re-open*',

          },
          [EEventStatus.Closed]: {
            title: 'event.status.confirmation.title.close',
            label: 'event.status.confirmation.label.close*',
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
          toStatus: EEventStatus.Open,
          show: true,
        },
        data() {
          return {
            texts: {
              [EEventStatus.Open]: {
                title: this.$t('event.status.confirmation.title.re-open'),
                label: `${this.$t('event.status.confirmation.label.re-open')}*`,

              },
            },
          };
        },
      });
    });
    describe('title', () => {
      it('return the right title', () => {
        expect(wrapper.vm.title).toEqual('event.status.confirmation.title.re-open');
      });
    });
    describe('label', () => {
      it('return the right label', () => {
        expect(wrapper.vm.label).toEqual('event.status.confirmation.label.re-open*');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          toStatus: EEventStatus.Open,
          show: true,
        },
      });
    });
    describe('onSubmit', () => {
      it('emits submit, with the right data if form is valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.reason = 'foo';

        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')[0][0]).toEqual({ status: EEventStatus.Open, reason: 'foo' });
      });
    });
  });
});
