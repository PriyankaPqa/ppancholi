import { RcDialog } from '@crctech/component-library';
import { createLocalVue, mount } from '@/test/testSetup';

import Component from '../components/EventSummarySectionInfoDialog.vue';

const localVue = createLocalVue();

describe('EventSummarySectionInfoDialog.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          show: true,
          title: 'mock-title',
          name: 'mock-name',
          status: 1,
          tableData: {
            mockData: {
              key: 'mock-key',
              value: 'mock-value',
            },
          },
        },
      });
    });

    describe('dialog', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-section-info-dialog');
        expect(element.exists()).toBeTruthy();
      });

      it('contains the right title prop', () => {
        expect(wrapper.findComponent(RcDialog).props('title')).toEqual(wrapper.vm.title);
      });
    });

    describe('name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-section-info-dialog-name');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-section-info-dialog-name');
        expect(element.text()).toEqual(wrapper.vm.name);
      });
    });

    describe('status', () => {
      it('renders when a status props is passed', () => {
        const element = wrapper.findDataTest('event-section-info-dialog-status');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right status', () => {
        const element = wrapper.findDataTest('event-section-info-dialog-status');
        expect(element.props().status).toEqual(wrapper.vm.status);
      });

      it('does not render when a status props is not passed', async () => {
        await wrapper.setProps({ status: null });
        const element = wrapper.findDataTest('event-section-info-dialog-status');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('table data', () => {
      describe('table data key', () => {
        it('renders the table data key', () => {
          const element = wrapper.findDataTest('event-status-info-table-key');
          expect(element.exists()).toBeTruthy();
        });

        it('displays the right content', () => {
          const element = wrapper.findDataTest('event-status-info-table-key');
          expect(element.text()).toEqual(wrapper.vm.tableData.mockData.key);
        });
      });

      describe('table data value', () => {
        it('renders the table data value', () => {
          const element = wrapper.findDataTest('event-status-info-table-value');
          expect(element.exists()).toBeTruthy();
        });

        it('displays the right content', () => {
          const element = wrapper.findDataTest('event-status-info-table-value');
          expect(element.text()).toEqual(wrapper.vm.tableData.mockData.value);
        });
      });
    });

    describe('edit button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('edit-section-from-info-dialog');
        expect(element.exists()).toBeTruthy();
      });

      it('emits edit, with the right data if form is valid', async () => {
        jest.spyOn(wrapper.vm, '$emit').mockImplementation(() => {});
        const element = wrapper.findDataTest('edit-section-from-info-dialog');

        await element.vm.$emit('click');
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('edit');
      });
    });
  });
});
