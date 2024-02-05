import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import Component from './RcFileUpload.vue';

const localVue = createLocalVue();

describe('RcFileUpload.spec', () => {
  let wrapper;

  const doMount = (mockFile, options = {}) => {
    wrapper = shallowMount(Component, {
      localVue,
      // computed: { currentFile: () => mockFile },
      data() {
        return {
          localFiles: [mockFile],
        };
      },
      ...options,
    });
  };
  describe('Watch', () => {
    describe('localFiles', () => {
      it('localFiles and previousFiles should be same', async () => {
        const mockFile = new File(['foo'], 'mockname');
        doMount(mockFile);
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        await wrapper.vm.onChange([new File(['bar'], 'mockbarname,')]);
        expect(wrapper.vm.localFiles).toEqual(wrapper.vm.previousFiles);
      });
    });
  });

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
        helpers.formatBytes = jest.fn(() => '50 MB');
        doMount(mockFile);
        wrapper.vm.isFileSizeOK = jest.fn(() => false);
        await wrapper.vm.checkRules();
        expect(wrapper.vm.errorMessages[0].key).toBe('common.upload.max_file.size');
        expect(wrapper.vm.errorMessages[0].params[0].x).toBe('50 MB');
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

        expect(wrapper.vm.errorMessages).toEqual(expect.arrayContaining(['csv common.upload.file.extension']));
      });
    });

    describe('onChange', () => {
      it('should call sanitizeFile if sanitizeFileName is true', async () => {
        const mockFile = new File(['foo'], 'mock-name');
        doMount(mockFile, {
          propsData: {
            sanitizeFileName: true,
          },
        });
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        wrapper.vm.sanitizeFile = jest.fn();
        await wrapper.vm.onChange(mockFile);
        expect(wrapper.vm.sanitizeFile).toBeCalledTimes(1);
      });

      it('should call addMissingTypeMsg if file extension is .msg', async () => {
        const mockFile = new File(['foo'], 'test.msg');
        doMount(mockFile);
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        wrapper.vm.addMissingTypeMsg = jest.fn();
        await wrapper.vm.onChange(mockFile);
        expect(wrapper.vm.addMissingTypeMsg).toBeCalledTimes(1);
      });

      it('calls checkRules and validate', async () => {
        const mockFile = new File(['foo'], 'mock-name');
        doMount();
        wrapper.vm.checkRules = jest.fn();
        wrapper.vm.sanitizeFile = jest.fn();
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        await wrapper.vm.onChange(mockFile);
        expect(wrapper.vm.checkRules).toBeCalledTimes(1);
        expect(wrapper.vm.sanitizeFile).toBeCalledTimes(0);
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

    describe('sanitizeFile', () => {
      it('should return a new file without accent and apostrophe', () => {
        doMount();
        const fileName = "c'est àéèêîïâêîôûùëiïü.txt";

        const file = new File(['foo'], fileName, {
          type: 'text/plain',
        });

        const res = wrapper.vm.sanitizeFile(file);

        expect(res.name).toEqual('cest aeeeiiaeiouueiiu.txt');
        expect(res.type).toEqual('text/plain');
      });
    });

    describe('addMissingTypeMsg', () => {
      it('should return a new file with force type outlook if file is .msg', () => {
        doMount();
        const fileName = 'test.msg';

        const file = new File(['foo'], fileName, {
          type: '',
        });

        const res = wrapper.vm.addMissingTypeMsg(file);

        expect(res.type).toEqual('application/vnd.ms-outlook');
      });
    });

    describe('onChange', () => {
      it('localfiles should be previous file and getUniqueFiles is called when multiple', async () => {
        doMount(new File(['foo'], 'file0'), {
          propsData: {
            multiple: true,
          },
        });
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        wrapper.vm.getUniqueFiles = jest.fn();
        wrapper.vm.previousFiles = [new File(['foo'], 'file1'), new File(['foo'], 'file2')];
        const files = [new File(['foo'], 'file4')];
        await wrapper.vm.onChange(files);
        expect(wrapper.vm.localFiles.length).toEqual(3);
        expect(wrapper.vm.getUniqueFiles).toBeCalledTimes(1);
      });

      it('localfiles should be one and getUniqueFiles is not called when single file', async () => {
        doMount(new File(['foo'], 'file0'), {
          propsData: {
            multiple: false,
          },
        });
        wrapper.vm.$refs.fileUpload.validate = jest.fn(() => true);
        wrapper.vm.getUniqueFiles = jest.fn();
        const files = [new File(['foo'], 'file1'), new File(['foo'], 'file2')];
        await wrapper.vm.onChange(files);
        expect(wrapper.vm.localFiles.length).toEqual(1);
        expect(wrapper.vm.getUniqueFiles).toBeCalledTimes(0);
      });
    });

    describe('getUniqueFiles', () => {
      it('should return unique files', () => {
        doMount();
        wrapper.vm.localFiles = [new File(['foo'], 'file1'), new File(['foo'], 'file1'), new File(['foo'], 'file2')];
        const res = wrapper.vm.getUniqueFiles();
        expect(res.length).toEqual(2);
      });
    });

    describe('removeFile', () => {
      it('calls checkRules and getUniqueFiles', () => {
        doMount();
        wrapper.vm.getUniqueFiles = jest.fn();
        wrapper.vm.checkRules = jest.fn();
        wrapper.vm.removeFile(1);
        expect(wrapper.vm.getUniqueFiles).toBeCalledTimes(1);
        expect(wrapper.vm.checkRules).toBeCalledTimes(1);
      });

      it('calls emit with the right payload', () => {
        const mockFile = new File(['foo'], 'mockname');
        doMount(mockFile);
        wrapper.vm.checkRules = jest.fn();
        wrapper.vm.$emit = jest.fn();
        const res = wrapper.vm.getUniqueFiles();
        wrapper.vm.removeFile(1);
        expect(wrapper.vm.$emit).toHaveBeenCalledWith('update:files', res);
      });
    });
  });
});
