import { createLocalVue, mount } from '@/test/testSetup';
import { format } from 'date-fns';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockAppointment, mockAppointmentProgram } from '@libs/entities-lib/appointment';
import { mockMember } from '@libs/entities-lib/household-create';
import { mockOptionItem } from '@libs/entities-lib/optionItem';

import { NEXT_AVAILABLE_MEMBER_ID } from './AppointmentForm.vue';
import appointmentHelpers from '../utils/appointmentHelpers';
import Component from './AppointmentDetailsContent.vue';

const localVue = createLocalVue();

const { pinia, appointmentProgramStore } = useMockAppointmentProgramStore();
useMockCaseFileStore(pinia);

describe('AppointmentDetailsContent', () => {
  let wrapper;

  const doMount = async (otherOptions = {}) => {
    jest.clearAllMocks();
    const options = {
      localVue,
      pinia,
      propsData: {
        appointment: mockAppointment(),
        primaryMemberId: 'PM_ID',
        attendee: mockMember(),
        isDetailsPage: false,
      },
      stubs: {
        StatusChip: true,
      },
      ...otherOptions,
    };

    wrapper = mount(Component, options);
    await wrapper.vm.$nextTick();
  };

  describe('Computed', () => {
    describe('time', () => {
      it('returns the time in the right format', async () => {
        await doMount();
        wrapper.vm.$t = jest.fn((x) => x);
        await wrapper.setProps({ appointment: mockAppointment({ startDate: '2024-01-29T16:00:00.000Z', endDate: '2024-01-29T16:30:00.000Z' }) });
        expect(wrapper.vm.time).toEqual(`${format(new Date('2024-01-29T16:00:00.000Z'), 'p')} (caseFile.appointments.duration.minutes)`);
        expect(wrapper.vm.$t).toHaveBeenCalledWith('caseFile.appointments.duration.minutes', { minutes: 30 });
        await wrapper.setProps({ appointment: mockAppointment({ startDate: '2024-01-29T16:00:00.000Z', endDate: '2024-01-29T17:00:00.000Z' }) });
        expect(wrapper.vm.time).toEqual(`${format(new Date('2024-01-29T16:00:00.000Z'), 'p')} (caseFile.appointments.duration.minutes)`);
        expect(wrapper.vm.$t).toHaveBeenCalledWith('caseFile.appointments.duration.minutes', { minutes: 60 });
      });
    });

    describe('timeZone', () => {
      it('returns the time zone', async () => {
        jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
          timeZone: 'America/Vancouver',
        });
        await doMount();
        expect(wrapper.vm.timeZone).toEqual('(UTC-07:00)  Pacific Time');

        jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
          timeZone: 'America/Toronto',
        });
        await doMount();
        expect(wrapper.vm.timeZone).toEqual('(UTC-04:00)  Eastern Time');
      });
    });

    describe('staffMemberNameRole', () => {
      it('calls getStaffMemberName and returns the result', async () => {
        appointmentHelpers.getStaffMemberName = jest.fn(() => 'john (sys admin)');
        await doMount();
        expect(wrapper.vm.staffMemberNameRole).toEqual('john (sys admin)');
        expect(appointmentHelpers.getStaffMemberName).toHaveBeenCalledWith(wrapper.vm.appointment.userAccountId, NEXT_AVAILABLE_MEMBER_ID, wrapper.vm);
      });
    });

    describe('modalityName', () => {
      it('returns the modality name of the appointment', async () => {
        appointmentProgramStore.getAppointmentModalities = jest.fn(() => [mockOptionItem({ id: 'mod-id', name: { translation: { en: 'mod-name-en' } } })]);
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ appointmentModalityId: 'mod-id' }) });
        expect(wrapper.vm.modalityName).toEqual('mod-name-en');
      });
    });

    describe('appointmentProgram', () => {
      it('returns the appointment from the store', async () => {
        appointmentProgramStore.getById = jest.fn(() => mockAppointmentProgram({ id: 'ap-id' }));
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ appointmentProgramId: 'ap-id' }) });
        expect(wrapper.vm.appointmentProgram).toEqual(mockAppointmentProgram({ id: 'ap-id' }));
      });
    });

    describe('serviceOptionName', () => {
      it('returns the service option type name', async () => {
        appointmentProgramStore.getById = jest.fn(() => mockAppointmentProgram({ serviceOptions: [{ id: 'so-id', serviceOptionType: { optionItemId: 'oi-1' } }] }));
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [mockOptionItem({ id: 'oi-1', name: { translation: { en: 'so-type-name-en' } } })]);
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ serviceOptionId: 'so-id' }) });
        expect(wrapper.vm.serviceOptionName).toEqual('so-type-name-en');
      });
    });
  });

  describe('Template', () => {
    describe('attendee', () => {
      it('renders and displays the attendee name', async () => {
        appointmentHelpers.getAttendeeName = jest.fn(() => 'Jane Doe');
        await doMount();
        const element = wrapper.findDataTest('appointment-details-attendee');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('Jane Doe');
      });
    });

    describe('date', () => {
      it('renders and displays the date', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ startDate: '2024-10-10' }) });
        const element = wrapper.findDataTest('appointment-details-date');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain(format(new Date('2024-10-10'), 'PPPP'));
      });
    });

    describe('time', () => {
      it('renders and displays the time and timezone', async () => {
        await doMount({ computed: { time() {
          return '09:00 AM';
        } },
        timeZone() {
          return 'Eastern Time';
        } });
        const element = wrapper.findDataTest('appointment-details-time');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('09:00 AM');
        expect(element.text()).toContain('Eastern Time');
      });
    });

    describe('link', () => {
      it('renders if the sendConfirmationEmail is true and displays the teams link on the details page', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ sendConfirmationEmail: true, onlineMeetingUrl: 'url' }), isDetailsPage: true });
        const element = wrapper.findDataTest('appointment-details-link');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('url');
        await wrapper.setProps({ isDetailsPage: false });
        expect(element.text()).toContain('—');
      });
      it('does not render if sendConfirmationEmail is false', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ sendConfirmationEmail: false }) });
        const element = wrapper.findDataTest('appointment-details-link');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('setMeetingFor', () => {
      it('renders and displays the date', async () => {
        await doMount({ computed: { staffMemberNameRole() {
          return 'John smith (sys admin)';
        } },
        });
        const element = wrapper.findDataTest('appointment-details-setMeetingFor');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('John smith (sys admin)');
      });
    });

    describe('modality', () => {
      it('renders and displays the modality', async () => {
        await doMount({ computed: { modalityName() {
          return 'Phone';
        } },
        });
        const element = wrapper.findDataTest('appointment-details-modality');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('Phone');
      });
    });

    describe('appointmentProgram', () => {
      it('renders and displays the appointmentProgram', async () => {
        await doMount({ computed: { appointmentProgram() {
          return mockAppointmentProgram({ name: { translation: { en: 'Program 1' } } });
        } },
        });
        const element = wrapper.findDataTest('appointment-details-appointmentProgram');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('Program 1');
      });
    });

    describe('serviceOptionName', () => {
      it('renders and displays the serviceOptionName', async () => {
        await doMount({ computed: { serviceOptionName() {
          return 'Service Option 1';
        } },
        });
        const element = wrapper.findDataTest('appointment-details-serviceOption');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('Service Option 1');
      });
    });
    describe('notes', () => {
      it('renders and displays the notes', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ notes: 'my notes' }) });
        const element = wrapper.findDataTest('appointment-details-notes');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('my notes');
      });
    });

    describe('sendEmailToAttendee', () => {
      it('renders and displays the sendEmailToAttendee', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ sendConfirmationEmail: true }) });
        const element = wrapper.findDataTest('appointment-details-sendEmailToAttendee');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('yes');
      });
    });
    describe('sendEmailTo', () => {
      it('renders and displays the attendee email if sendConfirmationEmail is true', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ sendConfirmationEmail: true, attendeeEmail: 'email@email.com' }) });
        const element = wrapper.findDataTest('appointment-details-sendEmailTo');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toContain('email@email.com');
      });
      it('does not render if sendConfirmationEmail is false', async () => {
        await doMount();
        await wrapper.setProps({ appointment: mockAppointment({ sendConfirmationEmail: false }) });
        const element = wrapper.findDataTest('appointment-details-sendEmailTo');
        expect(element.exists()).toBeFalsy();
      });
    });
  });
});
