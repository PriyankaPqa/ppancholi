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

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
      wrapper.vm.$refs.confirmLeavePopup.open = jest.fn(() => true);
    });

    it('opens the dialog if isBeingCreated is true', async () => {
      await wrapper.setData({ isBeingCreated: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$refs.confirmLeavePopup.open).toHaveBeenCalled();
    });

    it('opens the dialog if isBeingEdited is true', async () => {
      await wrapper.setData({ isBeingEdited: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$refs.confirmLeavePopup.open).toHaveBeenCalled();
    });

    it('calls next if the confirmation dialog returns true', async () => {
      await wrapper.setData({ isBeingCreated: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.$refs.confirmLeavePopup.open = jest.fn(() => false);
      await wrapper.setData({ isBeingCreated: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if isBeingEdited and isBeingCreated are false', async () => {
      await wrapper.setData({ isBeingCreated: false, isBeingEdited: false });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
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

    describe('titleLeave', () => {
      it('returns the right text', () => {
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('returns the right text', () => {
        expect(wrapper.vm.messagesLeave).toEqual(['confirmLeaveDialog.message_1', 'confirmLeaveDialog.message_2']);
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
