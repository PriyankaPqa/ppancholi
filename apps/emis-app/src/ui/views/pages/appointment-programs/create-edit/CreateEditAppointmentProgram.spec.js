import { createLocalVue, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import Component from './CreateEditAppointmentProgram.vue';

const localVue = createLocalVue();
const { pinia } = useMockAppointmentProgramStore();

describe('CreateEditAppointmentProgram.vue', () => {
  let wrapper;

  const mountWrapper = async (isEditMode = true, otherOptions = {}) => {
    wrapper = shallowMount(Component, {
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
  });
});
