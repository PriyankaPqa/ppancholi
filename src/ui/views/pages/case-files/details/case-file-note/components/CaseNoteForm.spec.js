import { MAX_LENGTH_SM, MAX_LENGTH_XL } from '@/constants/validations';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCaseFilesSearchData } from '@/entities/case-file';
import { mockCaseNote, mockCaseNoteCategories } from '@/entities/case-file/case-note';

import Component from './CaseNoteForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFileId = 'id';

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      computed: {
        caseFile() {
          return { id: mockCaseFileId };
        },
      },
    });
  });

  describe('Template', () => {
    describe('subject', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('case-note-form-subject').exists()).toBeTruthy();
      });
    });

    describe('categories', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('case-note-form-categories').exists()).toBeTruthy();
      });
    });

    describe('description', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('case-note-form-description').exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      test('subject', async () => {
        expect(wrapper.vm.rules.subject).toEqual({
          required: true,
          max: MAX_LENGTH_SM,
        });
      });

      test('category', async () => {
        expect(wrapper.vm.rules.category).toEqual({
          required: true,
        });
      });

      test('description', async () => {
        expect(wrapper.vm.rules.description).toEqual({
          required: true,
          max: MAX_LENGTH_XL,
        });
      });
    });

    describe('caseNoteCategories', () => {
      it('return proper data', () => {
        expect(wrapper.vm.caseNoteCategories).toStrictEqual(mockCaseNoteCategories());
      });
    });

    describe('caseFile', () => {
      it('return proper data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

        const caseFile = mockCaseFilesSearchData()[0];
        storage.caseFile.getters.caseFileById.mockReturnValueOnce(caseFile);

        expect(wrapper.vm.caseFile).toStrictEqual(caseFile);
      });
    });
  });

  describe('Validation rules', () => {
    describe('subject', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('case-note-form-subject');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.subject);
      });
    });

    describe('category', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('case-note-form-categories');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.category);
      });
    });

    describe('description', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('case-note-form-description');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.description);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('assigns value from props to component data', () => {
        const caseNote = mockCaseNote();

        wrapper = mount(Component, {
          localVue,
          propsData: {
            caseNote,
          },
        });

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.localCaseNote).toStrictEqual(caseNote);
      });
    });
  });

  describe('Methods', () => {
    describe('save', () => {
      describe('user level is level 1 or level 2 or level 3', () => {
        it('shows confirmation dialog', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => false);
          wrapper.vm.addCaseNote = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.showConfirmationDialog).toBeTruthy();
        });

        it('does not calls addCaseNote', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => false);
          wrapper.vm.addCaseNote = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.addCaseNote).toHaveBeenCalledTimes(0);
        });
      });

      describe('user level higher than 3', () => {
        it('does not show confirmation dialog', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => true);
          wrapper.vm.addCaseNote = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.showConfirmationDialog).toBeFalsy();
        });

        it('calls addCaseNote', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => true);
          wrapper.vm.addCaseNote = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.addCaseNote).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('addCaseNote', () => {
      it('should call storage to add case note', async () => {
        const caseNote = mockCaseNote();

        await wrapper.setData({
          localCaseNote: caseNote,
        });

        wrapper.vm.addCaseNote();
        expect(wrapper.vm.$storage.caseFile.actions.addCaseNote).toHaveBeenCalledWith(mockCaseFileId, caseNote);
      });

      it('should emit event', () => {
        wrapper.vm.save();
        expect(wrapper.emitted('close-case-note-form'));
      });
    });

    describe('closeConfirmationDialog', () => {
      it('should set value to be false', async () => {
        wrapper.vm.showConfirmationDialog = true;
        expect(wrapper.vm.showConfirmationDialog).toBeTruthy();

        wrapper.vm.closeConfirmationDialog();
        expect(wrapper.vm.showConfirmationDialog).toBeFalsy();
      });
    });

    describe('closeCaseNoteForm', () => {
      it('should emit event', () => {
        wrapper.vm.closeCaseNoteForm();
        expect(wrapper.emitted('close-case-note-form'));
      });
    });
  });
});
