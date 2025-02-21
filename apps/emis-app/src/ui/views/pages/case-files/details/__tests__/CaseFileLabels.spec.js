import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';

import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

import Component from '../case-file-activity/components/CaseFileLabels.vue';

const localVue = createLocalVue();
const mockCaseFile = mockCaseFileEntity();
mockCaseFile.labels = [{
  name: 'Label Two',
  order: 2,
}, {
  name: 'Label One',
  order: 1,
}, {
  name: '',
  order: 3,
}, {
  name: '',
  order: 4,
}];

const { pinia, caseFileStore } = useMockCaseFileStore();

describe('CaseFileLabels.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      pinia,
      propsData: {
        caseFileLabels: mockCaseFile.labels,
        caseFileId: mockCaseFile.id,
      },

    });
  });

  describe('Computed', () => {
    describe('labelsSorted', () => {
      it('returns only labels that have text', () => {
        expect(wrapper.vm.caseFileLabels.length).toBe(4);
        expect(wrapper.vm.labelsSorted.length).toBe(2);
      });

      it('returns the labels sorted by order', () => {
        expect(wrapper.vm.labelsSorted).toEqual([{
          name: 'Label One',
          order: 1,
        }, {
          name: 'Label Two',
          order: 2,
        }]);
      });
    });

    describe('rules', () => {
      it('is defined properly', () => {
        expect(wrapper.vm.rules).toEqual({
          label: {
            max: MAX_LENGTH_SM,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    describe('copyLabels', () => {
      it('maps the labels from the case file', async () => {
        await wrapper.setProps({
          caseFileLabels: [{
            name: 'Label One',
            order: 1,
          }],
        });

        const result = await wrapper.vm.copyLabels(wrapper.vm.caseFileLabels);
        expect(result).toEqual([{
          name: 'Label One',
          order: 1,
        }, {
          name: '',
          order: 2,
        }, {
          name: '',
          order: 3,
        }, {
          name: '',
          order: 4,
        }]);
      });

      it('returns original array of labels if caseFileLabels is an empty array', async () => {
        await wrapper.setProps({
          caseFileLabels: [],
        });

        const result = await wrapper.vm.copyLabels(wrapper.vm.caseFileLabels);
        expect(result).toEqual([{
          name: '',
          order: 1,
        }, {
          name: '',
          order: 2,
        }, {
          name: '',
          order: 3,
        }, {
          name: '',
          order: 4,
        }]);
      });
    });

    describe('submitAddLabels', () => {
      it('does not call the action if the validation fails', async () => {
        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(0);

        jest.spyOn(wrapper.vm.$refs.form, 'validate').mockImplementation(() => false);

        await wrapper.vm.submitAddLabels();

        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(0);
      });

      it('calls the setCaseFileLabels action if the change of labels is valid', async () => {
        jest.clearAllMocks();
        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(0);

        jest.spyOn(wrapper.vm.$refs.form, 'validate').mockImplementation(() => true);
        wrapper.vm.isNewLabelChangeValid = jest.fn(() => true);

        await wrapper.vm.submitAddLabels();

        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(1);

        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledWith(
          mockCaseFile.id,
          wrapper.vm.labels,
        );
      });

      it('should not call the setCaseFileLabels action if the change of labels is invalid', async () => {
        jest.clearAllMocks();
        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(0);

        jest.spyOn(wrapper.vm.$refs.form, 'validate').mockImplementation(() => true);
        wrapper.vm.isNewLabelChangeValid = jest.fn(() => false);

        await wrapper.vm.submitAddLabels();

        expect(caseFileStore.setCaseFileLabels).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('calls the copyLabels method on mount', () => {
        wrapper.vm.copyLabels = jest.fn();

        expect(wrapper.vm.copyLabels).toHaveBeenCalledTimes(0);

        wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.copyLabels).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Template', () => {
    test('clicking the labels button shows the dialog when not readonly', async () => {
      expect(wrapper.findDataTest('case-file-labels-dialog').exists()).toBe(false);
      const button = wrapper.findDataTest('caseFileActivity-add-label-btn');
      await button.trigger('click');
      expect(wrapper.findDataTest('case-file-labels-dialog').exists()).toBe(true);
    });

    test('clicking the labels button does nothing when readonly', async () => {
      await wrapper.setProps({ readonly: true });
      expect(wrapper.findDataTest('case-file-labels-dialog').exists()).toBe(false);
      const button = wrapper.findDataTest('caseFileActivity-add-label-btn');
      await button.trigger('click');
      expect(wrapper.findDataTest('case-file-labels-dialog').exists()).toBe(false);
    });
  });

  describe('Validation', () => {
    test('the label inputs have a max length of 50 characters', async () => {
      const tooManyChars = 'x'.repeat(51);
      const justEnough = 'x'.repeat(50);

      await wrapper.setData({
        showLabelsDialog: true,
        labels: [{
          name: tooManyChars,
          order: 1,
        }, {
          name: justEnough,
          order: 2,
        }, {
          name: '',
          order: 3,
        }, {
          name: '',
          order: 4,
        }],
      });

      await wrapper.vm.$refs.form.validate();

      const labelOne = wrapper.findTextFieldWithValidation('case-file-labels-1');
      expect(labelOne.classes('invalid')).toBe(true);

      const labelTwo = wrapper.findTextFieldWithValidation('case-file-labels-2');
      expect(labelTwo.classes('invalid')).toBe(false);

      const labelThree = wrapper.findTextFieldWithValidation('case-file-labels-3');
      expect(labelThree.classes('invalid')).toBe(false);

      const labelFour = wrapper.findTextFieldWithValidation('case-file-labels-4');
      expect(labelFour.classes('invalid')).toBe(false);
    });
  });
});
