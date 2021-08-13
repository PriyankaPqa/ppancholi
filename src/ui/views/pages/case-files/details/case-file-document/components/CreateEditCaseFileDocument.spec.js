/* eslint-disable */
import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { CaseFileDocumentEntity, mockCombinedCaseFileDocument, mockCombinedCaseFileDocuments } from '@/entities/case-file-document';
import Component from './CreateEditCaseFileDocument.vue';
import { mockStorage } from '@/store/storage';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CreateEditDocument', () => {
  let wrapper;
  let mockDocument;
  let actions;

  const mountWrapper = async (isEditMode = true, fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        id: 'CASEFILE_ID',
        documentId: 'DOC_ID',
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
        $route: {
          name: routes.caseFile.documents.add.name,
          params: {
            id: 'CASEFILE_ID',
          },
        },
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    actions = storage.caseFileDocument.actions;
    
    await wrapper.vm.$nextTick();
    wrapper.vm.$refs.documentForm.upload = jest.fn(() => mockDocument)
    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDocument = new CaseFileDocumentEntity(mockCombinedCaseFileDocument().entity);
  });

  describe('LifeCycle', () => {

    describe('created', () => {
      it('calls and loads from the storage on edit and allows for no metadata', async () => {
        await mountWrapper(true);
        expect(actions.fetch).toHaveBeenCalledWith({ id: 'DOC_ID', caseFileId: 'CASEFILE_ID' }, { useMetadataGlobalHandler: false, useEntityGlobalHandler: true });
        expect(wrapper.vm.document).toEqual(new CaseFileDocumentEntity(mockCombinedCaseFileDocuments()[0].entity));
      });

      it('sets a new entity with the casefileid on creating', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.document).not.toEqual(new CaseFileDocumentEntity(mockCombinedCaseFileDocuments()[0].entity))
        expect(wrapper.vm.document.name).toEqual(null);
        expect(wrapper.vm.document.caseFileId).toEqual('CASEFILE_ID');
      });
    });

  });

  describe('Methods', () => {
    describe('back', () => {
      it('calls router back', async () => {
        await mountWrapper(false);
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.back();
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });
    });

    describe('submit', () => {
      it('does not call tryUpload unless form validation succeeds', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        wrapper.vm.tryUpload = jest.fn(() => mockDocument);
        await wrapper.setData({file: {}});
        await wrapper.setData({ document: mockDocument });
        await wrapper.vm.submit();
        expect(wrapper.vm.tryUpload).toHaveBeenCalledTimes(0);
      });

      it('calls tryUpload if isEditMode is false', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.tryUpload = jest.fn(() => mockDocument);
        await wrapper.setData({file: {}});
        await wrapper.setData({ document: mockDocument });
        
        await wrapper.vm.submit();
        expect(wrapper.vm.tryUpload).toHaveBeenCalledTimes(1);
      });

      it('calls updateDocument if isEditMode is true', async () => {
        await mountWrapper(true);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(actions.updateDocument).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the details page when adding', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.tryUpload = jest.fn(() => ({id: 'myNewId'}));
        await wrapper.setData({file: {}});
        await wrapper.setData({ document: mockDocument });

        await wrapper.vm.submit();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.caseFile.documents.details.name, params: { documentId: 'myNewId' },
        });
      });
      
      test('after submitting, the user is redirected to back() when editing', async () => {
        await mountWrapper(true);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$router.back = jest.fn();

        await wrapper.vm.submit();

        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });

      test('after creating an event a toast notification is shown', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.tryUpload = jest.fn(() => mockDocument);
        await wrapper.setData({file: {}});
        await wrapper.setData({ document: mockDocument });
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('document.create.success');
      });

      test('after updating an event a toast notification is shown', async () => {
        await mountWrapper(true);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('document.edit.success');
      });
    });

    describe('tryUpload', () => {
      it('should call uploadNewDocument depending on confirmation', async () => {
        await mountWrapper(false);
        wrapper.vm.uploadNewDocument = jest.fn(() => mockDocument);
        wrapper.vm.$confirm = jest.fn(() => false);
        let res = await wrapper.vm.tryUpload();
        expect(res).toBeNull();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('caseFile.document.confirm.preprocessing.title', 'caseFile.document.confirm.preprocessing.message');
        expect(wrapper.vm.uploadNewDocument).toHaveBeenCalledTimes(0);
        
        wrapper.vm.$confirm = jest.fn(() => true);
        res = await wrapper.vm.tryUpload();
        expect(res).toEqual(mockDocument);
        expect(wrapper.vm.uploadNewDocument).toHaveBeenCalledTimes(1);
      });
    });

    describe('uploadNewDocument', () => {
      it('calls upload with the formData', async () => {
        await mountWrapper(false);
        await wrapper.setData({file: {}});
        await wrapper.setData({ document: mockDocument });
        
        const formData = new FormData();
        formData.append('name', mockDocument.name);
        formData.append('note', mockDocument.note || '');
        formData.append('categoryId', mockDocument.category.optionItemId.toString());
        formData.append('documentStatus', mockDocument.documentStatus.toString());
        formData.append('file', {});

        await wrapper.vm.uploadNewDocument();
        expect(wrapper.vm.$refs.documentForm.upload).toHaveBeenCalledWith(formData, 'case-file/case-files/CASEFILE_ID/documents');
      });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'CASEFILE_ID',
            documentId: 'REF_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.documents.edit.name,
              params: {
                id: 'CASEFILE_ID',
                documentId: 'REF_ID',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if the route is create', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'CASEFILE_ID',
            documentId: 'REF_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.documents.add.name,
              params: {
                id: 'CASEFILE_ID',
                documentId: 'REF_ID',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('submitLabel', () => {
      it('returns common.save if in edit mode', () => {
        mountWrapper(true);

        expect(wrapper.vm.submitLabel).toBe('common.save');
      });

      it('returns common.buttons.add if not in edit mode', () => {
        mountWrapper(false);

        expect(wrapper.vm.submitLabel).toBe('common.buttons.add');
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(async () => {
        await mountWrapper(false, true);
      });

      test('the save button calls the submit method', async () => {
        // eslint-disable-next-line no-underscore-dangle
        wrapper.vm.$refs.form._data.flags.dirty = true;
        await wrapper.vm.$nextTick();

        const spy = jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => { });
        const button = wrapper.findDataTest('save');
        await button.trigger('click');
        expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      test('the cancel button calls the back method', async () => {
        const spy = jest.spyOn(wrapper.vm, 'back').mockImplementation(() => { });
        const button = wrapper.findDataTest('cancel');
        await button.trigger('click');
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });
    });
  });
});
