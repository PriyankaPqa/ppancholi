import { RcPageContent } from '@crctech/component-library';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { MassActionEntity, MassActionMode } from '@/entities/mass-action';
import Component from './MassActionBaseCreate.vue';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';

const localVue = createLocalVue();

const storage = mockStorage();

describe('MassActionBaseCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          title: 'title',
          formData: new FormData(),
          uploadUrl: 'url',
          applyToLabel: 'applyToLabel',
          mode: MassActionMode.File,
        },
      });
    });
    describe('RcPageContent', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(RcPageContent).exists()).toBe(true);
      });

      it('should be linked the correct props title', () => {
        expect(wrapper.findComponent(RcPageContent).props('title')).toBe('title');
      });
    });

    describe('RcFileUpload', () => {
      it('should be rendered', () => {
        expect(wrapper.findComponent(RcFileUpload).exists()).toBe(true);
      });

      it('should be linked the correct props file', () => {
        expect(wrapper.findComponent(RcFileUpload).props('file')).toBe(wrapper.vm.file);
      });

      it('should allow csv upload', () => {
        expect(wrapper.findComponent(RcFileUpload).props('allowedExtensions')).toEqual(['csv']);
      });
    });

    describe('Actions', () => {
      describe('Back button', () => {
        it('should trigger back method', async () => {
          const btn = wrapper.findDataTest('cancel');
          wrapper.vm.back = jest.fn();
          await btn.trigger('click');
          expect(wrapper.vm.back).toBeCalled();
        });
      });

      describe('Next button', () => {
        it('should trigger next method', async () => {
          const btn = wrapper.findDataTest('next');
          wrapper.vm.next = jest.fn();
          await btn.trigger('click');
          expect(wrapper.vm.next).toBeCalled();
        });
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          title: 'title',
          formData: new FormData(),
          uploadUrl: 'url',
          applyToLabel: 'applyToLabel',
          mode: MassActionMode.File,
        },
        mocks: {
          $storage: storage,
        },
      });
      wrapper.vm.$refs.form.validate = jest.fn(() => true);
      wrapper.vm.uploadForm = jest.fn();
    });

    describe('next', () => {
      beforeEach(() => {
        wrapper.vm.create = jest.fn();
        wrapper.vm.upload = jest.fn();
      });

      it('should validate the form', async () => {
        await wrapper.vm.next();
        expect(wrapper.vm.$refs.form.validate).toBeCalled();
      });

      it('should confirm before emitting or uploading', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.next();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('massAction.confirm.preprocessing.title', 'massAction.confirm.preprocessing.message');
        expect(wrapper.emitted('upload:start')).toBeFalsy();
        expect(wrapper.vm.upload).not.toBeCalled();
      });

      it('should show the upload dialog in file mode', async () => {
        await wrapper.setData({ showUploadDialog: false });
        wrapper.vm.$confirm = jest.fn(() => true);

        await wrapper.vm.next();

        expect(wrapper.vm.showUploadDialog).toBe(true);
      });

      it('should not show the upload dialog in list mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            title: 'title',
            formData: new FormData(),
            uploadUrl: 'url',
            applyToLabel: 'applyToLabel',
            mode: MassActionMode.List,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.$confirm = jest.fn(() => true);

        await wrapper.setData({ showUploadDialog: false });

        await wrapper.vm.next();

        expect(wrapper.vm.showUploadDialog).toBe(false);
      });

      it('should call the create method', async () => {
        await wrapper.vm.next();
        expect(wrapper.vm.create).toBeCalled();
      });
    });

    describe('back', () => {
      it('should emit back', () => {
        wrapper.vm.back();
        expect(wrapper.emitted('back')).toBeTruthy();
      });
    });

    describe('upload', () => {
      it('should add the name to the formData', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('name', wrapper.vm.name);
      });

      it('should add the description to the formData', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.formData.set).toHaveBeenCalledWith('description', wrapper.vm.description);
      });

      it('should add the file to the formData if file mode', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.formData.set).toHaveBeenLastCalledWith('file', wrapper.vm.file);
      });

      it('should not add caseFileIds to the formData if file mode', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.formData.set).not.toHaveBeenLastCalledWith('caseFileIds', '1,2');
      });

      it('should call uploadForm with file and url from the mixin', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.uploadForm).toHaveBeenLastCalledWith(wrapper.vm.formData, wrapper.vm.uploadUrl);
      });

      it('should set the mass action to the store entity in case of successful upload', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.setData({ uploadSuccess: true });
        await wrapper.vm.upload();
        expect(wrapper.vm.$storage.massAction.mutations.setEntity).toHaveBeenCalledWith(new MassActionEntity(wrapper.vm.response.data));
      });

      it('should emit upload:success in case of successful upload with proper params', async () => {
        wrapper.vm.formData.set = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.setData({ uploadSuccess: true });
        await wrapper.vm.upload();
        expect(wrapper.emitted('upload:success')).toBeTruthy();
        expect(wrapper.emitted('upload:success')[0]).toEqual([new MassActionEntity(wrapper.vm.response.data)]);
      });
    });

    describe('create', () => {
      it('should emit upload:start to receive the formData', async () => {
        wrapper.vm.upload = jest.fn();
        await wrapper.vm.create(MassActionMode.File);
        expect(wrapper.emitted('upload:start')).toBeTruthy();
      });

      it('should emit post if list mode', async () => {
        wrapper.vm.createFromFile = jest.fn();

        await wrapper.vm.create(MassActionMode.List);

        expect(wrapper.emitted('post')[0][0]).toEqual({
          name: wrapper.vm.name,
          description: wrapper.vm.description,
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          title: 'title',
          formData: new FormData(),
          uploadUrl: 'url',
          applyToLabel: 'applyToLabel',
          mode: MassActionMode.File,
        },
      });
    });

    describe('Rules', () => {
      it('should use requiredFile custom rule', () => {
        expect(wrapper.vm.rules.file).toEqual({
          requiredFile: wrapper.vm.file.size,
        });
      });

      it('should have name rule', () => {
        expect(wrapper.vm.rules.name).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });

      it('should have description rule', () => {
        expect(wrapper.vm.rules.description).toEqual({
          max: MAX_LENGTH_LG,
        });
      });
    });
  });
});
