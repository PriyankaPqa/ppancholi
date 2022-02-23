/**
 * @group ui/components/financial-assistance
 */

import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockSubItems } from '@/entities/financial-assistance';
import Component from '../Templates/AddSubItemDocumentation.vue';

const localVue = createLocalVue();
const storage = mockStorage();

const subItem = mockSubItems()[0];
storage.financialAssistance.getters.newSubItem = jest.fn(() => subItem);

describe('AddSubItemDocumentation.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('documentationRequired', () => {
      it('returns the right value', async () => {
        expect(wrapper.vm.documentationRequired).toEqual(subItem.documentationRequired);
      });

      it('sets the right value', async () => {
        wrapper.vm.documentationRequired = false;

        expect(storage.financialAssistance.mutations.setNewSubItemDocumentationRequired).toHaveBeenCalledTimes(1);
        expect(storage.financialAssistance.mutations.setNewSubItemDocumentationRequired).toHaveBeenCalledWith(false);
      });
    });
  });
});
