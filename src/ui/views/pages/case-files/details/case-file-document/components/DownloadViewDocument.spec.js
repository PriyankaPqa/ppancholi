/* eslint-disable */
import flushPromises from 'flush-promises';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { CaseFileDocumentEntity, mockCombinedCaseFileDocument } from '@/entities/case-file-document';
import Component from './DownloadViewDocument.vue';

const localVue = createLocalVue();

describe('DownloadViewDocument', () => {
  let wrapper;
  let mockDocument;

  const mountWrapper = async (fullMount = false, level = 5, additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: {
        document: mockDocument,
      },
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
      },
      ...additionalOverwrites,
    });
    
    await wrapper.vm.$nextTick();
    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDocument = new CaseFileDocumentEntity(mockCombinedCaseFileDocument().entity);
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
  });
});
