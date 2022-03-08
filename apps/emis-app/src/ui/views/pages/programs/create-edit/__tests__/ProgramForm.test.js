import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { Status } from '@/entities/base';
import { ProgramEntity } from '@/entities/program';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import Component from '../ProgramForm.vue';

const localVue = createLocalVue();

describe('ProgramForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
      });
    });

    describe('isStatusActive', () => {
      it('returns true for Active programs', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Active,
          },
        });

        expect(wrapper.vm.isStatusActive).toBe(true);
      });

      it('returns false for Inactive programs', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Inactive,
          },
        });

        expect(wrapper.vm.isStatusActive).toBe(false);
      });

      it('sets the program to Active when passed true', () => {
        wrapper.vm.isStatusActive = true;

        expect(wrapper.vm.localProgram.status).toBe(Status.Active);
      });

      it('sets the program to Inactive when passed false', () => {
        wrapper.vm.isStatusActive = false;

        expect(wrapper.vm.localProgram.status).toBe(Status.Inactive);
      });
    });

    describe('statusColor', () => {
      it('returns the correct value for an active program', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Active,
          },
        });

        expect(wrapper.vm.statusColor).toBe('status_success white--text');
      });

      it('returns the correct value for an inactive program', async () => {
        await wrapper.setData({
          localProgram: {
            ...wrapper.vm.localProgram,
            status: Status.Inactive,
          },
        });

        expect(wrapper.vm.statusColor).toBe('status_green_pale black--text');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: false,
          isDirty: false,
        },
      });
    });

    describe('setLanguageMode', () => {
      it('sets the value of language mode', () => {
        wrapper.vm.setLanguageMode('de');
        expect(wrapper.vm.languageMode).toBe('de');
      });

      it('causes the program entity to fill multilingual attributes', () => {
        const spy = jest.spyOn(wrapper.vm.localProgram, 'fillEmptyMultilingualAttributes');
        wrapper.vm.setLanguageMode('de');
        expect(wrapper.vm.localProgram.fillEmptyMultilingualAttributes).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('resetAsUnique', () => {
      it('emits the update:is-name-unique event', () => {
        wrapper.vm.resetAsUnique();
        expect(wrapper.emitted('update:is-name-unique').length).toBe(1);
        expect(wrapper.emitted('update:is-name-unique')[0]).toEqual([true]);
      });
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        propsData: {
          isEditMode: false,
          program: new ProgramEntity(),
          isNameUnique: true,
          isDirty: false,
        },
      });
    });

    test('program name is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the program name has a max length of MAX_LENGTH_MD', async () => {
      wrapper.vm.localProgram.name.translation[wrapper.vm.languageMode] = 'x'.repeat(MAX_LENGTH_MD + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-name');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the paymentModalities select is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findSelectWithValidation('payment-modalities');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the description is required', async () => {
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-description');
      expect(el.classes('invalid')).toBe(true);
    });

    test('the description has a max length of MAX_LENGTH_LG', async () => {
      wrapper.vm.localProgram.description.translation[wrapper.vm.langaugeMode] = 'x'.repeat(MAX_LENGTH_LG + 1);
      await wrapper.vm.$refs.form.validate();
      const el = wrapper.findTextFieldWithValidation('program-description');
      expect(el.classes('invalid')).toBe(true);
    });
  });
});
