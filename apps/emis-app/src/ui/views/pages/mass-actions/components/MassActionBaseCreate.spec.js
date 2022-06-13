import { RcPageContent } from '@libs/component-lib/components';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { MassActionEntity, MassActionMode, MassActionRunType } from '@/entities/mass-action';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import Component from './MassActionBaseCreate.vue';

const localVue = createLocalVue();

const storage = mockStorage();
let wrapper;

const doMount = (shallow = false, propsData) => {
  const options = {
    localVue,
    propsData: {
      title: 'title',
      formData: new FormData(),
      uploadUrl: 'url',
      applyToLabel: 'applyToLabel',
      mode: MassActionMode.File,
      loading: false,
      ...propsData,
    },
    mocks: {
      $storage: storage,
    },
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
};

describe('MassActionBaseCreate.vue', () => {
  describe('Template', () => {
    beforeEach(() => {
      doMount();
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

    describe('Name', () => {
      it('should be rendered by default', () => {
        expect(wrapper.findDataTest('name').exists()).toBe(true);
      });

      it('should not be rendered if hideName is true', () => {
        doMount(true, { hideName: true });
        expect(wrapper.findDataTest('name').exists()).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
      wrapper.vm.$refs.form.validate = jest.fn(() => true);
      wrapper.vm.uploadForm = jest.fn();
      wrapper.vm.resetFileInput = jest.fn();
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

      it('should confirm before emitting or uploading with message for preprocessing when run type is preprocess by default', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.next();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith(
          {
            title: 'massAction.confirm.preprocessing.title',
            messages: 'massAction.confirm.preprocessing.message',
          },
        );
        expect(wrapper.emitted('upload:start')).toBeFalsy();
        expect(wrapper.vm.upload).not.toBeCalled();
      });

      it('should confirm before emitting or uploading with message for processing when run type is process', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            title: 'title',
            formData: new FormData(),
            uploadUrl: 'url',
            applyToLabel: 'applyToLabel',
            mode: MassActionMode.File,
            runType: MassActionRunType.Process,
            loading: false,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.create = jest.fn();
        wrapper.vm.upload = jest.fn();

        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.next();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith(
          {
            title: 'massAction.confirm.processing.title',
            messages: 'massAction.confirm.processing.message',
          },
        );
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
            loading: false,
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
      it('should emit back if no changed', () => {
        wrapper.vm.$refs.form = {
          flags: {
            changed: false,
          },
        };
        wrapper.vm.back();
        expect(wrapper.emitted('back')).toBeTruthy();
      });

      it('should call confirmBeforeLeave back if changed', () => {
        wrapper.vm.$refs.form = {
          flags: {
            changed: true,
          },
        };
        wrapper.vm.confirmBeforeLeave = jest.fn();
        wrapper.vm.back();
        expect(wrapper.vm.confirmBeforeLeave).toBeCalled();
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
        await wrapper.setData({ uploadSuccess: true });
        await wrapper.vm.upload();
        expect(wrapper.emitted('upload:success')).toBeTruthy();
        expect(wrapper.emitted('upload:success')[0]).toEqual([new MassActionEntity(wrapper.vm.response.data)]);
      });

      it('should reset the file in case of failure', async () => {
        wrapper.vm.formData.set = jest.fn();
        await wrapper.setData({ uploadSuccess: false });
        await wrapper.vm.upload();

        expect(wrapper.vm.resetFileInput).toBeCalled();
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

      it('should emit post if no attachment mode', async () => {
        wrapper.vm.createFromFile = jest.fn();

        await wrapper.vm.create(MassActionMode.NoAttachment);

        expect(wrapper.emitted('post')[0][0]).toEqual({
          name: wrapper.vm.name,
          description: wrapper.vm.description,
        });
      });
    });

    describe('confirmBeforeLeave', () => {
      it('should call confirm', async () => {
        await wrapper.vm.confirmBeforeLeave();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ title: 'massAction.cancel.title', messages: 'massAction.cancel.message' });
      });

      it('should emit back if user click yes', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.vm.confirmBeforeLeave();
        expect(wrapper.emitted('back')).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true);
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
