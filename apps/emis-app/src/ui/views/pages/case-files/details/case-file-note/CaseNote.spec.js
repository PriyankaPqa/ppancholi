import { EFilterType } from '@libs/component-lib/types';
import { CaseNoteStorageMock } from '@/storage/case-note/storage.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseNote } from '@libs/entities-lib/case-note';
import { mockStorage } from '@/storage';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import * as searchEndpoints from '@/constants/searchEndpoints';
import { getPiniaForUser } from '@/pinia/user/user.spec';
import Component from './CaseNote.vue';
import CaseNoteForm from './components/CaseNoteForm.vue';

const localVue = createLocalVue();
const caseNote = mockCombinedCaseNote();
const storage = mockStorage();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        id: 'id',
      },
      computed: {
        event() {
          return mockEvent;
        },
      },
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

    it('opens the dialog if change is detected', async () => {
      wrapper.vm.$refs.observer = {
        flags: {
          changed: true,
        },
      };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
    });

    it('calls next if the confirmation dialog returns true', async () => {
      wrapper.vm.$confirm = jest.fn(() => true);
      wrapper.vm.$refs.observer = {
        flags: {
          changed: true,
        },
      };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.$confirm = jest.fn(() => false);
      wrapper.vm.$refs.observer = {
        flags: {
          changed: true,
        },
      };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if no change detected', async () => {
      wrapper.vm.$refs.observer = {
        flags: {
          changed: false,
        },
      };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });
  });

  describe('Computed', () => {
    describe('showAddButton', () => {
      it('returns correct value', async () => {
        const doMount = (level) => {
          wrapper = shallowMount(Component, {
            localVue,
            pinia: getPiniaForUser(level),
            propsData: {
              id: 'id',
            },
            computed: {
              event() {
                return mockEvent;
              },
            },
            mocks: {
              $storage: {
                caseNote: new CaseNoteStorageMock().make(),
              },
            },
          });
        };

        await wrapper.setData({
          caseFile: {
            ...wrapper.vm.caseFile,
            readonly: false,
          },
        });
        doMount('level1');
        expect(wrapper.vm.showAddButton).toBe(true);

        doMount('level6');
        expect(wrapper.vm.showAddButton).toBe(true);

        doMount('contributorFinance');
        expect(wrapper.vm.showAddButton).toBe(true);

        doMount('contributor3');
        expect(wrapper.vm.showAddButton).toBe(true);

        doMount('contributorIM');
        expect(wrapper.vm.showAddButton).toBe(false);

        doMount('readOnly');
        expect(wrapper.vm.showAddButton).toBe(false);

        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser('level1'),
          propsData: {
            id: 'id',
          },
          mocks: {
            $storage: {
              caseNote: new CaseNoteStorageMock().make(),
            },
          },
          computed: {
            readonly() {
              return true;
            },
            event() {
              return mockEvent;
            },
          },
        });

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
          propsData: {
            id: 'id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
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
      it('should return proper data', () => {
        wrapper.vm.$store.state.caseNoteEntities.searchLoading = true;
        expect(wrapper.vm.title).toEqual('caseNote.caseNotes (...)');
        wrapper.vm.$store.state.caseNoteEntities.searchLoading = false;
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
        wrapper.vm.$store.state.caseNoteEntities.searchLoading = true;
        expect(wrapper.vm.loading).toEqual(true);

        wrapper.vm.$store.state.caseNoteEntities.searchLoading = false;
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
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));

        expect(wrapper.vm.search).toHaveBeenCalledTimes(1);
      });
    });

    describe('fetchData', () => {
      it('should call storage', async () => {
        wrapper.vm.$storage.caseNote.actions.search = jest.fn();

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
        const { isPinned } = caseNote;

        await wrapper.vm.pinCaseNote(caseNote);

        expect(wrapper.vm.$storage.caseNote.actions.pinCaseNote).toHaveBeenCalledWith(wrapper.vm.caseFileId, caseNote.entity.id, !isPinned);
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
