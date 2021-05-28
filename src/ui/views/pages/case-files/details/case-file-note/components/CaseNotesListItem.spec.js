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
  });
});
