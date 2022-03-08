import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCombinedMassAction } from '@/entities/mass-action';
import { EPaymentModalities, mockCombinedProgram } from '@/entities/program';
import { mockCombinedEvent } from '@/entities/event';
import { mockCombinedFinancialAssistance } from '@/entities/financial-assistance';
import { mockCombineOptionItem, mockOptionItem } from '@/entities/optionItem';
import Component from './FinancialAssistancePaymentDetailsTable.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistancePaymentDetailsTable.vue', () => {
  let wrapper;

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
        data() {
          return {
            event: mockCombinedEvent(),
            table: mockCombinedFinancialAssistance(),
            program: mockCombinedProgram(),
            item: mockCombineOptionItem(),
          };
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('rows', () => {
      it('should return proper rows', () => {
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massActions.financialAssistance.create.event.label',
            value: mockCombinedEvent().entity.name.translation.en,
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
            value: mockCombineOptionItem().entity.name.translation.en,
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
            value: `enums.PaymentModality.${EPaymentModalities[wrapper.vm.massAction.entity.details.paymentModality]}`,
            dataTest: 'payment',
          },
          {
            label: 'massActions.financialAssistance.create.amount.label',
            value: wrapper.vm.$formatCurrency(wrapper.vm.massAction.entity.details.amount),
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
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(wrapper.vm.$storage.event.actions.fetch).toHaveBeenCalledWith(id);
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
        expect(wrapper.vm.$storage.program.actions.fetch).toHaveBeenCalledWith({ id, eventId });
      });
    });

    describe('fetchItem', () => {
      it('should fetch the item', async () => {
        const id = mockCombinedMassAction().entity.details.mainCategoryId;
        await wrapper.vm.fetchItem();
        expect(wrapper.vm.$storage.financialAssistanceCategory.actions.fetch).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massAction: mockCombinedMassAction(),
        },
        mocks: {
          $storage: storage,
        },
      });
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
