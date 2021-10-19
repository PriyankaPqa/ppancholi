import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@/entities/event';
import helpers from '@/ui/helpers/helpers';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockUserStateLevel } from '@/test/helpers';

import Component from '../components/EventAgreementSection.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntity();
const storage = mockStorage();

describe('EventAgreementSection.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          agreement: mockEvent.agreements[0],
          agreementTypes: [],
          eventId: mockEvent.id,
          index: 0,
        },
        store: {
          ...mockUserStateLevel(5),
        },
        computed: {
          agreementTypeName() { return 'agreement-type-name'; },
        },
      });
    });

    describe('agreement name', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-agreement-section-name-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right name', () => {
        const element = wrapper.findDataTest('event-agreement-section-name-0');
        expect(element.text()).toEqual(wrapper.vm.agreement.name.translation.en);
      });
    });

    describe('agreement start date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-agreement-section-start-date-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right date', () => {
        const element = wrapper.findDataTest('event-agreement-section-start-date-0');
        expect(element.text()).toEqual(helpers.getLocalStringDate(wrapper.vm.agreement.startDate, 'EventAgreement.startDate', 'll'));
      });
    });

    describe('agreement end date', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-agreement-section-end-date-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right date', () => {
        const element = wrapper.findDataTest('event-agreement-section-end-date-0');
        expect(element.text()).toEqual('-');
      });
    });

    describe('agreement details', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-agreement-section-details-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('event-agreement-section-details-0');
        expect(element.text()).toEqual(wrapper.vm.agreement.details.translation.en);
      });
    });

    describe('agreement type', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('event-agreement-section-type-0');
        expect(element.exists()).toBeTruthy();
      });

      it('displays the right data', () => {
        const element = wrapper.findDataTest('event-agreement-section-type-0');
        expect(element.text()).toEqual(wrapper.vm.agreementTypeName);
      });
    });

    describe('edit button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('edit-event-agreement-0');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if user is below level 5', async () => {
        await wrapper.setRole('level4');

        const element = wrapper.findDataTest('edit-event-agreement-0');
        expect(element.exists()).toBeFalsy();
      });

      it('emits submit, with the right data if form is valid', async () => {
        const element = wrapper.findDataTest('edit-event-agreement-0');

        await element.vm.$emit('click');
        expect(wrapper.emitted('edit')[0][0]).toEqual(wrapper.vm.agreement.id);
      });
    });

    describe('delete button', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('delete-event-agreement-0');
        expect(element.exists()).toBeTruthy();
      });

      it('does not render if user is below level 5', async () => {
        await wrapper.setRole('level4');

        const element = wrapper.findDataTest('delete-event-agreement-0');
        expect(element.exists()).toBeFalsy();
      });

      it('sets showDeleteConfirmationDialog to true', async () => {
        wrapper.vm.showDeleteConfirmationDialog = false;
        const element = wrapper.findDataTest('delete-event-agreement-0');

        await element.vm.$emit('click');
        expect(wrapper.vm.showDeleteConfirmationDialog).toBeTruthy();
      });
    });

    describe('info dialog', () => {
      it('does not render when showInfoDialog is false', async () => {
        wrapper.vm.showInfoDialog = false;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('agreement-info-dialog');
        expect(element.exists()).toBeFalsy();
      });

      it('renders when showInfoDialog is true', async () => {
        wrapper.vm.showInfoDialog = true;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('agreement-info-dialog');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('delete confirmation dialog', () => {
      it('does not render when showDeleteConfirmationDialog is false', async () => {
        wrapper.vm.showDeleteConfirmationDialog = false;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('agreement-section-delete-confirmation-dialog');
        expect(element.exists()).toBeFalsy();
      });

      it('renders when showDeleteConfirmationDialog is true', async () => {
        wrapper.vm.showDeleteConfirmationDialog = true;
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('agreement-section-delete-confirmation-dialog');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          agreement: mockEvent.agreements[0],
          eventId: mockEvent.id,
          agreementTypes: mockOptionItemData(),
          index: 0,
        },
      });
    });

    describe('agreementTypeName', () => {
      it('returns the agreement type name from agreement types if type is not other', () => {
        wrapper.vm.agreement.agreementType.optionItemId = mockOptionItemData()[1].id;
        expect(wrapper.vm.agreementTypeName).toEqual(mockOptionItemData()[1].name.translation.en);
      });

      it('returns the specified other text from agreement types if type is other', () => {
        wrapper.vm.agreement.agreementType.optionItemId = mockOptionItemData()[0].id;
        wrapper.vm.agreement.agreementType.specifiedOther = 'mock-specified-other';
        expect(wrapper.vm.agreementTypeName).toEqual('mock-specified-other');
      });
    });

    describe('infoData', () => {
      it('contains the correct data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            agreement: mockEvent.agreements[0],
            eventId: mockEvent.id,
            agreementTypes: [],
            index: 0,
          },
          computed: {
            agreementTypeName() { return 'agreement-type-name'; },
          },
        });
        expect(wrapper.vm.infoData).toEqual({
          startDate: {
            key: 'eventSummary.agreement.startDate',
            value: helpers.getLocalStringDate(wrapper.vm.agreement.startDate, 'EventAgreement.startDate', 'll'),
          },
          endDate: {
            key: 'eventSummary.agreement.endDate',
            value: '-',
          },
          details: {
            key: 'eventSummary.agreement.details',
            value: wrapper.vm.agreement.details.translation.en,
          },
          type: {
            key: 'eventSummary.agreement.type',
            value: wrapper.vm.agreementTypeName,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    storage.event.actions.deleteAgreement = jest.fn(() => {});
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          agreement: mockEvent.agreements[0],
          eventId: mockEvent.id,
          agreementTypes: [],
          index: 0,
        },
        mocks: {
          $storage: storage,
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
        expect(wrapper.emitted('edit')[0][0]).toBe(wrapper.vm.agreement.id);
      });
    });

    describe('deleteAgreement', () => {
      it('calls storage action deleteAgreement with the right payload', async () => {
        await wrapper.vm.deleteAgreement();
        expect(wrapper.vm.$storage.event.actions.deleteAgreement).toHaveBeenCalledWith({
          eventId: wrapper.vm.eventId,
          agreementId: wrapper.vm.agreement.id,
        });
      });

      it('sets showDeleteConfirmationDialog to false', async () => {
        wrapper.vm.showDeleteConfirmationDialog = false;

        await wrapper.vm.deleteAgreement();
        expect(wrapper.vm.showDeleteConfirmationDialog).toBeFalsy();
      });
    });
  });
});
