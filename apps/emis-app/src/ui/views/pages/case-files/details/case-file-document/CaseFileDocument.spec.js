import { EFilterType } from '@libs/component-lib/types';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileDocumentEntity, DocumentStatus } from '@libs/entities-lib/case-file-document';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import { mockCombinedCaseFile } from '@libs/entities-lib/case-file';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document';
import { UserRoles } from '@libs/entities-lib/user';
import Component from './CaseFileDocument.vue';

const localVue = createLocalVue();
const document = mockCaseFileDocumentEntity();
let mockDocumentMapped;
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

let caseFileDocumentStore;

describe('CaseFileDocument.vue', () => {
  let wrapper;
  const options = mockOptionItemData();

  const mountWrapper = (canEdit = true, canAdd = true, canDelete = true, canDownload = true) => {
    jest.clearAllMocks();
    const pinia = useMockCaseFileDocumentStore().pinia;
    caseFileDocumentStore = useMockCaseFileDocumentStore(pinia).caseFileDocumentStore;

    mockDocumentMapped = {
      name: document.name,
      id: document.id,
      category: options[0].name.translation.en,
      documentStatus: document.documentStatus,
      documentStatusName: 'Current',
      created: 'Jul 2, 2021',
      entity: document,
    };
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: { id: 'mock-id' },
      computed: {
        canEdit() {
          return canEdit;
        },
        canAdd() {
          return canAdd;
        },
        canDelete() {
          return canDelete;
        },
        canDownload() {
          return canDownload;
        },
        caseFileDocumentsMapped() {
          return [mockDocumentMapped];
        },
      },
    });
  };

  describe('Template', () => {
    describe('case-file-documents-table', () => {
      it('should exist', async () => {
        mountWrapper();
        expect(wrapper.findDataTest('case-file-documents-table').exists()).toBeTruthy();
      });

      it('should be bound to the items', async () => {
        mountWrapper();
        const test = wrapper.vm.caseFileDocumentsMapped[0];
        expect(wrapper.findDataTest('case-file-documents-table').props('items').length).toEqual(wrapper.vm.caseFileDocumentsMapped.length);
        Object.keys(wrapper.vm.customColumns)
          .filter((c) => c !== 'edit' && c !== 'preview' && c !== 'download' && c !== 'delete')
          .forEach((c) => expect(Object.keys(test)).toContain(c));
      });
    });

    describe('add button', () => {
      it('exists when add = true', async () => {
        mountWrapper();
        expect(wrapper.findDataTest('case-file-documents-table').props('showAddButton')).toBeTruthy();
      });
      it('doesnt exist when edit = false', async () => {
        mountWrapper(true, false);
        expect(wrapper.findDataTest('case-file-documents-table').props('showAddButton')).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('canAdd', () => {
      it('returns true if user has level 1 and not readonly', () => {
        let pinia = getPiniaForUser(UserRoles.level1);
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          pinia,
          computed: {
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canAdd).toBeTruthy();
        pinia = getPiniaForUser(UserRoles.level1);
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            readonly() {
              return true;
            },
          },
        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });

      it('returns true if user does not have level but hasRole is called with contributor3', () => {
        const pinia = useMockCaseFileDocumentStore().pinia;
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
          mocks: {
            $hasLevel: () => false,
            $hasRole: (r) => r === UserRoles.contributor3,
          },
        });

        expect(wrapper.vm.canAdd).toBeTruthy();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          mocks: {
            $hasLevel: () => false,
            $hasRole: (r) => r !== UserRoles.contributor3,
          },
        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser(UserRoles.contributorIM),
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },

        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1 and not readonly', () => {
        let pinia = getPiniaForUser(UserRoles.level1);
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canEdit).toBeTruthy();

        pinia = getPiniaForUser(UserRoles.level2);
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            readonly() {
              return true;
            },
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser(UserRoles.contributorIM),
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canDownload', () => {
      it('returns true if user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          pinia: getPiniaForUser(UserRoles.level1),
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canDownload).toBeTruthy();
      });

      it('returns true if user does not have level but hasRole is called with contributor3', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },
          mocks: {
            $hasLevel: () => false,
            $hasRole: (r) => r === UserRoles.contributor3,
          },
        });

        expect(wrapper.vm.canDownload).toBeTruthy();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },
          mocks: {

            $hasLevel: () => false,
            $hasRole: (r) => r !== UserRoles.contributor3,
          },
        });

        expect(wrapper.vm.canDownload).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia: getPiniaForUser(UserRoles.contributorIM),
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canDownload).toBeFalsy();
      });
    });

    describe('canDelete', () => {
      it('returns true if user has level 6 and not readonly', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },

        });

        expect(wrapper.vm.canDelete).toBeTruthy();

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            readonly() {
              return true;
            },
          },

        });

        expect(wrapper.vm.canDelete).toBeFalsy();
      });

      it('returns false if user does not have level 6', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },
          pinia: getPiniaForUser(UserRoles.level5),

        });

        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });

    describe('headers', () => {
      it('has the right value if the user cannot delete or edit', () => {
        mountWrapper(false, true, false);
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '40%',
          },
          {
            text: 'caseFile.document.category',
            sortable: true,
            value: wrapper.vm.customColumns.category,
          },
          {
            text: 'caseFile.document.dateAdded',
            sortable: true,
            value: wrapper.vm.customColumns.created,
          },
          {
            text: 'caseFile.document.status',
            sortable: true,
            value: wrapper.vm.customColumns.documentStatusName,
          },
          {
            text: 'caseFile.document.preview',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: 'common.download',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.download,
            width: '5%',
          },
        ]);
      });

      it('has the right value if the user can edit and cannot delete', () => {
        mountWrapper(true, true, false);
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '40%',
          },
          {
            text: 'caseFile.document.category',
            sortable: true,
            value: wrapper.vm.customColumns.category,
          },
          {
            text: 'caseFile.document.dateAdded',
            sortable: true,
            value: wrapper.vm.customColumns.created,
          },
          {
            text: 'caseFile.document.status',
            sortable: true,
            value: wrapper.vm.customColumns.documentStatusName,
          },
          {
            text: 'caseFile.document.preview',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: 'common.download',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.download,
            width: '5%',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.edit,
            width: '5%',
          },
        ]);
      });

      it('has the right value if the user can edit and delete', () => {
        mountWrapper(true, true, true);
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '40%',
          },
          {
            text: 'caseFile.document.category',
            sortable: true,
            value: wrapper.vm.customColumns.category,
          },
          {
            text: 'caseFile.document.dateAdded',
            sortable: true,
            value: wrapper.vm.customColumns.created,
          },
          {
            text: 'caseFile.document.status',
            sortable: true,
            value: wrapper.vm.customColumns.documentStatusName,
          },
          {
            text: 'caseFile.document.preview',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: 'common.download',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.download,
            width: '5%',
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.edit,
            width: '5%',
          },
          {
            text: 'common.delete',
            class: 'rc-transparent-text',
            sortable: false,
            value: wrapper.vm.customColumns.delete,
            width: '5%',
          },
        ]);
      });

      it('does not include download if the user cannot download', () => {
        mountWrapper(true, true, true, true);
        expect(wrapper.vm.headers.map((x) => x.value)).toContain(wrapper.vm.customColumns.download);
        mountWrapper(true, true, true, false);
        expect(wrapper.vm.headers.map((x) => x.value)).not.toContain(wrapper.vm.customColumns.download);
      });
    });

    describe('caseFileDocumentsMapped', () => {
      beforeEach(async () => {
        const pinia = useMockCaseFileDocumentStore().pinia;

        caseFileDocumentStore = useMockCaseFileDocumentStore(pinia).caseFileDocumentStore;
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
          },
        });
        caseFileDocumentStore.getByIdsWithPinnedItems = jest.fn(() => [document]);

        helpers.getOptionItemNameFromListOption = jest.fn(() => 'category-name');
      });

      it('calls the getByIds and return correct data', async () => {
        await wrapper.setData({
          searchResultIds: ['mock-id'],
        });

        expect(caseFileDocumentStore.getByIdsWithPinnedItems).toHaveBeenCalledWith(['mock-id'], {
          onlyActive: true,
          baseDate: null,
          parentId: { caseFileId: 'mock-caseFile-id' },
        });

        expect(wrapper.vm.caseFileDocumentsMapped).toEqual([
          {
            name: document.name,
            id: document.id,
            category: 'category-name',
            created: 'Apr 6, 2021',
            documentStatus: document.documentStatus,
            documentStatusName: 'enums.DocumentStatus.Past',
            entity: document,
          },
        ]);
      });
    });

    describe('filterOptions', () => {
      it('returns the correct value', () => {
        const customColumns = {
          name: 'name',
          category: 'category',
          created: 'created',
          documentStatus: 'documentStatus',
          documentStatusName: 'documentStatusName',
          preview: 'preview',
          download: 'download',
          edit: 'edit',
          delete: 'delete',
        };
        const pinia = useMockCaseFileDocumentStore().pinia;
        useMockCaseFileStore(pinia);
        useCaseFileDocumentStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
          },
          computed: {
            customColumns() {
              return customColumns;
            },
          },
        });

        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: customColumns.name,
            type: EFilterType.Text,
            label: 'common.name',
          },
          {
            key: 'Entity/Category/OptionItemId',
            type: EFilterType.MultiSelect,
            keyType: 'guid',
            label: 'caseFile.document.category',
            items: caseFileDocumentStore
              .getCategories(false)
              .map((c) => ({ text: wrapper.vm.$m(c.name), value: c.id }))
              .sort((a, b) => a.value.localeCompare(b.value)),
          },
          {
            key: customColumns.created,
            type: EFilterType.Date,
            label: 'caseFile.document.dateAdded',
          },
          {
            key: customColumns.documentStatusName,
            type: EFilterType.MultiSelect,
            label: 'caseFile.document.status',
            items: helpers.enumToTranslatedCollection(DocumentStatus, 'enums.DocumentStatus', true),
          },
        ]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchCategories', () => {
        mountWrapper();
        expect(caseFileDocumentStore.fetchCategories).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      it('calls the search action', async () => {
        const params = {
          filter: {
            and: {
              'Entity/Name': 'a',
            },
          },
          orderBy: 'Entity/Name asc',
          skip: 0,
          top: 10,
        };
        const { caseFileDocumentStore, pinia } = useMockCaseFileDocumentStore();
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
          },
          computed: {
            caseFileId() {
              return 'caseFileId';
            },
          },

        });

        caseFileDocumentStore.search = jest.fn();

        await wrapper.vm.fetchData(params);

        expect(caseFileDocumentStore.search).toHaveBeenCalledWith({ params:
          {
            filter: {
              'Entity/CaseFileId': {
                type: 'guid',
                value: 'caseFileId',
              },
              and: {
                'Entity/Name': 'a',
              },
            },
            top: 999,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
          },
        includeInactiveItems: true });
      });
    });

    describe('deleteDocument', () => {
      it('calls deactivate after confirmation', async () => {
        mountWrapper();
        await wrapper.vm.deleteDocument(mockDocumentMapped);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.document.confirm.delete.title',
          messages: 'caseFile.document.confirm.delete.message',
        });
        expect(caseFileDocumentStore.deactivate).toHaveBeenCalledWith({ id: mockDocumentMapped.id, caseFileId: wrapper.vm.caseFileId });
      });
      it('doesnt call deactivate if no confirmation', async () => {
        mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteDocument(mockDocumentMapped);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.document.confirm.delete.title',
          messages: 'caseFile.document.confirm.delete.message',
        });
        expect(caseFileDocumentStore.deactivate).toHaveBeenCalledTimes(0);
      });
    });

    describe('download', () => {
      it('calls the store on download', () => {
        mountWrapper(false);
        wrapper.vm.download(document);
        expect(caseFileDocumentStore.downloadDocumentAsUrl).toHaveBeenCalledWith({ item: document.entity, saveDownloadedFile: true });
      });
    });

    describe('preview', () => {
      it('calls the store on preview', () => {
        mountWrapper(false);
        window.open = jest.fn();
        wrapper.vm.preview(document);
        expect(caseFileDocumentStore.downloadDocumentAsUrl).toHaveBeenCalledWith({ item: document.entity, saveDownloadedFile: false });
      });
    });

    describe('addCaseDocument', () => {
      it('should redirect to the case document add page', async () => {
        mountWrapper();
        wrapper.vm.addCaseDocument();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.documents.add.name,
        });
      });
    });

    describe('getDocumentDetailsRoute', () => {
      it('should redirect to the case document details page', () => {
        mountWrapper();
        jest.clearAllMocks();
        const result = wrapper.vm.getDocumentDetailsRoute('abc');
        expect(result).toEqual({
          name: routes.caseFile.documents.details.name,
          params: {
            documentId: 'abc',
          },
        });
      });
    });

    describe('getDocumentEditRoute', () => {
      it('should redirect to the case document edit page', () => {
        mountWrapper();
        const result = wrapper.vm.getDocumentEditRoute('abc');
        expect(result).toEqual({
          name: routes.caseFile.documents.edit.name,
          params: {
            documentId: 'abc',
          },
        });
      });
    });
  });
});
