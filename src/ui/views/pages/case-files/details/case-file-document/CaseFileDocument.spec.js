/**
 * @group ui/components/case-file
 */

import { EFilterType } from '@crctech/component-library/src/types';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseFileDocument, DocumentStatus } from '@/entities/case-file-document';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockUserStateLevel } from '@/test/helpers';
import routes from '@/constants/routes';

import helpers from '@/ui/helpers/helpers';
import moment from '@/ui/plugins/moment';
import Component from './CaseFileDocument.vue';

const localVue = createLocalVue();
let storage;
const document = mockCombinedCaseFileDocument();
let mockDocumentMapped;

describe('CaseFileDocument.vue', () => {
  let wrapper;
  const options = mockOptionItemData();

  storage = {
    caseFileDocument: {
      getters: {
        getByIds: jest.fn(() => [document]),
        categories: jest.fn(() => options),
        getByCaseFile: jest.fn(() => [document]),
      },
      actions: {
        search: jest.fn(),
        fetchCategories: jest.fn(() => options),
        fetchAll: jest.fn(() => [document]),
        deactivate: jest.fn(() => document),
        downloadDocumentAsUrl: jest.fn(() => 'url'),
      },
    },
  };

  const mountWrapper = (canEdit = true, canAdd = true, canDelete = true, canDownload = true) => {
    jest.clearAllMocks();

    mockDocumentMapped = {
      name: document.entity.name,
      id: document.entity.id,
      category: options[0].name.translation.en,
      documentStatus: document.entity.documentStatus,
      documentStatusName: document.metadata.documentStatusName.translation.en,
      created: 'Jul 20, 2021',
      entity: document.entity,
    };

    wrapper = shallowMount(Component, {
      localVue,
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
      mocks: { $storage: storage },
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
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canAdd).toBeTruthy();

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
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });

      it('returns true if user does not have level but hasRole is called with contributor3', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          mocks: {
            $storage: storage,
            $hasLevel: () => false,
            $hasRole: (r) => r === 'contributor3',
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
            $storage: storage,
            $hasLevel: () => false,
            $hasRole: (r) => r !== 'contributor3',
          },
        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          store: {
            modules: {
              user: {
                state: {
                  oid: '7',
                  email: 'test@test.ca',
                  family_name: 'Joe',
                  given_name: 'Pink',
                  roles: ['contributorIM'],
                },
              },
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canAdd).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1 and not readonly', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();

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
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          store: {
            modules: {
              user: {
                state: {
                  oid: '7',
                  email: 'test@test.ca',
                  family_name: 'Joe',
                  given_name: 'Pink',
                  roles: ['contributorIM'],
                },
              },
            },
          },
          mocks: {
            $storage: storage,
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
          store: {
            ...mockUserStateLevel(1),
          },
          mocks: {
            $storage: storage,
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
          mocks: {
            $storage: storage,
            $hasLevel: () => false,
            $hasRole: (r) => r === 'contributor3',
          },
        });

        expect(wrapper.vm.canDownload).toBeTruthy();
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          mocks: {
            $storage: storage,
            $hasLevel: () => false,
            $hasRole: (r) => r !== 'contributor3',
          },
        });

        expect(wrapper.vm.canDownload).toBeFalsy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          store: {
            modules: {
              user: {
                state: {
                  oid: '7',
                  email: 'test@test.ca',
                  family_name: 'Joe',
                  given_name: 'Pink',
                  roles: ['contributorIM'],
                },
              },
            },
          },
          mocks: {
            $storage: storage,
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
          store: {
            ...mockUserStateLevel(6),
          },
          mocks: {
            $storage: storage,
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
          store: {
            ...mockUserStateLevel(6),
          },
          mocks: {
            $storage: storage,
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
          store: {
            ...mockUserStateLevel(5),
          },
          mocks: {
            $storage: storage,
          },
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
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: '',
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
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.download,
            width: '5%',
          },
          {
            text: '',
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
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.preview,
            width: '5%',
          },
          {
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.download,
            width: '5%',
          },
          {
            text: '',
            sortable: false,
            value: wrapper.vm.customColumns.edit,
            width: '5%',
          },
          {
            text: '',
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
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
          },
          mocks: {
            $storage: storage,
          },
        });
      });
      it('calls the getByIds getter', async () => {
        await wrapper.setData({
          searchResultIds: ['mock-id'],
        });

        expect(storage.caseFileDocument.getters.getByIds).toHaveBeenCalledWith(['mock-id'], {
          onlyActive: true,
          prependPinnedItems: true,
          baseDate: null,
          parentId: { caseFileId: 'mock-caseFile-id' },
        });
      });

      it('return the mapped documents', async () => {
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.caseFileDocumentsMapped).toEqual([
          {
            name: document.entity.name,
            id: document.entity.id,
            category: wrapper.vm.$m(document.metadata.documentCategoryName),
            created: moment(document.entity.created),
            documentStatus: document.entity.documentStatus,
            documentStatusName: wrapper.vm.$m(document.metadata.documentStatusName),
            entity: document.entity,
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

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
          },
          computed: {
            customColumns() {
              return customColumns;
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.filterOptions).toEqual([
          {
            key: customColumns.name,
            type: EFilterType.Text,
            label: 'common.name',
          },
          {
            key: customColumns.category,
            type: EFilterType.MultiSelect,
            label: 'caseFile.document.category',
            items: wrapper.vm.$storage.caseFileDocument.getters
              .categories(false)
              .map((c) => ({ text: wrapper.vm.$m(c.name), value: wrapper.vm.$m(c.name) }))
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
        expect(storage.caseFileDocument.actions.fetchCategories).toHaveBeenCalled();
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
          search: '',
          skip: 0,
          top: 10,
        };

        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
          },
          computed: {
            caseFileId() {
              return 'caseFileId';
            },
          },
          mocks: {
            $storage: storage,
          },
        });

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseFileDocument.actions.search).toHaveBeenCalledWith(
          {
            search: params.search,
            filter: {
              and: {
                'Entity/Name': 'a',
                'Entity/CaseFileId': 'caseFileId',
              },
            },
            top: 999,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          },
          null,
          true,
        );
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
        expect(storage.caseFileDocument.actions.deactivate).toHaveBeenCalledWith({ id: mockDocumentMapped.id, caseFileId: wrapper.vm.caseFileId });
      });
      it('doesnt call deactivate if no confirmation', async () => {
        mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteDocument(mockDocumentMapped);
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.document.confirm.delete.title',
          messages: 'caseFile.document.confirm.delete.message',
        });
        expect(storage.caseFileDocument.actions.deactivate).toHaveBeenCalledTimes(0);
      });
    });

    describe('download', () => {
      it('calls storage on download', () => {
        mountWrapper(false);
        wrapper.vm.download(document);
        expect(storage.caseFileDocument.actions.downloadDocumentAsUrl).toHaveBeenCalledWith(document.entity, true);
      });
    });

    describe('preview', () => {
      it('calls storage on preview', () => {
        mountWrapper(false);
        window.open = jest.fn();
        wrapper.vm.preview(document);
        expect(storage.caseFileDocument.actions.downloadDocumentAsUrl).toHaveBeenCalledWith(document.entity, false);
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
