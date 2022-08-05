import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';

import { ValidationOfImpactStatus, ImpactValidationMethod } from '@libs/entities-lib/case-file';
import Component from '../components/ImpactValidationDialog.vue';

const localVue = createLocalVue();

describe('ImpactValidation.vue', () => {
  let wrapper;
  let storage;

  beforeEach(async () => {
    storage = mockStorage();
    wrapper = mount(Component, {
      localVue,
      propsData: {
        show: true,
        caseFile: {
          id: 'a612c472-95b7-4983-99c0-3ee9c4946b45',
          impactStatusValidation: {
            method: ImpactValidationMethod.Exception,
            status: ValidationOfImpactStatus.NotImpacted,
          },
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Template', () => {
    describe('Information are correctly loaded', () => {
      it('preselects a method correctly', () => {
        const inputSelect = wrapper.find('[data-test="impact-method-exception"]');
        expect(inputSelect.element.checked).toBe(true);
      });
      it('preselects status correctly', () => {
        const inputSelect = wrapper.find('[data-test="impact-status-not-impacted"]');
        expect(inputSelect.element.checked).toBe(true);
      });
    });
    test('Help button does not exist and has the correct link', () => {
      const helpButton = wrapper.find('[data-test="showHelp"]');
      expect(helpButton.exists()).toBe(false);
      expect(wrapper.vm.helpLink).toBe('zendesk.impact_validation');
    });

    test('Cancel button is linked to proper translation', () => {
      const cancel = wrapper.find('[data-test="dialog-cancel-action"]');
      expect(cancel.text()).toBe('common.cancel');
    });
  });

  describe('Methods', () => {
    describe('Save', () => {
      it('saves changes and triggers a toast', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            status: ValidationOfImpactStatus.Undetermined,
            method: ImpactValidationMethod.Manual,
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileValidationOfImpact).toHaveBeenCalledWith(wrapper.vm.caseFile.id, {
          status: ValidationOfImpactStatus.Undetermined,
          method: ImpactValidationMethod.Manual,
        });
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
      it('saves changes and closes only when valid', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({
          form: {
            status: ValidationOfImpactStatus.Undetermined,
            // NotApplicable - invalid
            method: ImpactValidationMethod.NotApplicable,
          },
        });

        await wrapper.vm.save();
        expect(storage.caseFile.actions.setCaseFileValidationOfImpact).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted('update:show')).toBeUndefined();
      });
    });
  });
});
