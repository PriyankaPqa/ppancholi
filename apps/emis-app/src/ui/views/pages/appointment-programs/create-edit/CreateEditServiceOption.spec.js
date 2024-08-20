import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockServiceOption } from '@libs/entities-lib/appointment';
import Component from './CreateEditServiceOption.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('CreateEditServiceOption.vue', () => {
  let wrapper;

  const mountWrapper = async (shallow = true, isEditMode = true, appointmentProgramId = 'appt-program-id', otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        show: true,
        appointmentProgramId,
        isEditMode,
        serviceOption: mockServiceOption({ serviceOptionType: { optionItemId: 'id-1' }, appointmentModalities: [{ optionItemId: 'mod-id-1' }] }),
        existingTypesIds: ['existing-type-id'],
      },
      ...otherOptions,
    });
  };
  describe('Computed', () => {
    describe('serviceOptionTypes', () => {
      it('calls the store get method and returns only the types that dont exist yet for other service options in the current program', async () => {
        const allTypes = [{ id: 'id-1' }, { id: 'id-2' }, { id: 'existing-type-id' }];
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => allTypes);
        await mountWrapper(false);
        expect(appointmentProgramStore.getServiceOptionTypes).toHaveBeenCalledWith('id-1');
        expect(wrapper.vm.serviceOptionTypes).toEqual([{ id: 'id-1' }, { id: 'id-2' }]);
      });
    });

    describe('appointmentModalities', () => {
      it('calls getAppointmentModalities', async () => {
        await mountWrapper(false);
        expect(appointmentProgramStore.getAppointmentModalities).toHaveBeenCalledWith(['mod-id-1']);
      });
    });
  });

  describe('Methods', () => {
    describe('onSubmit', () => {
      it('maps the modalities into a list option list', async () => {
        mountWrapper(true, true, 'id');
        wrapper.setData({ selectedModalitiesIds: ['mod-id-1', 'mod-id-2'] });
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.localServiceOption.appointmentModalities).toEqual([
          { optionItemId: 'mod-id-1', specifiedOther: null }, { optionItemId: 'mod-id-2', specifiedOther: null }]);
      });
      describe('appointment program is already created', () => {
        it('makes the right store call if is edit mode and displays the right message on success', async () => {
          mountWrapper(true, true, 'id');
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          await wrapper.vm.onSubmit();
          expect(appointmentProgramStore.updateServiceOption).toHaveBeenCalledWith(wrapper.vm.appointmentProgramId, wrapper.vm.localServiceOption);
          expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.serviceOption.dialog.update.success');
        });
        it('if is edit mode displays the right message on error', async () => {
          mountWrapper(true, true, 'id');
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          appointmentProgramStore.updateServiceOption = jest.fn();
          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.serviceOption.dialog.update.error');
        });

        it('makes the right store call if is create mode and displays the right message on success', async () => {
          mountWrapper(true, false, 'id');
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          await wrapper.vm.onSubmit();
          expect(appointmentProgramStore.createServiceOption).toHaveBeenCalledWith(wrapper.vm.appointmentProgramId, wrapper.vm.localServiceOption);
          expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.serviceOption.dialog.create.success');
        });
        it('if is create mode displays the right message on error', async () => {
          mountWrapper(true, false, 'id');
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          appointmentProgramStore.createServiceOption = jest.fn();
          await wrapper.vm.onSubmit();
          expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.serviceOption.dialog.create.error');
        });
      });
    });
  });
});
