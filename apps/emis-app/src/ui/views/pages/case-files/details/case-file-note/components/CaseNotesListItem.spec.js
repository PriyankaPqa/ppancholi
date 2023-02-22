import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseNote, mockCaseNoteCategories, mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { useMockCaseNoteStore } from '@/pinia/case-note/case-note.mock';
import { UserRoles } from '@libs/entities-lib/user';

import { getPiniaForUser } from '@/pinia/user/user.mock';
import Component from './CaseNotesListItem.vue';

const localVue = createLocalVue();
const caseNote = mockCombinedCaseNote();
const { pinia, caseNoteStore } = useMockCaseNoteStore();

describe('CaseNotesListItem.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    caseNoteStore.getCaseNoteCategories = jest.fn(() => mockCaseNoteCategories());

    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        item: caseNote,
      },
    });
  });

  describe('Template', () => {
    describe('subject', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__subject').text()).toBe(caseNote.entity.subject);
      });
    });

    describe('categories', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__category').text()).toBe(caseNote.metadata.caseNoteCategoryName.translation.en);
      });
    });

    describe('description', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__description').text()).toBe(caseNote.entity.description);
      });
    });

    describe('click edit button', () => {
      it('triggers event', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item: caseNote,
          },
          mocks: {
            $hasLevel: jest.fn(() => true),
          },
          computed: {
            canEditCaseNote() {
              return true;
            },
          },
        });
        wrapper.vm.editCaseNote = jest.fn();

        expect(wrapper.vm.editCaseNote).toHaveBeenCalledTimes(0);

        const editBtn = wrapper.findDataTest('items__editButton');
        editBtn.vm.$emit('click');

        expect(wrapper.vm.editCaseNote).toHaveBeenCalledTimes(1);
      });
    });

    // describe('click pin button', () => {
    //   it('triggers event', async () => {
    //     wrapper.vm.emitPinEvent = jest.fn();
    //
    //     expect(wrapper.vm.emitPinEvent).toHaveBeenCalledTimes(0);
    //
    //     const pinBtn = wrapper.findDataTest('items__pinButton');
    //     pinBtn.vm.$emit('click');
    //
    //     expect(wrapper.vm.emitPinEvent).toHaveBeenCalledTimes(1);
    //   });
    // });
  });

  describe('Computed', () => {
    describe('caseNoteCategories', () => {
      it('returns the categories', () => {
        expect(wrapper.vm.caseNoteCategories).toEqual(mockCaseNoteCategories());
      });
    });

    describe('categoryName', () => {
      it('returns the categoryName if it is in the metadata', () => {
        expect(wrapper.vm.categoryName).toEqual(wrapper.vm.item.metadata.caseNoteCategoryName.translation.en);
      });

      it('returns the category name from the entity if there is no metadata data', () => {
        const altCaseNote = { entity: mockCaseNoteEntity({ category: { optionItemId: mockCaseNoteCategories()[1].id } }), metadata: {} };
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            item: altCaseNote,
          },
          computed: {
            canEditCaseNote() {
              return true;
            },
          },
        });
        expect(wrapper.vm.categoryName).toEqual(mockCaseNoteCategories()[1].name.translation.en);
      });
    });

    describe('canEditCaseNote', () => {
      it('returns the correct value', async () => {
        const doMount = (pinia) => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia,
            propsData: {
              item: caseNote,
            },
          });
        };

        doMount(getPiniaForUser(UserRoles.level4));

        expect(wrapper.vm.canEditCaseNote).toBeTruthy();

        doMount(getPiniaForUser(UserRoles.level3));

        expect(wrapper.vm.canEditCaseNote).toBeFalsy();

        doMount(getPiniaForUser(UserRoles.level4));
        await wrapper.setProps({ readonly: true });
        expect(wrapper.vm.canEditCaseNote).toBeFalsy();
      });
    });
  });

  describe('Methods', () => {
    describe('editCaseNote', () => {
      it('sets isEdit to be true', async () => {
        expect(wrapper.vm.isEdit).toBeFalsy();

        wrapper.vm.editCaseNote();

        expect(wrapper.vm.isEdit).toBeTruthy();
      });
    });

    describe('emitPinEvent', () => {
      it('emits event', async () => {
        wrapper.vm.emitPinEvent();

        expect(wrapper.emitted('pin-case-note')).toBeTruthy();
        expect(wrapper.emitted('pin-case-note')[0][0]).toBe(caseNote);
      });
    });

    describe('closeCaseNoteEdit', () => {
      it('sets isEdit to be false', async () => {
        wrapper.vm.isEdit = true;

        expect(wrapper.vm.isEdit).toBeTruthy();
        await wrapper.vm.closeCaseNoteEdit();

        expect(wrapper.vm.isEdit).toBeFalsy();
      });
      it('emits setIsEdit', async () => {
        await wrapper.vm.closeCaseNoteEdit();

        expect(wrapper.emitted('setIsEdit'));
      });
    });
  });
});
