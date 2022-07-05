/* eslint-disable max-len */
import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFinancialAssistanceEntity } from '@/entities/financial-assistance-payment';
import { mockProgramEntity } from '@/entities/program';
import { mockCombinedFinancialAssistance } from '@/entities/financial-assistance';
import Component from '../CreateEditFinancialAssistanceForm.vue';

const localVue = createLocalVue();
let financialAssistance = mockCaseFinancialAssistanceEntity();
const financialAssistanceTables = [mockCombinedFinancialAssistance(), mockCombinedFinancialAssistance()];
const program = mockProgramEntity();

describe('CreateEditFinancialAssistanceForm.vue', () => {
  let wrapper;

  beforeEach(async () => {
    financialAssistance = mockCaseFinancialAssistanceEntity();
    financialAssistanceTables[0].id = 'abc';
    financialAssistanceTables[1].id = 'zzz';
    financialAssistance.financialAssistanceTableId = 'zzz';
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      propsData: {
        financialAssistance,
        financialAssistanceTables,
        program,
      },
      computed: {

      },
    });
  });

  describe('Template', () => {
    describe('name', () => {
      it('is rendered as textif feature branch is on', async () => {
        await wrapper.setProps({ isEditMode: true });
        expect(wrapper.findDataTest('financial_name_text').exists()).toBeTruthy();
      });
    });

    describe('tables', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('financialCreate_tableSelect').exists()).toBeTruthy();
      });
    });

    describe('description', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('financial_description').exists()).toBeTruthy();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('sets localFinancialAssistance', () => {
        expect(wrapper.vm.localFinancialAssistance.id).toEqual(financialAssistance.id);
      });

      it('sets financialAssistanceTable to the right table and emits it', () => {
        expect(wrapper.vm.financialAssistanceTable.id).toEqual(financialAssistance.financialAssistanceTableId);
        expect(wrapper.emitted('updateSelectedData')[wrapper.emitted('updateSelectedData').length - 1][0]).toEqual(wrapper.vm.financialAssistanceTable);
      });
    });
  });

  describe('Methods', () => {
    describe('triggerUpdateSelectedData', () => {
      it('emits updateSelectedData ', async () => {
        financialAssistanceTables[0].id = 'abc';
        wrapper.vm.localFinancialAssistance = financialAssistance;
        await wrapper.vm.$nextTick();
        await wrapper.vm.triggerUpdateSelectedData(financialAssistanceTables[0]);
        expect(wrapper.emitted('update:financialAssistance')[wrapper.emitted('update:financialAssistance').length - 1][0]).toEqual(financialAssistance);
        expect(wrapper.vm.localFinancialAssistance.financialAssistanceTableId).toBe('abc');
      });

      it('calls updateBasicData', async () => {
        jest.spyOn(wrapper.vm, 'updateBasicData').mockImplementation(() => {});

        await wrapper.vm.triggerUpdateSelectedData(financialAssistanceTables[0]);
        expect(wrapper.vm.updateBasicData).toHaveBeenCalled();
      });

      it('cancels if the user cancels when there is already group information', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        financialAssistanceTables[0].id = 'abc';
        wrapper.vm.localFinancialAssistance = financialAssistance;
        expect(wrapper.vm.localFinancialAssistance.groups.length).toBeGreaterThan(0);
        await wrapper.vm.$nextTick();
        await wrapper.vm.triggerUpdateSelectedData(financialAssistanceTables[0]);
        expect(wrapper.vm.localFinancialAssistance.groups.length).toBeGreaterThan(0);
        expect(wrapper.vm.localFinancialAssistance.financialAssistanceTableId).not.toBe('abc');
      });

      it('clears groups if the user agrees when there is already group information', async () => {
        wrapper.vm.localFinancialAssistance = financialAssistance;
        expect(wrapper.vm.localFinancialAssistance.groups.length).toBeGreaterThan(0);
        await wrapper.vm.$nextTick();
        await wrapper.vm.triggerUpdateSelectedData(financialAssistanceTables[0]);
        expect(wrapper.vm.localFinancialAssistance.groups.length).toBe(0);
        expect(wrapper.vm.localFinancialAssistance.financialAssistanceTableId).toBe('abc');
      });
    });

    describe('updateBasicData', () => {
      it('emits update:financialAssistance', async () => {
        wrapper.vm.localFinancialAssistance = financialAssistance;
        await wrapper.vm.$nextTick();
        await wrapper.vm.updateBasicData();
        expect(wrapper.emitted('update:financialAssistance')[0][0]).toEqual(financialAssistance);
      });
    });
  });

  describe('Validation rules', () => {
    describe('table', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('financialCreate_tableSelect');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.table);
      });
    });

    describe('description', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('financial_description');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.description);
      });
    });
  });
});
