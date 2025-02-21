import { EFilterKeyType, EFilterType } from '@libs/component-lib/types';
import { useMockCaseNoteStore } from '@/pinia/case-note/case-note.mock';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { UserRoles } from '@libs/entities-lib/user';

import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './CaseNote.vue';
import CaseNoteForm from './components/CaseNoteForm.vue';

const localVue = createLocalVue();
const caseNote = mockCaseNoteEntity();

const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;
const { pinia, caseNoteStore } = useMockCaseNoteStore();
useMockCaseFileStore(pinia);
const userStore = useMockUserAccountStore(pinia).userAccountStore;

describe('CaseNote.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'id',
      },
      computed: {
        event() {
          return mockEvent;
        },
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

    describe('FilterToolbar', () => {
      it('should pass props filterState', async () => {
        await wrapper.setData({
          filterState: { filterStateItem: 3 },
        });
        const component = wrapper.findComponent(FilterToolbar);
        const props = 'initialFilter';
        expect(component.props(props)).toBe(wrapper.vm.filterState);
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
    const doMount = (level, otherComputed) => {
      const pinia = getPiniaForUser(level);
      useMockCaseFileStore(pinia);
      useMockUserAccountStore(pinia);
      useMockCaseNoteStore(pinia);

      return shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'id',
        },
        computed: {
          event() {
            return mockEvent;
          },
          ...otherComputed,
        },
      });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('showAddButton', () => {
      it('returns correct value', async () => {
        wrapper = doMount(UserRoles.level0);
        expect(wrapper.vm.showAddButton).toBe(true);

        wrapper = doMount(UserRoles.level6);
        expect(wrapper.vm.showAddButton).toBe(true);

        wrapper = doMount(UserRoles.contributorFinance);
        expect(wrapper.vm.showAddButton).toBe(true);

        wrapper = doMount(UserRoles.contributor3);
        expect(wrapper.vm.showAddButton).toBe(true);

        wrapper = doMount(UserRoles.contributorIM);
        expect(wrapper.vm.showAddButton).toBe(false);

        wrapper = doMount('readOnly');
        expect(wrapper.vm.showAddButton).toBe(false);

        const pinia = getPiniaForUser(UserRoles.level1);
        useMockCaseFileStore(pinia);
        useMockUserAccountStore(pinia);
        useMockCaseNoteStore(pinia);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'id',
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
      let caseNotes = [];

      beforeEach(async () => {
        jest.clearAllMocks();

        caseNotes = [
          mockCaseNoteEntity({ id: '1', isPinned: false, created: '2020-01-02' }),
          mockCaseNoteEntity({ id: '2', isPinned: true, created: '2020-01-01' }),
          mockCaseNoteEntity({ id: '3', isPinned: false, created: '2020-01-03' }),
        ];
        caseNoteStore.getByIdsWithPinnedItems = jest.fn(() => caseNotes);

        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
        });
      });

      it('calls the getByIds getter and sets the result into caseNotes', () => {
        expect(wrapper.vm.caseNotes).toEqual([caseNotes[0], caseNotes[1], caseNotes[2]]);
      });
    });

    describe('title', () => {
      it('should return proper data ', () => {
        caseNoteStore.searchLoading = true;
        expect(wrapper.vm.title).toEqual('caseNote.caseNotes (...)');
      });

      it('should return proper data when loading is true', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'id',
          },
          computed: {
            event() {
              return mockEvent;
            },
            loading() {
              return false;
            },
            caseNotes() {
              return [mockCaseNoteEntity({ id: '1', isPinned: false, created: '2020-01-02' }),
                mockCaseNoteEntity({ id: '2', isPinned: true, created: '2020-01-01' })];
            },
          },
        });
        expect(wrapper.vm.title).toEqual('caseNote.caseNotes (2)');
      });
    });

    describe('filterOptions', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: 'Metadata/CaseNoteCategoryName/Translation/en',
            type: EFilterType.MultiSelect,
            label: 'caseNote.category',
            items: caseNoteStore.getCaseNoteCategories()
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
        caseNoteStore.searchLoading = true;
        expect(wrapper.vm.loading).toEqual(true);
        caseNoteStore.searchLoading = false;
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
        caseNoteStore.fetchCaseNoteCategories = jest.fn();
        wrapper.vm.search = jest.fn();
        jest.clearAllMocks();

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(userStore.fetchRoles).toHaveBeenCalledTimes(1);
        expect(caseNoteStore.fetchCaseNoteCategories).toHaveBeenCalledTimes(1);
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
      it('should call search', async () => {
        caseNoteStore.search = jest.fn();

        const params = {
          orderBy: 'Entity/Created',
          descending: true,
          pageIndex: 1,
          pageSize: 1000,
        };

        await wrapper.vm.fetchData(params);

        expect(caseNoteStore.search).toHaveBeenCalledTimes(1);
        expect(caseNoteStore.search).toHaveBeenLastCalledWith({ params:
          {
            ...params,
            filter: { 'Entity/CaseFileId': { value: 'id', type: EFilterKeyType.Guid } },
            count: true,
          },
        includeInactiveItems: true });
      });
    });

    describe('pinCaseNote', () => {
      it('should call pinCaseNote', async () => {
        caseNoteStore.pinCaseNote = jest.fn();
        const { isPinned } = caseNote;

        await wrapper.vm.pinCaseNote(caseNote);

        expect(caseNoteStore.pinCaseNote).toHaveBeenCalledWith(
          { caseFileId: wrapper.vm.caseFileId, caseNoteId: caseNote.id, isPinned: !isPinned },
        );
      });
      it('should update isPinned in case note', async () => {
        const mockCaseNote = {
          id: 'id',
          isPinned: false,
        };

        await wrapper.vm.pinCaseNote(mockCaseNote);

        expect(mockCaseNote.isPinned).toBe(true);
      });
    });
  });
});
