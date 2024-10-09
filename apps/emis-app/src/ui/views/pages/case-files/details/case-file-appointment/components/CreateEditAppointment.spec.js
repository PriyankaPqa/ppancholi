import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockAppointmentStore } from '@/pinia/appointment/appointment.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockMember } from '@libs/entities-lib/household-create';
import { mockAppointmentRequest } from '@libs/entities-lib/appointment';
import Component from './CreateEditAppointment.vue';

const localVue = createLocalVue();

const { pinia } = useMockCaseFileStore();
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);
const { appointmentStore } = useMockAppointmentStore(pinia);
useMockPersonStore(pinia);

describe('CreateEditAppointment', () => {
  let wrapper;

  const doMount = (isEditMode, otherOptions = {}) => {
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
      ...otherOptions,
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

    describe('fetchAppointmentPrograms', () => {
      it('calls appointmentProgramStore fetchByEventId', async () => {
        await wrapper.vm.fetchAppointmentPrograms();
        expect(appointmentProgramStore.fetchByEventId).toHaveBeenCalledWith(wrapper.vm.caseFile.eventId);
      });
    });

    describe('showConfirmation', () => {
      it('calls confirmation and submit if answer is positive', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.submit = jest.fn();
        await wrapper.vm.showConfirmation();
        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: ('caseFile.appointments.confirmCreate.title'),
          messages: ('caseFile.appointments.confirmCreate.content'),
        });
        expect(wrapper.vm.submit).toHaveBeenCalled();
      });
    });

    describe('initSubmit', () => {
      it('does nothing if validation of form fails', async () => {
        wrapper.vm.submit = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        await wrapper.vm.initSubmit();
        expect(wrapper.vm.submit).not.toHaveBeenCalled();
      });
      it('does nothing if there is no start date set in the request data', async () => {
        wrapper.vm.submit = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({ submitRequestData: { startDate: null } });
        await wrapper.vm.initSubmit();
        expect(wrapper.vm.submit).not.toHaveBeenCalled();
        expect(wrapper.vm.showTimeSlotError).toBeTruthy();
      });
      it('calls submit if validation passes when in edit mode ', async () => {
        doMount(true);
        wrapper.vm.submit = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({ submitRequestData: { startDate: '2024-10-10' } });
        await wrapper.vm.initSubmit();
        expect(wrapper.vm.submit).toHaveBeenCalled();
      });
      it('set showReview true if validation passes when in create mode ', async () => {
        wrapper.vm.submit = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.setData({ submitRequestData: { startDate: '2024-10-10' } });
        await wrapper.vm.initSubmit();
        expect(wrapper.vm.submit).not.toHaveBeenCalled();
        expect(wrapper.vm.showReview).toBeTruthy();
      });
    });

    describe('submit', () => {
      it('calls createAppointment if isEditMode is false', async () => {
        doMount(false, { computed: { primaryMember() {
          return mockMember({ contactInformation: { preferredLanguage: { optionItemId: 'oi-id', specifiedOther: null } } });
        } } });
        await wrapper.setData({ submitRequestData: mockAppointmentRequest() });
        await wrapper.vm.submit();
        expect(appointmentStore.createAppointment).toHaveBeenCalledWith({ ...mockAppointmentRequest(), preferredLanguage: { optionItemId: 'oi-id', specifiedOther: null } });
      });

      test('after submitting, the user is redirected to the referral detail page', async () => {
        appointmentStore.createAppointment = jest.fn(() => ({ id: 'abc' }));
        await wrapper.vm.submit();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.appointments.details.name,
          params: { appointmentId: 'abc', id: '' },
        });
      });

      test('after creating an event a toast notification is shown', async () => {
        appointmentStore.createAppointment = jest.fn(() => ({ id: 'abc' }));
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('caseFile.appointments.success.create');
      });

      test('if creating failed a toast notification is shown', async () => {
        appointmentStore.createAppointment = jest.fn();
        await wrapper.vm.submit();
        expect(wrapper.vm.$toasted.global.error).toHaveBeenCalledWith('caseFile.appointments.failed.create');
      });
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

    describe('attendee', () => {
      it('returns the selected attendee of the submit request', async () => {
        const member = mockMember({ id: 'a-id' });
        doMount(false, { computed: { members() {
          return [member];
        } } });
        await wrapper.setData({ submitRequestData: { attendeeId: 'a-id' } });
        expect(wrapper.vm.attendee).toEqual(member);
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
        const spy = jest.spyOn(wrapper.vm, 'initSubmit').mockImplementation(() => { });
        const button = wrapper.findDataTest('save');
        await button.trigger('click');
        expect(wrapper.vm.initSubmit).toHaveBeenCalledTimes(1);
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
