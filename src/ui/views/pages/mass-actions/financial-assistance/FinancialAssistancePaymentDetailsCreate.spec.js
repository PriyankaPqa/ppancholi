import { mockEvent } from '@crctech/registration-lib/src/entities/event/event.mock';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistancePaymentDetailsCreate.vue';
import { EEventStatus } from '@/entities/event';
import { mockCombinedFinancialAssistance, mockFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { mockCombinedProgram } from '@/entities/program';
import { mockCombinedOptionItems, mockOptionItem, mockOptionSubItem } from '@/entities/optionItem';

const formCopy = {
  event: mockEvent(),
  table: mockFinancialAssistanceTableEntity(),
  item: mockOptionItem(),
  subItem: mockOptionSubItem(),
  amount: 25,
  paymentModality: 1,
};

const formCopyNull = {
  event: null,
  table: null,
  item: null,
  subItem: null,
  amount: null,
  paymentModality: null,
};
const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistancePaymentDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('onClearEvent', () => {
      it('should reset the whole form', () => {
        wrapper.vm.onClearEvent();
        expect(wrapper.vm.formCopy).toEqual(formCopyNull);
      });
    });

    describe('onClearFinancialAssistanceTable', () => {
      it('should reset the whole form but the event', () => {
        wrapper.vm.onClearFinancialAssistanceTable();
        expect(wrapper.vm.formCopy).toEqual({ ...formCopyNull, event: formCopy.event });
      });
    });

    describe('onClearItem', () => {
      it('should reset the item and sub item', () => {
        wrapper.vm.onClearItem();
        expect(wrapper.vm.formCopy).toEqual({ ...formCopy, item: null, subItem: null });
      });
    });

    describe('fetchEvents', () => {
      it('should call fetchAll', async () => {
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.$storage.event.actions.fetchAll).toBeCalled();
      });

      it('should set events to entities having status on hold open and having financial assistance table', async () => {
        const res = await wrapper.vm.$storage.event.actions.fetchAll();
        const expected = res
          .filter((e) => (
            e.entity.schedule.status === EEventStatus.OnHold || e.entity.schedule.status === EEventStatus.Open)
            && wrapper.vm.eventIdsWithFinancialAssistanceTable.includes(e.entity.id))
          .map((e) => e.entity);

        await wrapper.vm.fetchEvents();

        expect(wrapper.vm.events).toEqual(expected);
      });
    });

    describe('fetchProgram', () => {
      it('should call action fetch with proper params', async () => {
        const fa = mockFinancialAssistanceTableEntity();

        await wrapper.vm.fetchProgram(fa);

        expect(wrapper.vm.$storage.program.actions.fetch).toHaveBeenLastCalledWith({ id: fa.programId, eventId: fa.eventId });
      });

      it('should set program', async () => {
        wrapper.vm.$storage.program.actions.fetch = jest.fn(() => mockCombinedProgram());

        await wrapper.vm.fetchProgram(mockFinancialAssistanceTableEntity());

        expect(wrapper.vm.program).toEqual(mockCombinedProgram());
      });
    });
  });

  describe('Life cycle', () => {
    describe('Create', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            form: formCopy,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.fetchEvents = jest.fn();
        jest.clearAllMocks();
      });

      it('should fetch all financial assistance table', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$storage.financialAssistance.actions.fetchAll).toHaveBeenCalledTimes(1);
      });

      it('should fetch all financial assistance categorie', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$storage.financialAssistanceCategory.actions.fetchAll).toHaveBeenCalledTimes(1);
      });

      it('should call fetchEvents', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchEvents).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Watch', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $storage: storage,
        },
      });
      wrapper.vm.fetchProgram = jest.fn();
    });

    describe('formCopy', () => {
      it('should emit update event with proper params', () => {
        wrapper.vm.formCopy.event = '';
        expect(wrapper.emitted('update')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('formCopy.table', () => {
      it('should fetch program when table is changed', () => {
        wrapper.vm.formCopy.table = '';
        expect(wrapper.vm.fetchProgram).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('rules', () => {
      it('should return proper rules', () => {
        expect(wrapper.vm.rules)
          .toEqual({
            event: {
              required: true,
            },
            table: {
              required: true,
            },
            item: {
              required: true,
            },
            subItem: {
              required: true,
            },
            paymentModalities: {
              required: true,
            },
            amount: {
              required: true,
              min_value: 0.01,
              max_value: 99999999,
            },
          });
      });
    });

    describe('eventIdsWithFinancialAssistanceTable', () => {
      it('should return a list of all events having a financial assistance table linked', () => {
        expect(wrapper.vm.eventIdsWithFinancialAssistanceTable).toEqual([mockFinancialAssistanceTableEntity().eventId]);
      });
    });

    describe('eventTables', () => {
      it('should return a list of all financial assistance tables of an specific event', () => {
        const expected = wrapper.vm.financialAssistanceTables
          .filter((t) => t.entity.eventId === wrapper.vm.formCopy.event.id && t.entity.items.length > 0)
          .map((t) => t.entity);

        expect(wrapper.vm.eventTables).toEqual(expected);
      });
    });

    describe('currentFinancialAssistanceTable', () => {
      it('should return the current assistance table', () => {
        const expected = wrapper.vm.financialAssistanceTables.find((t) => t.entity.id === wrapper.vm.formCopy.table.id);
        expect(wrapper.vm.currentFinancialAssistanceTable).toEqual(expected);
      });
    });

    describe('financialAssistanceTables', () => {
      it('should return all financial assistance tables', () => {
        expect(wrapper.vm.financialAssistanceTables).toEqual([mockCombinedFinancialAssistance()]);
      });
    });

    describe('financialAssistanceCategories', () => {
      it('should return all financial assistance categories', () => {
        expect(wrapper.vm.financialAssistanceCategories).toEqual(mockCombinedOptionItems());
      });
    });

    describe('financialAssistanceTableItems', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        computed: {
          currentFinancialAssistanceTable: () => mockCombinedFinancialAssistance(),
        },
        mocks: {
          $storage: storage,
        },
      });

      it('should return all categories of the current financial assistance table item', () => {
        const idItemCurrentTable = '9b275d2f-00a1-4345-94fe-c37b84beb400';
        const expected = wrapper.vm.financialAssistanceCategories.filter((c) => c.entity.id === idItemCurrentTable).map((c) => c.entity);
        expect(wrapper.vm.financialAssistanceTableItems).toEqual(expected);
      });
    });
  });
});
