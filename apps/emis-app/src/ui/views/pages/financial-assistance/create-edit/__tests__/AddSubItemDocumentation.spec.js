import { createLocalVue, mount } from '@/test/testSetup';
import { mockSubItems } from '@libs/entities-lib/financial-assistance';
import { useMockFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance.mock';
import Component from '../Templates/AddSubItemDocumentation.vue';

const localVue = createLocalVue();

const { pinia, financialAssistanceStore } = useMockFinancialAssistanceStore();
const subItem = mockSubItems()[0];
financialAssistanceStore.newSubItem = subItem;

describe('AddSubItemDocumentation.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
    });
  });

  describe('Computed', () => {
    describe('documentationRequired', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.documentationRequired).toEqual(subItem.documentationRequired);
      });

      it('sets the right value', async () => {
        wrapper.vm.documentationRequired = false;
        expect(financialAssistanceStore.newSubItem.documentationRequired).toEqual(false);
      });
    });
  });
});
