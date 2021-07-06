import { MAX_LENGTH_SM, MAX_LENGTH_XL } from '@/constants/validations';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockCombinedCaseFile } from '@/entities/case-file';
import { mockCaseNoteEntity, mockCaseNoteCategories } from '@/entities/case-note';

import Component from './CaseNoteForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFileId = 'id';
const caseNote = mockCaseNoteEntity();

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.caseNote.actions.addCaseNote = jest.fn(() => caseNote);

    wrapper = mount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      propsData: {
        caseNote,
        actionTitle: '',
        isEdit: false,
      },
      computed: {
        caseFile() {
          return { entity: { id: mockCaseFileId } };
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

    describe('isSaving', () => {
      it('should be linked to proper state', () => {
        wrapper.vm.$store.state.caseNoteEntities.isSavingCaseNote = true;
        expect(wrapper.vm.isSaving).toEqual(true);

        wrapper.vm.$store.state.caseNoteEntities.isSavingCaseNote = false;
        expect(wrapper.vm.isSaving).toEqual(false);
      });
    });

    describe('caseNoteCategories', () => {
      it('return proper data', () => {
        expect(wrapper.vm.caseNoteCategories).toStrictEqual(mockCaseNoteCategories());
      });
    });

    describe('caseFile', () => {
      it('return proper data', () => {
        const caseFile = mockCombinedCaseFile();
        storage.caseFile.getters.get.mockReturnValueOnce(caseFile);
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });

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

      it('calls setInitialCategory if there is a case note passed in props', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            caseNote,
          },
        });
        jest.spyOn(wrapper.vm, 'setInitialCategory').mockImplementation(() => {});

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.setInitialCategory).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('setInitialCategory', () => {
      it('sets currentCategory when a case note is passed in props', async () => {
        await wrapper.vm.setInitialCategory();
        expect(wrapper.vm.currentCategory).toEqual(mockCaseNoteCategories()[2]);
      });
    });

    describe('setCategory', () => {
      it('sets the right category from the argument into the localCaseNote ', async () => {
        const newCategory = { id: 'mock-id' };
        await wrapper.vm.setCategory(newCategory);
        expect(wrapper.vm.localCaseNote.category).toEqual({ optionItemId: 'mock-id', specifiedOther: null });
      });
    });

    describe('save', () => {
      describe('user level is level 1 or level 2 or level 3', () => {
        it('shows confirmation dialog', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => false);

          wrapper.vm.save();
          expect(wrapper.vm.showConfirmationDialog).toBeTruthy();
        });

        it('does not calls addOrEdit', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => false);
          wrapper.vm.addOrEdit = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.addOrEdit).toHaveBeenCalledTimes(0);
        });
      });

      describe('user level higher than 3', () => {
        it('does not show confirmation dialog', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => true);

          wrapper.vm.save();
          expect(wrapper.vm.showConfirmationDialog).toBeFalsy();
        });

        it('calls addOrEdit', async () => {
          wrapper.vm.$hasLevel = jest.fn(() => true);
          wrapper.vm.addOrEdit = jest.fn();

          wrapper.vm.save();
          expect(wrapper.vm.addOrEdit).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('addOrEdit', () => {
      it('should call editCaseNote if is edit mode', async () => {
        await wrapper.setProps({
          isEdit: true,
        });

        wrapper.vm.addCaseNote = jest.fn();
        wrapper.vm.editCaseNote = jest.fn();

        await wrapper.vm.addOrEdit();

        expect(wrapper.vm.addCaseNote).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.editCaseNote).toHaveBeenCalledTimes(1);
      });

      it('should call addCaseNote if is not edit mode', async () => {
        await wrapper.setProps({
          isEdit: false,
        });

        wrapper.vm.addCaseNote = jest.fn();
        wrapper.vm.editCaseNote = jest.fn();

        await wrapper.vm.addOrEdit();

        expect(wrapper.vm.addCaseNote).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.editCaseNote).toHaveBeenCalledTimes(0);
      });
    });

    describe('addCaseNote', () => {
      it('should call storage to add case note', async () => {
        await wrapper.setData({
          localCaseNote: caseNote,
        });

        await wrapper.vm.addCaseNote();
        expect(wrapper.vm.$storage.caseNote.actions.addCaseNote).toHaveBeenCalledWith(mockCaseFileId, caseNote);
      });

      it('should emit add-case-note-id with the new case note id', async () => {
        await wrapper.vm.addCaseNote();
        expect(wrapper.emitted('add-case-note-id')[0][0]).toEqual(caseNote.id);
      });

      it('should emit event', () => {
        wrapper.vm.addCaseNote();
        expect(wrapper.emitted('close-case-note-form'));
      });
    });

    describe('editCaseNote', () => {
      it('should call storage to edit case note', async () => {
        await wrapper.setData({
          localCaseNote: caseNote,
        });

        await wrapper.vm.editCaseNote();
        expect(wrapper.vm.$storage.caseNote.actions.editCaseNote).toHaveBeenCalledWith(mockCaseFileId, caseNote.id, caseNote);
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
