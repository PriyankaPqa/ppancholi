import { RcNestedTable } from '@libs/component-lib/components';
import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockItems, EFinancialAmountModes, EFinancialFrequency } from '@libs/entities-lib/financial-assistance';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import Component from './FinancialAssistanceDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();

describe('FinancialAssistanceDetails.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      mocks: {
        $route: {
          params: {
            faId: 'faId',
          },
        },
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('nested table', () => {
      it('renders', () => {
        const dataTable = wrapper.findComponent(RcNestedTable);

        wrapper.vm.goToEdit = jest.fn();

        expect(dataTable.exists()).toBeTruthy();
      });
    });

    describe('edit button', () => {
      it('go to edit page', async () => {
        const editBtn = wrapper.findDataTest('financialDetails__editBtn');

        wrapper.vm.goToEdit = jest.fn();

        await editBtn.trigger('click');

        expect(wrapper.vm.goToEdit).toHaveBeenCalledTimes(1);
      });
    });

    describe('back to financial assistance button', () => {
      it('back to financial assistance', async () => {
        const backBtn = wrapper.findDataTest('back-to-financial-assistance-btn');

        wrapper.vm.back = jest.fn();

        await backBtn.trigger('click');

        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('returns correct data', () => {
        expect(wrapper.vm.title).toBe('financialAssistance.tableDetails');
      });
    });

    describe('status', () => {
      it('returns correct data', () => {
        expect(wrapper.vm.status).toBe(Status.Active);
      });
    });

    describe('name', () => {
      it('returns correct data', () => {
        expect(wrapper.vm.name).toBe('');

        wrapper.vm.$storage.financialAssistance.getters.name = jest.fn(() => 'name');

        expect(wrapper.vm.name).toBe('name');
      });
    });

    describe('programName', () => {
      it('returns correct data', () => {
        wrapper.vm.$storage.financialAssistance.getters.program = jest.fn(() => ({
          name: {
            translation: {
              en: 'name en',
              fr: 'name fr',
            },
          },
        }));

        expect(wrapper.vm.programName).toBe('name en');
      });
    });

    describe('items', () => {
      it('returns correct data', () => {
        expect(wrapper.vm.items).toEqual(mockItems());
      });
    });

    describe('filteredItems', () => {
      it('returns all items if no search', () => {
        expect(wrapper.vm.filteredItems).toEqual(mockItems());
      });

      it('returns filtered items if has search', async () => {
        await wrapper.setData({
          search: 'needs',
        });

        expect(wrapper.vm.filteredItems).toEqual([
          {
            mainCategory: mockItems()[0].mainCategory,
            subItems: [],
          },
        ]);
      });
    });

    describe('headers', () => {
      it('returns correct data', () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'financialAssistance.nestedTable.headers.item',
            value: 'item',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.subItem',
            value: 'subItem',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.maximum',
            value: 'maximum',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.amountType',
            value: 'amountType',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.documentationRequired',
            value: 'documentationRequired',
            cols: 2,
            align: 'left',
          },
          {
            text: 'financialAssistance.nestedTable.headers.frequency',
            value: 'frequency',
            cols: 2,
            align: 'left',
          },
        ]);
      });
    });
  });

  describe('Life cycle', () => {
    describe('created', () => {
      it('calls actions and mutation', async () => {
        jest.clearAllMocks();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.financialAssistanceCategory.actions.fetchAllIncludingInactive).toHaveBeenCalledTimes(1);

        expect(wrapper.vm.$storage.financialAssistance.actions.fetch).toHaveBeenCalledWith('faId');
      });
    });
  });

  describe('Methods', () => {
    describe('getAmountType', () => {
      it('returns amount type list', async () => {
        const amountType = wrapper.vm.getAmountType({
          amountType: EFinancialAmountModes.Variable,
        });

        expect(amountType).toBe('enums.financialAmountModes.Variable');
      });
    });

    describe('getFrequency', () => {
      it('returns fre type list', async () => {
        const amountType = wrapper.vm.getFrequency({
          frequency: EFinancialFrequency.Multiple,
        });

        expect(amountType).toBe('enums.financialFrequency.Multiple');
      });
    });

    describe('goToEdit', () => {
      it('redirects properly', async () => {
        wrapper.vm.goToEdit();

        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({
          name: routes.events.financialAssistance.edit.name,
          params: {
            faId: 'faId',
          },
        });
      });
    });

    describe('back', () => {
      it('redirects properly', async () => {
        wrapper.vm.back();

        expect(wrapper.vm.$router.replace).toHaveBeenLastCalledWith({
          name: routes.events.financialAssistance.home.name,
        });
      });
    });
  });
});
