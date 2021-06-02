import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseNote } from '@/entities/case-file/case-note';

import Component from './CaseNotesListItem.vue';

const localVue = createLocalVue();
const caseNote = mockCaseNote();

describe('CaseNotesListItem.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        item: caseNote,
      },
    });
  });

  describe('Template', () => {
    describe('subject', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__subject').text()).toBe(caseNote.subject);
      });
    });

    describe('categories', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__category').text()).toBe(caseNote.category.name.translation.en);
      });
    });

    describe('description', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('caseNotes__description').text()).toBe(caseNote.description);
      });
    });

    describe('click edit button', () => {
      it('is triggers event', async () => {
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
  });

  describe('Computed', () => {
    describe('canEditCaseNote', () => {
      it('returns the correct value', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            item: caseNote,
          },
        });

        await wrapper.setRole('level4');
        expect(wrapper.vm.canEditCaseNote).toBeTruthy();

        await wrapper.setRole('level3');
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
  });
});
