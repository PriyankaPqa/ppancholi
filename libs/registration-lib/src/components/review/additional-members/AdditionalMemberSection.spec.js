import Vuetify from 'vuetify';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import Component from './AdditionalMemberSection.vue';

const localVue = createLocalVue();

describe('AdditionalMemberSection.vue', () => {
  let wrapper;
  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        member: mockMember(),
        inlineEdit: false,
      },
    });
  });

  describe('Template', () => {
    it('displays the first name and last name correctly', async () => {
      const title = wrapper.find('[data-test="additionalMember__identity"]');
      expect(title.text()).toBe(`${mockMember().identitySet.firstName} ${mockMember().identitySet.lastName}`);
    });

    describe('Edit button', () => {
      it('is shown if inline mode is false', async () => {
        const editButton = wrapper.find('[data-test="inlineEdit__additionalMember__open"]');
        expect(editButton.exists()).toBe(true);
      });

      it('is hidden if inline mode is true', async () => {
        await wrapper.setProps({ inlineEdit: true });
        const editButton = wrapper.find('[data-test="inlineEdit__additionalMember__open"]');
        expect(editButton.exists()).toBe(false);
      });
    });

    describe('Delete button', () => {
      it('is shown if inline mode is false', async () => {
        const deleteButton = wrapper.find('[data-test="inlineEdit__additionalMember__delete"]');
        expect(deleteButton.exists()).toBe(true);
      });

      it('is hidden if inline mode is true', async () => {
        await wrapper.setProps({ inlineEdit: true });
        const deleteButton = wrapper.find('[data-test="inlineEdit__additionalMember__delete"]');
        expect(deleteButton.exists()).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    describe('edit', () => {
      it('should be called when clicking the edit button', async () => {
        jest.spyOn(wrapper.vm, 'edit');
        const button = wrapper.find('[data-test="inlineEdit__additionalMember__open"]');
        await button.trigger('click');
        expect(wrapper.vm.edit).toHaveBeenCalledTimes(1);
      });

      it('should emit edit event', () => {
        wrapper.vm.edit();
        expect(wrapper.emitted('edit')).toBeTruthy();
      });
    });

    describe('cancel', () => {
      beforeEach(() => {
        wrapper.setProps({
          inlineEdit: true,
        });
      });

      it('should be called when clicking the cancel button', async () => {
        jest.spyOn(wrapper.vm, 'cancel');
        const button = wrapper.find('[data-test="inlineEdit__cancel"]');
        await button.trigger('click');
        expect(wrapper.vm.cancel).toHaveBeenCalledTimes(1);
      });

      it('should emit edit cancel', () => {
        wrapper.vm.cancel();
        expect(wrapper.emitted('cancel')).toBeTruthy();
      });
    });

    describe('onSubmit', () => {
      beforeEach(() => {
        wrapper.setProps({
          inlineEdit: true,
        });
      });

      it('should be called when clicking the submit button', async () => {
        jest.spyOn(wrapper.vm, 'onSubmit');
        const button = wrapper.find('[data-test="inlineEdit__save"]');
        await button.trigger('click');
        expect(wrapper.vm.onSubmit).toHaveBeenCalledTimes(1);
      });

      it('should emit submit cancel', () => {
        wrapper.vm.onSubmit();
        expect(wrapper.emitted('submit')).toBeTruthy();
      });
    });

    describe('onDelete', () => {
      it('should emit delete event', () => {
        wrapper.vm.onDelete();
        expect(wrapper.emitted('delete')).toBeTruthy();
      });

      it('should be called when clicking the delete button', async () => {
        jest.spyOn(wrapper.vm, 'onDelete');
        const button = wrapper.find('[data-test="inlineEdit__additionalMember__delete"]');
        await button.trigger('click');
        expect(wrapper.vm.onDelete).toHaveBeenCalledTimes(1);
      });
    });
  });
});
