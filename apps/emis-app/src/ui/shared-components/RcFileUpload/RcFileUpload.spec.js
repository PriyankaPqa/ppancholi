import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import helpers from '@/ui/helpers/helpers';
import Component from './RcFileUpload.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('RcFileUpload.spec', () => {
  let wrapper;

  describe('Methods', () => {
    describe('checkRules', () => {
      test('if file name has special characters, a message will be pushed to errorMessages ', async () => {
        const mockFile = new File(['foo'], 'mock-name[1]');
        wrapper = shallowMount(Component, {
          localVue,
          computed: { currentFile: () => mockFile },
          mocks: { $storage: storage },
        });
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no special characters, errorMessages does not contain the related error message', async () => {
        const mockFile = new File(['foo'], 'mock-name');
        wrapper = shallowMount(Component, {
          localVue,
          computed: { currentFile: () => mockFile },
          mocks: { $storage: storage },
        });
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file has no size, errorMessages will be empty', async () => {
        const mockFile = new File([], 'mock-name');
        wrapper = shallowMount(Component, {
          localVue,
          computed: { currentFile: () => mockFile },
          mocks: { $storage: storage },
        });
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual([]);
      });

      test('if file size is not ok, push the right message to messages', async () => {
        const mockFile = new File(['1'], 'mock-name');
        helpers.formatBytes = jest.fn(() => '5 MB');
        wrapper = shallowMount(Component, {
          localVue,
          computed: { currentFile: () => mockFile },
          mocks: { $storage: storage },
        });
        wrapper.vm.isFileSizeOK = jest.fn(() => false);
        await wrapper.vm.checkRules();

        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['The size should not exceed 5 MB']));
      });

      test('if file extension is not authorized, push the right message to messages', async () => {
        const mockFile = new File(['1'], 'mock-name');
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            allowedExtensions: ['csv'],
          },
          computed: { currentFile: () => mockFile },
          mocks: { $storage: storage },
        });
        wrapper.vm.isFileExtensionAuthorized = jest.fn(() => false);
        await wrapper.vm.checkRules();

        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['csv files only are authorized']));
      });
    });
  });
});
