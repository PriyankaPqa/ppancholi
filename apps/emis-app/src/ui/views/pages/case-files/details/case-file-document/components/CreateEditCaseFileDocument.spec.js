import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import {
  CaseFileDocumentEntity, mockCaseFileDocumentEntities, mockCaseFileDocumentEntity,
} from '@libs/entities-lib/case-file-document';

import { useMockCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document.mock';
import { format } from 'date-fns';
import Component from './CreateEditCaseFileDocument.vue';

const localVue = createLocalVue();

const { pinia, caseFileDocumentStore } = useMockCaseFileDocumentStore();

describe('CreateEditDocument', () => {
  let wrapper;
  let mockDocument;

  const mountWrapper = async (isEditMode = true, fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
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
        $hasLevel: (lvl) => lvl <= `level${level}`,
        $route: {
          name: routes.caseFile.documents.add.name,
          params: {
            id: 'CASEFILE_ID',
          },
        },

      },
      ...additionalOverwrites,
    });

    wrapper.vm.$refs.documentForm.upload = jest.fn(() => mockDocument);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDocument = new CaseFileDocumentEntity(mockCaseFileDocumentEntity());
  });

  describe('LifeCycle', () => {
    describe('created', () => {
      it('calls and loads from the storage on edit', async () => {
        await mountWrapper(true);
        expect(caseFileDocumentStore.fetch).toHaveBeenCalledWith({ id: 'DOC_ID', caseFileId: 'CASEFILE_ID' });
        expect(wrapper.vm.document).toEqual(new CaseFileDocumentEntity(mockCaseFileDocumentEntities()[0]));
      });

      it('sets a new entity with the casefileid on creating', async () => {
        await mountWrapper(false);
        expect(wrapper.vm.document).not.toEqual(new CaseFileDocumentEntity(mockCaseFileDocumentEntity()));
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
        await wrapper.setData({ file: {} });
        await wrapper.setData({ document: mockDocument });
        await wrapper.vm.submit();
        expect(wrapper.vm.tryUpload).toHaveBeenCalledTimes(0);
      });

      it('calls tryUpload if isEditMode is false', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.tryUpload = jest.fn(() => mockDocument);
        await wrapper.setData({ file: {} });
        await wrapper.setData({ document: mockDocument });

        await wrapper.vm.submit();
        expect(wrapper.vm.tryUpload).toHaveBeenCalledTimes(1);
      });

      it('calls updateDocument if isEditMode is true', async () => {
        await mountWrapper(true);

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.submit();
        expect(caseFileDocumentStore.updateDocument).toHaveBeenCalledTimes(1);
      });

      test('after submitting, the user is redirected to the details page when adding', async () => {
        await mountWrapper(false);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.tryUpload = jest.fn(() => ({ id: 'myNewId' }));
        await wrapper.setData({ file: {} });
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
        await wrapper.setData({ file: {} });
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
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: 'caseFile.document.confirm.preprocessing.title',
          messages: 'caseFile.document.confirm.preprocessing.message',
        });
        expect(wrapper.vm.uploadNewDocument).toHaveBeenCalledTimes(0);

        wrapper.vm.$confirm = jest.fn(() => true);
        res = await wrapper.vm.tryUpload();
        expect(res).toEqual(mockDocument);
        expect(wrapper.vm.uploadNewDocument).toHaveBeenCalledTimes(1);
      });
    });

    describe('uploadNewDocument', () => {
      it('calls upload with the formData with auto-naming', async () => {
        await mountWrapper(false, false, 5, {
          computed: {
            category: () => 'mock-catgory-name',
          },
        });
        await wrapper.setData({ file: {} });
        await wrapper.setData({ document: mockDocument });

        const formData = new FormData();
        const autoNaming = `${wrapper.vm.category} - ${format(new Date(), 'yyyyMMdd-HHmmss')}`;
        formData.set('name', autoNaming);
        formData.set('note', mockDocument.note || '');
        formData.set('categoryId', mockDocument.category.optionItemId.toString());
        formData.set('documentStatus', mockDocument.documentStatus.toString());
        formData.set('file', {});

        await wrapper.vm.uploadNewDocument();
        expect(wrapper.vm.$refs.documentForm.upload).toHaveBeenCalledWith(formData, 'case-file/case-files/CASEFILE_ID/documents');
      });

      it('should format date correctly', async () => {
        let time = new Date('2020-01-02 03:04:05');
        expect(format(time, 'yyyyMMdd-HHmmss')).toEqual('20200102-030405');
        time = new Date('2021-11-12 13:14:15');
        expect(format(time, 'yyyyMMdd-HHmmss')).toEqual('20211112-131415');
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
