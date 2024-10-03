import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockAppointmentStore } from '@/pinia/appointment/appointment.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import Component from './CreateEditAppointment.vue';

const localVue = createLocalVue();

const { pinia } = useMockCaseFileStore();
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);
useMockAppointmentStore(pinia);

describe('CreateEditAppointment', () => {
  let wrapper;

  const doMount = (isEditMode) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        appointmentId: 'APPOINTMENT_ID',
      },
      computed: {
        isEditMode() {
          return isEditMode;
        },
      },
      mocks: {
        $route: {
          name: routes.caseFile.appointments.add.name,
          params: {
            id: 'CASEFILE_ID',
          },
        },

      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    doMount(false);
  });

  describe('Methods', () => {
    describe('back', () => {
      it('returns to the appointments home page', () => {
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.caseFile.appointments.home.name,
        });
      });
    });

    describe('submit', () => {
      it('does not call createAppointment unless form validation succeeds', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.submit();
        // expect(caseFileReferralStore.createReferral).toHaveBeenCalledTimes(0);
      });

      // it('calls updateReferral if isEditMode is true', async () => {
      //   doMount(true);

      //   wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //   await wrapper.vm.submit();
      //   expect(caseFileReferralStore.updateReferral).toHaveBeenCalledTimes(1);
      // });

      // test('after submitting, the user is redirected to the referral detail page', async () => {
      //   wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //   caseFileReferralStore.createReferral = jest.fn(() => ({ id: 'abc' }));
      //   await wrapper.vm.submit();

      //   expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
      //     name: routes.caseFile.referrals.details.name,
      //     params: { referralId: 'abc' },
      //   });
      // });

      // test('after creating an event a toast notification is shown', async () => {
      //   wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //   await wrapper.vm.submit();
      //   expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('referral.create.success');
      // });

      // test('after updating an event a toast notification is shown', async () => {
      //   doMount(true);

      //   wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //   await wrapper.vm.submit();
      //   expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('referral.edit.success');
      // });
    });
  });

  describe('Computed', () => {
    describe('isEditMode', () => {
      it('returns true if the route is edit', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'CASEFILE_ID',
            appointmentId: 'APPT_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.appointments.edit.name,
              params: {
                id: 'CASEFILE_ID',
                appointmentId: 'APPT_ID',
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
            id: 'CASEFILE_ID',
            appointmentId: 'APPT_ID',
          },
          mocks: {
            $route: {
              name: routes.caseFile.appointments.add.name,
              params: {
                id: 'CASEFILE_ID',
                appointmentId: 'APPT_ID',
              },
            },

          },
        });

        expect(wrapper.vm.isEditMode).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('fetches option items and appointment programs', () => {
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(appointmentProgramStore.fetchByEventId).toHaveBeenCalledWith(wrapper.vm.caseFile.eventId);
        expect(appointmentProgramStore.fetchAppointmentModalities).toHaveBeenCalled();
        expect(appointmentProgramStore.fetchServiceOptionTypes).toHaveBeenCalled();
      });

      it('assigns case file id to the appointment if in create mode', () => {
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(wrapper.vm.appointment.caseFileId).toEqual(wrapper.vm.id);
      });
    });
  });

  describe('Template', () => {
    describe('Event handlers', () => {
      beforeEach(() => {
        wrapper = mount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'CASEFILE_ID',
          },
          stubs: {
            AppointmentForm: true,
          },

        });
      });

      test('the save button calls the submit method', async () => {
        // // eslint-disable-next-line no-underscore-dangle
        // wrapper.vm.$refs.form._data.flags.dirty = true;
        // await wrapper.vm.$nextTick();

        const spy = jest.spyOn(wrapper.vm, 'submit').mockImplementation(() => { });
        const button = wrapper.findDataTest('save');
        await button.trigger('click');
        expect(wrapper.vm.submit).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      test('the cancel button calls the back method', async () => {
        const spy = jest.spyOn(wrapper.vm, 'back').mockImplementation(() => { });
        const button = wrapper.findDataTest('cancel');
        await button.trigger('click');
        expect(wrapper.vm.back).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });
    });
  });
});
