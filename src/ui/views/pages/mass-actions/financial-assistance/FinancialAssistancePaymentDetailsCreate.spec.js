import { mockEvent } from '@crctech/registration-lib/src/entities/event/event.mock';
import _sortBy from 'lodash/sortBy';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistancePaymentDetailsCreate.vue';
import { EEventStatus, mockCombinedEvents } from '@/entities/event';
import {
  mockCombinedFinancialAssistance, mockFinancialAssistanceTableEntity, mockSubItemData, mockSubItems,
} from '@/entities/financial-assistance';
import { EPaymentModalities, mockCombinedProgram } from '@/entities/program';
import { mockCombinedOptionItems, mockOptionItem, mockOptionSubItem } from '@/entities/optionItem';
import helpers from '@/ui/helpers';
import { Status } from '@/entities/base';

const formCopy = {
  event: mockEvent(),
  table: mockFinancialAssistanceTableEntity(),
  item: mockOptionItem({ id: '9b275d2f-00a1-4345-94fe-c37b84beb400' }),
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

describe('FinancialAssistancePaymentDetailsCreate.vue', () => {
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
      it('should call onSetEvent with null', () => {
        wrapper.vm.onSetEvent = jest.fn();
        wrapper.vm.onClearEvent();
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(null);
      });
    });

    describe('onSetEvent', () => {
      it('should set the event and reset other fields', () => {
        wrapper.vm.onSetEvent(mockEvent());
        expect(wrapper.vm.formCopy).toEqual({ ...formCopyNull, event: mockEvent() });
      });
    });

    describe('onClearFinancialAssistanceTable', () => {
      it('should call onSetFinancialAssistanceTable with null ', () => {
        wrapper.vm.onSetFinancialAssistanceTable = jest.fn();
        wrapper.vm.onClearFinancialAssistanceTable();
        expect(wrapper.vm.onSetFinancialAssistanceTable).toHaveBeenLastCalledWith(null);
      });
    });

    describe('onSetFinancialAssistanceTable', () => {
      it('should set the table and reset below fields', () => {
        wrapper.vm.onSetFinancialAssistanceTable(mockFinancialAssistanceTableEntity());
        expect(wrapper.vm.formCopy).toEqual({ ...formCopyNull, event: formCopy.event, table: mockFinancialAssistanceTableEntity() });
      });
    });

    describe('onClearItem', () => {
      it('should call onSetItem with null', () => {
        wrapper.vm.onSetItem = jest.fn();
        wrapper.vm.onClearItem();
        expect(wrapper.vm.onSetItem).toHaveBeenLastCalledWith(null);
      });
    });

    describe('onSetItem', () => {
      it('should set the item and reset the sub item', () => {
        wrapper.vm.onSetItem(mockOptionItem());
        expect(wrapper.vm.formCopy.item).toEqual(mockOptionItem());
        expect(wrapper.vm.formCopy.subItem).toEqual(null);
      });
    });

    describe('fetchEvents', () => {
      it('should call service search with proper params', async () => {
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.$services.events.search).toHaveBeenCalledWith({
          filter: {
            or: [
              {
                Entity: {
                  Schedule: {
                    Status: EEventStatus.Open,
                  },
                },
              },
              {
                Entity: {
                  Schedule: {
                    Status: EEventStatus.OnHold,
                  },
                },
              },
            ],
          },
          top: 999,
          orderBy: 'Entity/Name/Translation/en asc',
          queryType: 'full',
          searchMode: 'all',
          searchFields: 'Entity/Name/Translation/en',
        });
      });

      it('should set events with the returned events filtered on whether they have a financial assistance table', async () => {
        const expected = mockCombinedEvents()
          .filter((e) => (wrapper.vm.eventIdsWithFinancialAssistanceTable.includes(e.entity.id)))
          .map((e) => ({ id: e.entity.id, text: wrapper.vm.$m(e.entity.name) }));

        wrapper.vm.$services.events.search = jest.fn(() => ({ value: mockCombinedEvents() }));

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

      it('should fetch all financial assistance categories', async () => {
        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.$storage.financialAssistanceCategory.actions.fetchAll).toHaveBeenCalledTimes(1);
      });

      it('should fetch all events', async () => {
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
        computed: {
          currentSubItem: () => mockSubItemData(),
        },
      });
      wrapper.vm.fetchProgram = jest.fn();
      wrapper.vm.onSetFinancialAssistanceTable = jest.fn();
      wrapper.vm.onSetEvent = jest.fn();
      wrapper.vm.onSetItem = jest.fn();
    });

    describe('formCopy', () => {
      it('should emit update event with proper params', () => {
        expect(wrapper.emitted('update')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('formCopy.table', () => {
      it('should fetch program when table is changed', () => {
        expect(wrapper.vm.fetchProgram).toBeCalled();
      });

      it('should call onSetFinancialAssistanceTable with proper param ', async () => {
        expect(wrapper.vm.onSetFinancialAssistanceTable).toHaveBeenLastCalledWith(wrapper.vm.formCopy.table);
      });
    });

    describe('formCopy.event', () => {
      it('should call onSetEvent with proper param ', async () => {
        expect(wrapper.vm.onSetEvent).toHaveBeenLastCalledWith(wrapper.vm.formCopy.event);
      });
    });

    describe('formCopy.item', () => {
      it('should call onSetItem with proper param', async () => {
        expect(wrapper.vm.onSetItem).toHaveBeenLastCalledWith(wrapper.vm.formCopy.item);
      });
    });

    describe('formCopy.subItem', () => {
      it('should assign the amount if the select sub-item has a fixed amount', async () => {
        expect(wrapper.vm.formCopy.amount).toEqual(wrapper.vm.currentSubItem.maximumAmount);
      });

      it('should reset the amount if the select sub-item has a variable amount', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            form: formCopy,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            currentSubItem: () => mockSubItems()[1],
          },
        });

        await wrapper.setData({
          formCopy: {
            subItem: mockSubItems()[1],
          },
        });

        expect(wrapper.vm.formCopy.amount).toEqual(0);
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
      it('should return the list of financial assistance tables of an specific event', () => {
        const expected = wrapper.vm.financialAssistanceTables
          .filter((t) => t.entity.eventId === wrapper.vm.formCopy.event.id && t.entity.items.length > 0 && t.entity.status === Status.Active)
          .map((t) => t.entity);

        expect(wrapper.vm.eventTables).toEqual(expected);
      });
    });

    describe('currentFinancialAssistanceTable', () => {
      it('should return the current assistance table', async () => {
        await wrapper.setData({
          formCopy: {
            table: mockFinancialAssistanceTableEntity(),
          },
        });
        const expected = wrapper.vm.financialAssistanceTables.find((t) => t.entity.id === wrapper.vm.formCopy.table.id);
        expect(wrapper.vm.currentFinancialAssistanceTable).toEqual(expected);
      });
    });

    describe('financialAssistanceTables', () => {
      it('should return all financial assistance tables having at least one active item having at least one sub item '
        + 'for which document is not required', () => {
        const expected = [mockCombinedFinancialAssistance()]
          .filter((t) => t.entity.items.length > 0
          && t.entity.status === Status.Active
          && t.entity.items.some((item) => item.subItems.some((subItem) => subItem.documentationRequired === false)));

        expect(wrapper.vm.financialAssistanceTables).toEqual(expected);
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

      it('should return all active categories having at least one sub-item for which document is not '
        + 'required for the current financial assistance table', () => {
        const idItemCurrentTable = '9b275d2f-00a1-4345-94fe-c37b84beb400';

        const expected = _sortBy(wrapper.vm.financialAssistanceCategories
          .filter((c) => c.entity.id === idItemCurrentTable
            && c.entity.status === Status.Active
            && c.subItems.some((s) => s.documentationRequired === false))
          .map((c) => c.entity), 'orderRank');

        expect(wrapper.vm.financialAssistanceTableItems).toEqual(expected);
      });
    });

    describe('paymentModalities', () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          form: formCopy,
        },
        data() {
          return {
            program: mockCombinedProgram(),
          };
        },
        mocks: {
          $storage: storage,
        },
      });

      it('should return all payment modalities included in the program', () => {
        const expected = helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities')
          .filter((p) => mockCombinedProgram().entity.paymentModalities.includes(p.value));

        expect(wrapper.vm.paymentModalities).toEqual(expected);
      });
    });

    describe('subItems', () => {
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

      it('should return all active subitems for which documentationRequired is false the selected item for the current table', async () => {
        const expected = [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' })];
        wrapper.setData({
          formCopy: {
            table: formCopy.table,
            item: formCopy.item,
          },
        });
        expect(wrapper.vm.subItems).toEqual(expected);
      });
    });
  });
});
