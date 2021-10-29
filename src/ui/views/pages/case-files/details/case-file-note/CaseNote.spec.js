import { EFilterType } from '@crctech/component-library/src/types';
import { CaseNoteStorageMock } from '@/store/storage/case-note/storage.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseNote } from '@/entities/case-note';
import { mockStorage } from '@/store/storage';
import Component from './CaseNote.vue';
import CaseNoteForm from './components/CaseNoteForm.vue';
import * as searchEndpoints from '@/constants/searchEndpoints';

const localVue = createLocalVue();
const caseNote = mockCombinedCaseNote();
const storage = mockStorage();

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
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

    describe('Watch dateSortDesc', () => {
      it('sets orderBy in the params', async () => {
        expect(wrapper.vm.dataTableParams.descending).toBe(true);

        await wrapper.setData({
          dateSortDesc: false,
        });

        expect(wrapper.vm.dataTableParams.descending).toBe(false);
      });

      it('calls search', async () => {
        wrapper.vm.search = jest.fn();

        expect(wrapper.vm.search).toHaveBeenCalledTimes(0);

        await wrapper.setData({
          dateSortDesc: false,
        });

        expect(wrapper.vm.search).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('opens the dialog if isBeingCreated is true', async () => {
      await wrapper.setData({ isBeingCreated: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
    });

    it('opens the dialog if isBeingEdited is true', async () => {
      await wrapper.setData({ isBeingEdited: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
    });

    it('calls next if the confirmation dialog returns true', async () => {
      await wrapper.setData({ isBeingCreated: true });
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.$confirm = jest.fn(() => false);
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
    describe('showAddButton', () => {
      it('returns correct value', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: {
              caseNote: new CaseNoteStorageMock().make(),
            },
          },
        });

        await wrapper.setRole('level1');
        expect(wrapper.vm.showAddButton).toBe(true);

        await wrapper.setRole('level6');
        expect(wrapper.vm.showAddButton).toBe(true);

        await wrapper.setRole('contributorFinance');
        expect(wrapper.vm.showAddButton).toBe(true);

        await wrapper.setRole('contributor3');
        expect(wrapper.vm.showAddButton).toBe(true);

        await wrapper.setRole('contributorIM');
        expect(wrapper.vm.showAddButton).toBe(false);

        await wrapper.setRole('read only');
        expect(wrapper.vm.showAddButton).toBe(false);
      });
    });

    describe('caseNotes', () => {
      let caseFiles = [];

      beforeEach(async () => {
        jest.clearAllMocks();

        caseFiles = [
          mockCombinedCaseNote({ id: '1', isPinned: false, created: '2020-01-02' }),
          mockCombinedCaseNote({ id: '2', isPinned: true, created: '2020-01-01' }),
          mockCombinedCaseNote({ id: '3', isPinned: false, created: '2020-01-03' }),
        ];

        storage.caseNote.getters.getByIds = jest.fn(() => caseFiles);

        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });
      });

      it('calls the getByIds getter and sets the result into caseNotes', () => {
        expect(wrapper.vm.caseNotes).toEqual([caseFiles[0], caseFiles[1], caseFiles[2]]);
      });
    });

    describe('title', () => {
      it('should return proper data', async () => {
        wrapper.vm.itemsCount = 99;
        expect(wrapper.vm.title).toEqual('caseNote.caseNotes (99)');
      });
    });

    describe('filterOptions', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: 'Metadata/CaseNoteCategoryName/Translation/en',
            type: EFilterType.MultiSelect,
            label: 'caseNote.category',
            items: wrapper.vm.$storage.caseNote.getters
              .caseNoteCategories()
              .map((c) => ({ text: wrapper.vm.$m(c.name), value: wrapper.vm.$m(c.name) })),
          },
          {
            key: 'Entity/Created',
            type: EFilterType.Date,
            label: 'caseNote.createdDate',
          },
        ]);
      });
    });

    describe('loading', () => {
      it('should be linked to proper state', () => {
        wrapper.vm.$store.state.caseNoteEntities.isLoadingCaseNotes = true;
        expect(wrapper.vm.loading).toEqual(true);

        wrapper.vm.$store.state.caseNoteEntities.isLoadingCaseNotes = false;
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
      it('should call fetchCaseNoteCategories and searchCaseNotes', async () => {
        wrapper.vm.$storage.caseNote.actions.fetchCaseNoteCategories = jest.fn();
        wrapper.vm.search = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.$storage.caseNote.actions.fetchCaseNoteCategories).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.search).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    describe('debounceSearch', () => {
      it('should call search', async () => {
        wrapper.vm.search = jest.fn();

        wrapper.vm.debounceSearch();
        await new Promise((resolve) => setTimeout(resolve, 600));

        expect(wrapper.vm.search).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchData', () => {
      it('should call storage', async () => {
        wrapper.vm.$storage.caseNote.actions.search = jest.fn();

        wrapper.vm.$route = {
          params: {
            id: 'id',
          },
        };

        const params = {
          search: '',
          orderBy: 'Entity/Created',
          descending: true,
          pageIndex: 1,
          pageSize: 1000,
        };

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseNote.actions.search).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$storage.caseNote.actions.search).toHaveBeenLastCalledWith(
          {
            ...params,
            filter: { 'Entity/CaseFileId': 'id' },
            count: true,
            queryType: 'full',
            searchMode: 'all',
          },
          searchEndpoints.CASE_NOTES,
          true,
        );
      });
    });

    describe('pinCaseNote', () => {
      it('should call storage', async () => {
        wrapper.vm.$storage.caseNote.actions.pinCaseNote = jest.fn();

        const id = 'case file id';
        wrapper.vm.$route = {
          params: { id },
        };
        const { isPinned } = caseNote;

        await wrapper.vm.pinCaseNote(caseNote);

        expect(wrapper.vm.$storage.caseNote.actions.pinCaseNote).toHaveBeenCalledWith(id, caseNote.entity.id, !isPinned);
      });
      it('should update isPinned in case note', async () => {
        const mockCaseNote = {
          entity: {
            id: 'id',
            isPinned: false,
          },
        };

        await wrapper.vm.pinCaseNote(mockCaseNote);

        expect(mockCaseNote.entity.isPinned).toBe(true);
      });
    });
  });
});
