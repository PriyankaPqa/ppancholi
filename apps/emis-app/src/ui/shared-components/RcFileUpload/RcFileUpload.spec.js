import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import helpers from '@/ui/helpers/helpers';
import Component from './RcFileUpload.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('RcFileUpload.spec', () => {
  let wrapper;

  const doMount = (mockFile, options = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: { currentFile: () => mockFile },
      mocks: { $storage: storage },
      ...options,
    });
  };

  describe('Methods', () => {
    describe('checkRules', () => {
      test('if file name has special characters, a message will be pushed to errorMessages (comma)', async () => {
        const mockFile = new File(['foo'], 'mockname,');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has special characters, a message will be pushed to errorMessages (square brackets)', async () => {
        const mockFile = new File(['foo'], 'mockname[');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has special characters, a message will be pushed to errorMessages (question mark)', async () => {
        const mockFile = new File(['foo'], 'mockname?');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has special characters, a message will be pushed to errorMessages (equal)', async () => {
        const mockFile = new File(['foo'], 'mockname=');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no unallowed special characters, errorMessages does not contain the related error message', async () => {
        const mockFile = new File(['foo'], 'mockname');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no unallowed special characters, errorMessages does not contain the related error message (space)', async () => {
        const mockFile = new File(['foo'], 'mock name');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no unallowed special characters, errorMessages does not contain the related error message (underscore)', async () => {
        const mockFile = new File(['foo'], 'mock_name');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no unallowed special characters, errorMessages does not contain the related error message (period)', async () => {
        const mockFile = new File(['foo'], 'mock.name');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file name has no unallowed special characters, errorMessages does not contain the related error message (dash)', async () => {
        const mockFile = new File(['foo'], 'mock-name');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).not.toEqual(expect.arrayContaining(['error.file.upload.fileName']));
      });

      test('if file has no size, errorMessages will be empty', async () => {
        const mockFile = new File([], 'mock-name');
        doMount(mockFile);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages).toEqual([]);
      });

      test('if file size is not ok, push the right message to messages', async () => {
        const mockFile = new File(['1'], 'mock-name');
        helpers.formatBytes = jest.fn(() => '5 MB');
        doMount(mockFile);
        wrapper.vm.isFileSizeOK = jest.fn(() => false);
        await wrapper.vm.checkRules();

        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['The size should not exceed 5 MB']));
      });

      test('if file extension is not authorized, push the right message to messages', async () => {
        const mockFile = new File(['1'], 'mock-name');
        doMount(mockFile, {
          propsData: {
            allowedExtensions: ['csv'],
          },
        });

        wrapper.vm.isFileExtensionAuthorized = jest.fn(() => false);
        await wrapper.vm.checkRules();

        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['csv files only are authorized']));
      });
    });

    describe('onChange', () => {
      it('calls checkRules and validate', async () => {
        const mockFile = new File(['foo'], 'mock-name');
        doMount();
        wrapper.vm.checkRules = jest.fn();
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        await wrapper.vm.onChange(mockFile);
        expect(wrapper.vm.checkRules).toBeCalledTimes(1);
        expect(wrapper.vm.$refs.fileUpload.validate).toBeCalledTimes(1);
      });

      it('calls emit with the right payload', async () => {
        doMount();
        const mockFile = new File(['foo'], 'mock-name');
        wrapper.vm.checkRules = jest.fn();
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => false);
        wrapper.vm.$emit = jest.fn();
        await wrapper.vm.onChange(mockFile);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('update:file', mockFile, false);
      });
    });
  });
});
