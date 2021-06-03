import { createLocalVue, shallowMount } from '@/test/testSetup';
import Component from './CaseNote.vue';
import CaseNoteForm from './components/CaseNoteForm.vue';

const localVue = createLocalVue();

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
    });
  });

  describe('Template', () => {
    describe('CaseNoteForm', () => {
      it('should not consist of CaseNoteForm component by default', async () => {
        expect(wrapper.findComponent(CaseNoteForm).exists()).toBeFalsy();
      });

      it('should consist of CaseNoteForm component if is creating case note', async () => {
        await wrapper.setData({
          isBeingCreated: true,
        });
        expect(wrapper.findComponent(CaseNoteForm)).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('should return proper data', async () => {
        wrapper.vm.totalCount = 99;
        expect(wrapper.vm.title).toEqual('caseNote.caseNotes (99)');
      });
    });

    describe('filterOptions', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.filterOptions).toEqual([]);
      });
    });

    describe('loading', () => {
      it('should be linked to proper state', () => {
        wrapper.vm.$store.state.caseFile.isLoadingCaseNotes = true;
        expect(wrapper.vm.loading).toEqual(true);

        wrapper.vm.$store.state.caseFile.isLoadingCaseNotes = false;
        expect(wrapper.vm.loading).toEqual(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchActiveCaseNoteCategories and searchCaseNotes', async () => {
        wrapper.vm.$storage.caseFile.actions.fetchActiveCaseNoteCategories = jest.fn();
        wrapper.vm.searchCaseNotes = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.caseFile.actions.fetchActiveCaseNoteCategories).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.searchCaseNotes).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('search', () => {
      it('should call searchCaseNotes', async () => {
        wrapper.vm.searchCaseNotes = jest.fn();

        wrapper.vm.search();
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(wrapper.vm.searchCaseNotes).toHaveBeenCalledTimes(1);
      });
    });

    describe('searchCaseNotes', () => {
      it('should call storage', async () => {
        wrapper.vm.$storage.caseFile.actions.searchCaseNotes = jest.fn(() => ({
          value: [],
          odataCount: 0,
        }));

        await wrapper.vm.searchCaseNotes();

        expect(wrapper.vm.$storage.caseFile.actions.searchCaseNotes).toHaveBeenCalledTimes(1);
      });
    });
  });
});
