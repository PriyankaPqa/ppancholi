import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { AppointmentProgram, mockAppointmentProgram } from '@libs/entities-lib/appointment';
import entityUtils from '@libs/entities-lib/utils';
import { defaultBusinessHours } from '../../appointments/utils/defaultBusinessHours';
import Component from './CreateEditAppointmentProgram.vue';

const localVue = createLocalVue();
const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();

describe('CreateEditAppointmentProgram.vue', () => {
  let wrapper;

  const mountWrapper = async (isEditMode = true, shallow = true, otherOptions = {}) => {
    wrapper = (shallow ? shallowMount : mount)(Component, {
      localVue,
      pinia,
      propsData: {
        appointmentProgramId: 'appt-program-id',
        id: 'EVENT_ID',
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
      mocks: {
        $route: {
          name: routes.events.appointmentPrograms.edit.name,
          params: {
            id: 'EVENT_ID',
            appointmentProgramId: 'appt-program-id',
          },
        },

      },
      ...otherOptions,
    });
  };

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            appointmentProgramId: 'appt-program-id',
            id: 'EVENT_ID',
          },
          mocks: {
            $route: {
              name: routes.events.appointmentPrograms.edit.name,
              params: {
                id: 'EVENT_ID',
                appointmentProgramId: 'appt-program-id',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(true);
      });

      it('returns false if the route is create', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            appointmentProgramId: 'appt-program-id',
            id: 'EVENT_ID',
          },
          mocks: {
            $route: {
              name: routes.events.appointmentPrograms.create.name,
              params: {
                id: 'EVENT_ID',
              },
            },
          },
        });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });

    describe('submitLabel', () => {
      it('returns the right text when is edit mode', () => {
        mountWrapper();
        expect(wrapper.vm.submitLabel).toEqual('common.save');
      });
      it('returns the right text when is create mode', () => {
        mountWrapper(false);
        expect(wrapper.vm.submitLabel).toEqual('common.buttons.create');
      });
    });

    describe('schedule', () => {
      test('getter turns an array schedule into an object with all week days', () => {
        mountWrapper();
        const businessHours = [{ day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] }];
        const appointmentProgram = mockAppointmentProgram({ businessHours });
        wrapper.setData({ appointmentProgram });
        expect(wrapper.vm.schedule).toEqual({
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        });
      });
      test('setter turns an object schedule into an array', () => {
        mountWrapper();
        const businessHours = [{ day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] }];
        const schedule = {
          0: { day: 0, timeSlots: [] },
          1: { day: 1, timeSlots: [{ start: '09:00:00', end: '17:00:00' }] },
          2: { day: 2, timeSlots: [] },
          3: { day: 3, timeSlots: [] },
          4: { day: 4, timeSlots: [] },
          5: { day: 5, timeSlots: [] },
          6: { day: 6, timeSlots: [] },
        };
        wrapper.vm.schedule = schedule;
        expect(wrapper.vm.appointmentProgram.businessHours).toEqual(businessHours);
      });
    });
  });

  describe('lifecycle', () => {
    describe('Created', () => {
      it('when is not edit mode, it should set ', async () => {
        await mountWrapper(false);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.appointmentProgram.businessHours).toEqual(defaultBusinessHours);
      });
    });
  });

  describe('Methods', () => {
    describe('back', () => {
      it('calls router back', async () => {
        await mountWrapper(false);
        wrapper.vm.$router.back = jest.fn();
        wrapper.vm.back();
        expect(wrapper.vm.$router.back).toHaveBeenCalled();
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode', async () => {
        await mountWrapper();
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toBe('fr');
      });

      it('calls fillEmptyMultilingualAttributes entity method', async () => {
        await mountWrapper();
        entityUtils.getFilledMultilingualField = jest.fn(() => ({ translate: { en: 'en', fr: 'fr' } }));
        await wrapper.vm.setLanguageMode('fr');
        expect(entityUtils.getFilledMultilingualField).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.appointmentProgram.name).toEqual({ translate: { en: 'en', fr: 'fr' } });
      });
    });

    describe('onStatusChange', () => {
      it('changes the appointment program status when in not edit mode', () => {
        mountWrapper(false);
        wrapper.vm.onStatusChange(2);
        expect(wrapper.vm.appointmentProgram.appointmentProgramStatus).toEqual(2);
      });
    });

    describe('createAppointmentProgram', () => {
      it('calls the store createAppointmentProgram with the right payload', async () => {
        const program = new AppointmentProgram();
        program.eventId = 'EVENT_ID';
        program.businessHours = defaultBusinessHours;
        mountWrapper(false);
        await wrapper.vm.createAppointmentProgram();
        expect(appointmentProgramStore.createAppointmentProgram).toHaveBeenCalledWith(program);
      });

      it('calls a toaster after creating', async () => {
        mountWrapper(false);
        await wrapper.vm.createAppointmentProgram();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('event.appointmentProgram.created');
      });

      it('sends to details page after creating', async () => {
        mountWrapper(false);
        appointmentProgramStore.createAppointmentProgram = jest.fn(() => mockAppointmentProgram({ id: '1' }));
        await wrapper.vm.createAppointmentProgram();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.events.appointmentPrograms.details.name, params: { appointmentProgramId: '1' },
        });
      });

      it('calls an error toaster if creating fails', async () => {
        mountWrapper(false);
        appointmentProgramStore.createAppointmentProgram = jest.fn();
        await wrapper.vm.createAppointmentProgram();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('event.appointmentProgram.create.failed');
      });
    });

    describe('submit', () => {
      it('does not call create unless form validation succeeds and not edit mode', async () => {
        await mountWrapper(false);
        wrapper.vm.createAppointmentProgram = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.submit();
        expect(wrapper.vm.createAppointmentProgram).toHaveBeenCalledTimes(0);
      });
      it('calls create if form validation succeeds and not edit mode', async () => {
        await mountWrapper(false);
        wrapper.vm.createAppointmentProgram = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(wrapper.vm.createAppointmentProgram).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Template', () => {
    describe('name', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-name');
        expect(element.exists()).toBeTruthy();
      });
    });
    describe('timeZone', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-time-zone');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('status', () => {
      it('renders', () => {
        mountWrapper(false, false);
        const element = wrapper.findDataTest('appointment-program-status');
        expect(element.exists()).toBeTruthy();
      });

      it('calls the method onStatusChange on change', () => {
        mountWrapper(false, false);
        wrapper.vm.onStatusChange = jest.fn();
        const element = wrapper.findDataTest('appointment-program-status');
        element.vm.$emit('input');
        expect(wrapper.vm.onStatusChange).toHaveBeenCalledTimes(1);
      });
    });
  });
});
