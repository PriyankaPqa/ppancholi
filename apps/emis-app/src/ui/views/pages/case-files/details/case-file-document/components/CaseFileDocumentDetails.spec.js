import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCombinedCaseFileDocuments } from '@libs/entities-lib/case-file-document';
import { mockStorage } from '@/storage';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import routes from '@/constants/routes';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';

import { useMockCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document.mock';
import Component from './CaseFileDocumentDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

const { pinia, caseFileDocumentStore } = useMockCaseFileDocumentStore();

describe('CaseFileDocumentDetails', () => {
  let wrapper;
  let mockDocument;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'mock-caseFile-id',
        documentId: 'mock-document-id',
      },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDocument = mockCombinedCaseFileDocuments()[0].entity;
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('returns true if only if level1+ and not readonly', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canEdit).toBeTruthy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canEdit).toBeFalsy();
        await mountWrapper(
          false,
          1,
          null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canDelete', () => {
      it('returns true if only if level6', async () => {
        await mountWrapper(false, 1);
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, 6);
        expect(wrapper.vm.canDelete).toBeTruthy();
        await mountWrapper(false, null, 'readonly');
        expect(wrapper.vm.canDelete).toBeFalsy();
        await mountWrapper(false, null, 'contributor3');
        expect(wrapper.vm.canDelete).toBeFalsy();
      });
    });

    describe('document', () => {
      it('calls the document getter', async () => {
        await mountWrapper();
        expect(caseFileDocumentStore.getById).toHaveBeenCalledTimes(1);
      });
      it('sets the right data', async () => {
        await mountWrapper();
        expect(JSON.stringify(wrapper.vm.document)).toEqual(JSON.stringify(mockDocument));
      });
    });

    describe('category', () => {
      it('calls the getter categories', async () => {
        await mountWrapper();
        expect(caseFileDocumentStore.getCategories).toHaveBeenCalledWith(false);
      });

      it('returns the right category', async () => {
        await mountWrapper();
        expect(wrapper.vm.category).toEqual(mockOptionItemData()[0].name.translation.en);
      });

      it('returns the right category if category is other', async () => {
        caseFileDocumentStore.getCategories = jest.fn(() => ([{ ...mockOptionItemData()[0], isOther: true }]));
        await mountWrapper(false, 6, null, {
          computed:
           {
             document() {
               return {
                 ...mockDocument,
                 category: { optionItemId: mockOptionItemData()[0].id, specifiedOther: 'foo' },
               };
             },
           },
        });
        expect(wrapper.vm.category).toEqual('foo');
      });
    });

    describe('documentData', () => {
      it('returns the right data', async () => {
        await mountWrapper();

        expect(wrapper.vm.documentData).toEqual([
          {
            label: 'caseFile.document.category',
            data: 'Flood',
            test: 'category',
          },
          {
            label: 'caseFile.document.dateAdded',
            data: 'Apr 6, 2021',
            test: 'method',
          },
          {
            label: 'caseFile.document.notes',
            data: 'notes...',
            test: 'notes',
          },
        ]);
      });
    });

    describe('documentEditRoute', () => {
      it('should redirect to the case document edit page', async () => {
        await mountWrapper();
        expect(wrapper.vm.documentEditRoute).toEqual({
          name: routes.caseFile.documents.edit.name,
          params: {
            documentId: 'mock-document-id',
          },
        });
      });
    });
  });

  describe('lifecycle - create', () => {
    it('should call fetchCategories', async () => {
      await mountWrapper();
      expect(caseFileDocumentStore.fetchCategories).toHaveBeenCalledTimes(1);
    });

    it('should call fetch', async () => {
      await mountWrapper();
      expect(caseFileDocumentStore.fetch).toHaveBeenCalledWith({ caseFileId: 'mock-caseFile-id', id: 'mock-document-id' }, true);
    });
  });

  describe('Template', () => {
    describe('document data', () => {
      let element;
      beforeEach(async () => {
        await mountWrapper(false, 5, null, {
          computed: {
            documentData() {
              return [{
                label: 'mock-label',
                data: 'mock-data',
                test: 'mock-test',
              }];
            },
          },
        });
        element = wrapper.findDataTest('document_details_mock-test');
      });
      it('displays the right label', () => {
        expect(element.text()).toContain('mock-label');
      });
      it('contains the right data', () => {
        expect(element.text()).toContain('mock-data');
      });
    });

    describe('back button', () => {
      let element;
      beforeEach(async () => {
        await mountWrapper();
        element = wrapper.findDataTest('document_details_back_btn');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls goToDocuments when clicked', async () => {
        jest.spyOn(wrapper.vm, 'goToDocuments').mockImplementation(() => {});
        await element.vm.$emit('click');
        expect(wrapper.vm.goToDocuments).toHaveBeenCalledTimes(1);
      });
    });

    describe('edit button', () => {
      let element;
      it('renders when canEdit', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            canEdit: () => true,
          },
        });
        element = wrapper.findDataTest('editDocument-link');
        expect(element.exists()).toBeTruthy();
        await mountWrapper(false, 6, null, {
          computed: {
            canEdit: () => false,
          },
        });
        element = wrapper.findDataTest('editDocument-link');
        expect(element.exists()).toBeFalsy();
      });

      it('is linked to edit route', async () => {
        await mountWrapper();
        element = wrapper.findDataTest('editDocument-link');
        expect(element.props('to')).toEqual(wrapper.vm.documentEditRoute);
      });
    });

    describe('delete button', () => {
      let element;
      it('renders when canDelete', async () => {
        await mountWrapper(false, 6, null, {
          computed: {
            canDelete: () => true,
          },
        });
        element = wrapper.findDataTest('deleteDocument-link');
        expect(element.exists()).toBeTruthy();
        await mountWrapper(false, 6, null, {
          computed: {
            canDelete: () => false,
          },
        });
        element = wrapper.findDataTest('deleteDocument-link');
        expect(element.exists()).toBeFalsy();
      });

      it('calls deleteDocument when clicked', async () => {
        await mountWrapper();
        wrapper.vm.deleteDocument = jest.fn();
        element = wrapper.findDataTest('deleteDocument-link');
        await element.vm.$emit('click');
        expect(wrapper.vm.deleteDocument).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('goToDocuments', () => {
      it('should redirect to the case document home page', async () => {
        await mountWrapper();
        wrapper.vm.goToDocuments();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.documents.home.name,
        });
      });
    });

    describe('deleteDocument', () => {
      it('calls deactivate after confirmation and then goes to documents', async () => {
        await mountWrapper();
        await wrapper.vm.deleteDocument();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.document.confirm.delete.title',
          messages: 'caseFile.document.confirm.delete.message',
        });
        expect(caseFileDocumentStore.deactivate)
          .toHaveBeenCalledWith({ caseFileId: 'mock-caseFile-id', id: 'mock-document-id' });
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.documents.home.name,
        });
      });
      it('doesnt call deactivate if no confirmation', async () => {
        await mountWrapper();
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.deleteDocument();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith(
          {
            title: 'caseFile.document.confirm.delete.title',
            messages: 'caseFile.document.confirm.delete.message',
          },
        );
        expect(caseFileDocumentStore.deactivate)
          .toHaveBeenCalledTimes(0);
      });
    });
  });
});
