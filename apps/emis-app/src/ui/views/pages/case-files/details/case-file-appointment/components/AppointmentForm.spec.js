import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { format } from 'date-fns';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockAppointmentStore } from '@/pinia/appointment/appointment.mock';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockAppointment, AppointmentStatus, mockAppointmentProgram } from '@libs/entities-lib/appointment';
import { mockMember } from '@libs/entities-lib/household-create';

import Component from './AppointmentForm.vue';

const localVue = createLocalVue();

const { pinia } = useMockCaseFileStore();
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);
useMockAppointmentStore(pinia);
useMockAppointmentStaffMemberStore(pinia);

describe('AppointmentForm', () => {
  let wrapper;

  const doMount = async (shallow = true, otherOptions = {}) => {
    jest.clearAllMocks();
    const options = {
      localVue,
      pinia,
      propsData: {
        appointment: mockAppointment(),
        isEditMode: false,
        eventId: 'EVENT_ID',
        primaryMemberId: 'PM_ID',
        attendees: [mockMember()],
        showTimeSlotError: false,
      },
      ...otherOptions,
    };

    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };

  describe('Computed', () => {
    describe('today', () => {
      it('returns the date of today', async () => {
        await doMount(false);
        const today = format(new Date(), 'yyyy-MM-dd');
        expect(wrapper.vm.today).toEqual(today);
      });
    });

    describe('statuses', () => {
      it('returns only scheduled if in create mode', async () => {
        await doMount(false);
        await wrapper.setProps({ isEditMode: false });
        expect(wrapper.vm.statuses).toEqual([AppointmentStatus.Scheduled]);
      });
      it('returns all statuses if in edit mode', async () => {
        await doMount(false);
        await wrapper.setProps({ isEditMode: true });
        expect(wrapper.vm.statuses).toEqual([AppointmentStatus.Scheduled, AppointmentStatus.Rescheduled, AppointmentStatus.Cancelled]);
      });
    });

    describe('appointmentPrograms', () => {
      it('calls the store and returns the value', async () => {
        appointmentProgramStore.getByCriteria = jest.fn(() => [mockAppointmentProgram()]);
        await doMount(false);
        expect(appointmentProgramStore.getByCriteria).toHaveBeenCalledWith(wrapper.vm.eventId, true, ['eventId']);
        expect(wrapper.vm.appointmentPrograms).toEqual([mockAppointmentProgram()]);
      });
    });

    describe('selectedAppointmentProgram', () => {
      it('returns the appointment program that was selected in the dropdown', async () => {
        appointmentProgramStore.getByCriteria = jest.fn(() => [mockAppointmentProgram({ id: '1' }), mockAppointmentProgram({ id: '2' })]);
        await doMount(false);
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentProgramId: '2' }) });
        expect(wrapper.vm.selectedAppointmentProgram).toEqual(mockAppointmentProgram({ id: '2' }));
      });
    });

    describe('serviceOptionTypes', () => {
      it('calls the store getter', async () => {
        await doMount(false);
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentProgramId: '2' }) });
        expect(appointmentProgramStore.getServiceOptionTypes).toHaveBeenCalledWith(wrapper.vm.appointment.serviceOptionId);
      });
    });
  });
});
