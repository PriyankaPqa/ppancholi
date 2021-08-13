import { RcPageContent } from '@crctech/component-library';
import {
  createLocalVue,
  mount,
  shallowMount,
} from '@/test/testSetup';

import RcFileUpload from '@/ui/shared-components/RcFileUpload/RcFileUpload.vue';
import { MassActionEntity } from '@/entities/mass-action';
import Component from './MassActionBaseCreate.vue';

const localVue = createLocalVue();

describe('MassActionBaseCreate.vue', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          title: 'title',
          formData: new FormData(),
          url: 'url',
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
          url: 'url',
        },
      });
      wrapper.vm.$refs.form.validate = jest.fn(() => true);
    });

    describe('next', () => {
      beforeEach(() => {
        wrapper.vm.upload = jest.fn();
      });

      it('should validate the form', async () => {
        await wrapper.vm.next();
        expect(wrapper.vm.$refs.form.validate).toBeCalled();
      });

      it('should emit upload:start to receive the formData', async () => {
        await wrapper.vm.next();
        expect(wrapper.emitted('upload:start')).toBeTruthy();
      });

      it('should call upload method', async () => {
        await wrapper.vm.next();
        expect(wrapper.vm.upload).toBeCalled();
      });

      it('should confirm before emitting or uploading', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.next();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith('massAction.confirm.preprocessing.title', 'massAction.confirm.preprocessing.message');
        expect(wrapper.emitted('upload:start')).toBeFalsy();
        expect(wrapper.vm.upload).not.toBeCalled();
      });
    });

    describe('back', () => {
      it('should emit back', () => {
        wrapper.vm.back();
        expect(wrapper.emitted('back')).toBeTruthy();
      });
    });

    describe('upload', () => {
      it('should add the file to the formData', async () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.formData.append).toHaveBeenLastCalledWith('file', wrapper.vm.file);
      });

      it('should call uploadForm with file and url from the mixin', async () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.vm.upload();
        expect(wrapper.vm.uploadForm).toHaveBeenLastCalledWith(wrapper.vm.formData, wrapper.vm.url);
      });

      it('should emit upload:success in case of successful upload with proper params', async () => {
        wrapper.vm.formData.append = jest.fn();
        wrapper.vm.uploadForm = jest.fn();
        await wrapper.setData({ uploadSuccess: true });
        await wrapper.vm.upload();
        expect(wrapper.emitted('upload:success')).toBeTruthy();
        expect(wrapper.emitted('upload:success')[0]).toEqual([new MassActionEntity(wrapper.vm.response.data)]);
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
          url: 'url',
        },
      });
    });
    describe('Rules', () => {
      it('should use requiredFile custom rule', () => {
        expect(wrapper.vm.rules.file).toEqual({
          requiredFile: wrapper.vm.file.size,
        });
      });
    });
  });
});
