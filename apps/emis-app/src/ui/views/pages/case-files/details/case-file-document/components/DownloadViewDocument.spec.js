import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { CaseFileDocumentEntity, mockCaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { UserRoles } from '@libs/entities-lib/user';

import { useMockCaseFileDocumentStore } from '@/pinia/case-file-document/case-file-document.mock';
import Component from './DownloadViewDocument.vue';

const localVue = createLocalVue();

const { pinia, caseFileDocumentStore } = useMockCaseFileDocumentStore();

describe('DownloadViewDocument', () => {
  let wrapper;
  let mockDocument;

  const mountWrapper = async (fullMount = false, level = 5, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        document: mockDocument,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDocument = new CaseFileDocumentEntity(mockCaseFileDocumentEntity());
  });

  describe('Template', () => {
    it('shows the name of the document', async () => {
      mockDocument.originalFilename = 'test_referral.pdf';
      await mountWrapper();
      expect(wrapper.html()).toContain('test_referral.pdf');
    });
    it('shows preview and download buttons', async () => {
      await mountWrapper(true);
      expect(wrapper.html()).toContain('mdi-file-find');
      expect(wrapper.html()).toContain('mdi-download');
    });

    it('calls download when the download button is clicked', async () => {
      await mountWrapper(true);
      jest.spyOn(wrapper.vm, 'download').mockImplementation(() => {});
      const element = wrapper.findDataTest('download-link');
      await element.trigger('click');
      expect(wrapper.vm.download).toHaveBeenCalledTimes(1);
    });

    it('calls preview when the open button is clicked', async () => {
      await mountWrapper(true);
      jest.spyOn(wrapper.vm, 'preview').mockImplementation(() => {});
      const element = wrapper.findDataTest('open-link');
      await element.trigger('click');
      expect(wrapper.vm.preview).toHaveBeenCalledTimes(1);
    });

    it('can download only if level1+ or contributor3', async () => {
      await mountWrapper(true, 1);
      let element = wrapper.findDataTest('download-link');
      expect(element.exists()).toBeTruthy();
      await mountWrapper(true, null, UserRoles.contributorIM);
      element = wrapper.findDataTest('download-link');
      expect(element.exists()).toBeFalsy();
      await mountWrapper(true, null, UserRoles.contributor3);
      element = wrapper.findDataTest('download-link');
      expect(element.exists()).toBeTruthy();
    });
  });

  describe('Methods', () => {
    describe('download', () => {
      it('calls the store on download', async () => {
        await mountWrapper(false);
        wrapper.vm.download();
        expect(caseFileDocumentStore.downloadDocumentAsUrl).toHaveBeenCalledWith({ item: mockDocument, saveDownloadedFile: true });
      });
    });

    describe('preview', () => {
      it('calls the store on preview', async () => {
        await mountWrapper();
        window.open = jest.fn();
        wrapper.vm.preview();
        expect(caseFileDocumentStore.downloadDocumentAsUrl).toHaveBeenCalledWith({ item: mockDocument, saveDownloadedFile: false });
      });
    });
  });
});
