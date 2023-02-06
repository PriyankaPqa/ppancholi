import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockCombinedMassAction, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { EPaymentModalities, mockCombinedProgram } from '@libs/entities-lib/program';
import { mockEventEntity } from '@libs/entities-lib/event';
import { mockCombinedFinancialAssistance } from '@libs/entities-lib/financial-assistance';
import { mockOptionItem, mockOptionItemData } from '@libs/entities-lib/optionItem';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import Component from './FinancialAssistancePaymentDetailsTable.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const { pinia, eventStore } = useMockEventStore();
const { programStore } = useMockProgramStore(pinia);
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);

describe('FinancialAssistancePaymentDetailsTable.vue', () => {
  let wrapper;

  const doMount = (shallow, otherData) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        massAction: mockMassActionEntity(),
      },
      data() {
        return {
          ...otherData,
        };
      },
      mocks: {
        $storage: storage,
      },
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        event: mockEventEntity(),
        table: mockCombinedFinancialAssistance(),
        program: mockCombinedProgram(),
        item: mockOptionItem(),
      });
    });
    describe('rows', () => {
      it('should return proper rows', () => {
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massActions.financialAssistance.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massActions.financialAssistance.create.table.label',
            value: mockCombinedFinancialAssistance().entity.name.translation.en,
            dataTest: 'table',
            loading: wrapper.vm.tableLoading,
          },
          {
            label: 'massActions.financialAssistance.create.program.label',
            value: mockCombinedProgram().entity.name.translation.en,
            dataTest: 'program',
            loading: wrapper.vm.programLoading,
          },
          {
            label: 'massActions.financialAssistance.create.item.label',
            value: mockOptionItem().name.translation.en,
            dataTest: 'item',
            loading: wrapper.vm.itemLoading,
          },
          {
            label: 'massActions.financialAssistance.create.sub_item.label',
            value: wrapper.vm.subItem && wrapper.vm.$m(wrapper.vm.subItem.name),
            dataTest: 'sub_item',
            loading: wrapper.vm.itemLoading,
          },
          {
            label: 'massActions.financialAssistance.create.payment.label',
            value: `enums.PaymentModality.${EPaymentModalities[wrapper.vm.massAction.details.paymentModality]}`,
            dataTest: 'payment',
          },
          {
            label: 'massActions.financialAssistance.create.amount.label',
            value: wrapper.vm.$formatCurrency(wrapper.vm.massAction.details.amount),
            dataTest: 'amount',
            customClass: 'grey-back',
            customClassValue: 'fw-bold',
          },
        ]);
      });
    });

    describe('subItem', () => {
      it('should return the subItem', () => {
        expect(wrapper.vm.subItem).toEqual(mockOptionItem().subitems[1]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(eventStore.fetch).toHaveBeenCalledWith(id);
      });
    });

    describe('fetchTable', () => {
      it('should fetch the table', async () => {
        const id = mockCombinedMassAction().entity.details.tableId;
        await wrapper.vm.fetchTable();
        expect(wrapper.vm.$storage.financialAssistance.actions.fetch).toHaveBeenCalledWith(id);
      });
    });

    describe('fetchProgram', () => {
      it('should fetch the program', async () => {
        const id = mockCombinedMassAction().entity.details.programId;
        const { eventId } = mockCombinedMassAction().entity.details;
        await wrapper.vm.fetchProgram();
        expect(programStore.fetch).toHaveBeenCalledWith({ id, eventId });
      });
    });

    describe('fetchItem', () => {
      it('should fetch the categories and save the item to the state ', async () => {
        wrapper.setProps({ massAction: { ...mockMassActionEntity(), details: { ...mockMassActionEntity().details, mainCategoryId: '1' } } });
        financialAssistancePaymentStore.fetchFinancialAssistanceCategories = jest.fn(() => mockOptionItemData());
        await wrapper.vm.fetchItem();
        expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
        expect(wrapper.vm.item).toEqual(mockOptionItemData()[0]);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('created', () => {
      it('fetches all data', () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvent = jest.fn();
        wrapper.vm.fetchTable = jest.fn();
        wrapper.vm.fetchProgram = jest.fn();
        wrapper.vm.fetchItem = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.fetchEvent).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchTable).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchProgram).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.fetchItem).toHaveBeenCalledTimes(1);
      });
    });
  });
});
