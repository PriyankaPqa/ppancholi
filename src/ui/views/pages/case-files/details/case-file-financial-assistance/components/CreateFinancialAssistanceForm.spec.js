import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFinancialAssistanceEntity, mockCaseFinancialAssistanceEntities } from '@/entities/case-file-financial-assistance';
import { mockProgramCaseFinancialAssistance } from '@/entities/program';
import Component from './CreateFinancialAssistanceForm.vue';

const localVue = createLocalVue();
const financialAssistance = mockCaseFinancialAssistanceEntity();
const financialAssistanceTables = mockCaseFinancialAssistanceEntities();
const program = mockProgramCaseFinancialAssistance();

describe('CreateFinancialAssistanceForm.vue', () => {
  let wrapper;

  beforeEach(async () => {
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
      it('is rendered', async () => {
        expect(wrapper.findDataTest('financial_name').exists()).toBeTruthy();
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

  describe('Methods', () => {
    describe('triggerUpdateProgram', () => {
      it('emits updateProgram ', async () => {
        wrapper.vm.localFinancialAssistance = financialAssistance;
        await wrapper.vm.$nextTick();
        await wrapper.vm.triggerUpdateProgram(financialAssistanceTables[0]);
        expect(wrapper.emitted('update:financialAssistance')[0][0]).toEqual(financialAssistance);
      });

      it('calls updateBasicData', async () => {
        jest.spyOn(wrapper.vm, 'updateBasicData').mockImplementation(() => {});

        await wrapper.vm.triggerUpdateProgram(financialAssistanceTables[0]);
        expect(wrapper.vm.updateBasicData).toHaveBeenCalled();
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
    describe('name', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('financial_name');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.name);
      });
    });

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
