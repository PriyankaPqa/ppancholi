/**
 * @group ui/components/case-file
 */

/* eslint-disable */
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { CaseFileDocumentEntity, mockCombinedCaseFileDocument, CaseFileDocumentMethod, DocumentStatus } from '@/entities/case-file-document';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import Component from './CaseFileDocumentForm.vue';
import DownloadComponent from './DownloadViewDocument.vue';
import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CaseFileDocumentForm.vue', () => {
  let wrapper;
  let document;

  const mountWrapper = async (isEditMode = true, fullMount = false, level = 5, additionalOverwrites = {}) => {

    document = document || (isEditMode ? mockCombinedCaseFileDocument().entity : new CaseFileDocumentEntity());

    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        isEditMode,
        document: new CaseFileDocumentEntity(document),
        isDirty: false,
      },
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    wrapper.vm.uploadForm = jest.fn(() => document)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document = null;
  });

  describe('created', () => {
    describe('data', () => {
      it('is initialized with props', async () => {
        document = new CaseFileDocumentEntity(mockCombinedCaseFileDocument().entity);
        document.documentStatus = DocumentStatus.Past;
        await mountWrapper();
        expect(wrapper.vm.localDocument).toEqual(document);

        document.documentStatus = DocumentStatus.Current;
        await mountWrapper();
        expect(wrapper.vm.localDocument).toEqual(document);

        document.documentStatus = null;
        await mountWrapper();
        expect(wrapper.vm.localDocument.documentStatus).toEqual(DocumentStatus.Current);
      });
    });
    describe('fetches', () => {
      it('it fetches from store', async () => {
        await mountWrapper();
        expect(storage.caseFileDocument.actions.fetchCategories).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('documentCategories', () => {
      it('calls storage and passes current value', async () => {
        await mountWrapper();
        await wrapper.setData({ localDocument: { category: { optionItemId: 'abc' } } });
        expect(storage.caseFileDocument.getters.categories).toHaveBeenCalledWith(true, 'abc');
        await wrapper.setData({ localDocument: { category: { optionItemId: null } } });
        expect(storage.caseFileDocument.getters.categories).toHaveBeenCalledWith(true, null);
      });
    });

    describe('statusColor', () => {
      it('returns the right color', async () => {
        await mountWrapper();
        await wrapper.setData({ localDocument: { documentStatus: DocumentStatus.Current } });
        expect(wrapper.vm.statusColor).toEqual('status_success white--text');
        await wrapper.setData({ localDocument: { documentStatus: DocumentStatus.Past } });
        expect(wrapper.vm.statusColor).toEqual('status_green_pale black--text');
      });
    });

    describe('isStatusActive', () => {
      it('returns the right value', async () => {
        await mountWrapper();
        await wrapper.setData({ localDocument: { documentStatus: DocumentStatus.Current } });
        expect(wrapper.vm.isStatusActive).toEqual(true);
        await wrapper.setData({ localDocument: { documentStatus: DocumentStatus.Past } });
        expect(wrapper.vm.isStatusActive).toEqual(false);
      });
      it('sets the right value', async () => {
        await mountWrapper();
        wrapper.vm.isStatusActive = true;
        expect(wrapper.vm.localDocument.documentStatus).toEqual(DocumentStatus.Current);
        wrapper.vm.isStatusActive = false;
        expect(wrapper.vm.localDocument.documentStatus).toEqual(DocumentStatus.Past);
      });
    });

    describe('uploadDialogTitle', () => {
      it('returns the title', async () => {
        await mountWrapper();
        await wrapper.setData({ errors: [] });
        expect(wrapper.vm.uploadDialogTitle).toEqual('common.file.uploading.title');
        await wrapper.setData({ errors: [{}] });
        expect(wrapper.vm.uploadDialogTitle).toEqual('common.file.uploading.error.title');
      });
    });

    describe('categoryIsOther', () => {
      it('returns false if category with id in the argument is not other', async () => {
        await mountWrapper(true, false, 6, {
          computed: {
            documentCategories() {
              return [{
                optionItemId: 'foo',
                isOther: true
              }, {
                optionItemId: 'id-1',
                isOther: false
              }]
            }
          }
        });
        expect(wrapper.vm.categoryIsOther('id-1')).toBeFalsy()
      })
      it('returns true if category with id in the argument is not other', async () => {
        await mountWrapper(true, false, 6, {
          computed: {
            documentCategories() {
              return [{
                id: 'foo',
                isOther: false
              }, {
                id: 'id-1',
                isOther: true
              }]
            }
          }
        });
        expect(wrapper.vm.categoryIsOther('id-1')).toBeTruthy()
      })
    })
  });

  describe('Watch', () => {
    describe('update:document', () => {
      it('emits when document is changed', async () => {
        await mountWrapper();

        expect(wrapper.emitted('update:document')).toBeUndefined();

        await wrapper.setData({
          localDocument: { name: 'newName' }
        });
        expect(wrapper.emitted('update:document')).not.toBeUndefined();
      });

      it('sets category.specifiedOther to null if the category is not other', async () => {
        await mountWrapper(false, false, 6, {
          computed: {
            documentCategories() {
              return [{
                optionItemId: 'foo',
                isOther: false
              }, {
                optionItemId: 'id-1',
                isOther: true
              }]
            }
          }
        });
        await wrapper.setData({
          localDocument: {
            ...new CaseFileDocumentEntity(),
            category: { optionItemId: 'foo', specifiedOther: 'bar' }
          }
        });
        expect(wrapper.emitted('update:document')[0][0]).toEqual({
          ...new CaseFileDocumentEntity(),
          category: { optionItemId: 'foo', specifiedOther: null }
        });
      })
    });
    describe('update:file', () => {
      it('emits when file is changed', async () => {
        await mountWrapper();

        expect(wrapper.emitted('update:file')).toBeUndefined();

        await wrapper.setData({
          file: { name: 'newName' }
        });
        expect(wrapper.emitted('update:file')).not.toBeUndefined();
      });
    });
  });

  describe('Methods', () => {
    describe('upload', () => {
      it('shows the upload dialog and calls uploadForm', async () => {
        await mountWrapper();
        expect(wrapper.vm.showUploadDialog).toBeFalsy();
        await wrapper.vm.upload({ someForm: 'yep' }, 'myUrl');
        expect(wrapper.vm.showUploadDialog).toBeTruthy();
        expect(wrapper.vm.uploadForm).toHaveBeenCalledWith({ someForm: 'yep' }, 'myUrl');
      });
    });
  });

  describe('Template', () => {

    describe('Upload dialog', () => {
      it('should be rendered', async () => {
        await (mountWrapper(false));
        await wrapper.setData({ showUploadDialog: false });
        expect(wrapper.find('[data-test="upload-dialog"]').vm.$props.show).toBe(false);
        await wrapper.setData({ showUploadDialog: true });
        expect(wrapper.find('[data-test="upload-dialog"]').vm.$props.show).toBe(true);
      });
    });

    describe('file upload', () => {
      it('should be rendered only in create mode', async () => {
        await (mountWrapper(false, true));
        expect(wrapper.findComponent(RcFileUpload).exists()).toBe(true);
        await (mountWrapper(true, true));
        expect(wrapper.findComponent(RcFileUpload).exists()).toBe(false);
      });

      it('should be passed the file in props', async () => {
        await (mountWrapper(false, true));
        await wrapper.setData({ file: { name: 'myFile' } });
        expect(wrapper.findComponent(RcFileUpload).props('file')).toEqual({ name: 'myFile' });
      });

      it('should allow multiple extensions upload', async () => {
        await (mountWrapper(false, true));
        expect(wrapper.findComponent(RcFileUpload).props('allowedExtensions')).toEqual(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'rtf', 'ppt', 'pptx', 'jpeg', 'jpg', 'png', 'bmp', 'tiff', 'msg']);
      });
    });

    describe('download view document', () => {
      it('should be rendered only in edit mode', async () => {
        await (mountWrapper(false, true));
        expect(wrapper.findComponent(DownloadComponent).exists()).toBe(false);
        await (mountWrapper(true, true));
        expect(wrapper.findComponent(DownloadComponent).exists()).toBe(true);
      });

      it('should be passed the document entity in props', async () => {
        await (mountWrapper(true, true));
        expect(wrapper.findComponent(DownloadComponent).props('document')).toEqual(wrapper.vm.localDocument);
      });
    });
  });

  describe('Validation', () => {
    let el;
    beforeEach(async () => {
      await mountWrapper(false, true);
    });

    test('document name is required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-name');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localDocument: { name: 'abc' } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-name');
      expect(el.classes('invalid')).toBe(false);
    });

    test('the document name has a max length of MAX_LENGTH_MD', async () => {
      await wrapper.setData({ localDocument: { name: 'x'.repeat(MAX_LENGTH_MD + 1) } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-name');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localDocument: { name: 'x'.repeat(MAX_LENGTH_MD - 1) } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-name');
      expect(el.classes('invalid')).toBe(false);
    });

    test('document category is required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findSelectWithValidation('document-category');
      expect(el.classes('invalid')).toBe(true);
      await wrapper.setData({ localDocument: { category: { optionItemId: 'abc' } } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findSelectWithValidation('document-category');
      expect(el.classes('invalid')).toBe(false);
    });

    test('notes is not required', async () => {
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-notes');
      expect(el.classes('invalid')).toBe(false);
      await wrapper.setData({ localDocument: { name: 'abc' } });
      await wrapper.vm.$refs.form.validate();
      el = wrapper.findTextFieldWithValidation('document-notes');
      expect(el.classes('invalid')).toBe(false);
    });
  });
});
