import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { format } from 'date-fns';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockAppointment, AppointmentStatus, mockAppointmentProgram, mockServiceOption, Appointment, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { mockMember } from '@libs/entities-lib/household-create';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { mockProvider } from '@/services/provider';
import Component from './AppointmentForm.vue';

const localVue = createLocalVue();
const services = mockProvider();

const pinia = getPiniaForUser(UserRoles.level6);
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);
const { appointmentStaffMemberStore } = useMockAppointmentStaffMemberStore(pinia);
const { userStore } = useMockUserStore(pinia);
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
useMockCaseFileStore(pinia);

describe('AppointmentForm', () => {
  let wrapper;

  const doMount = async (shallow = true, otherOptions = {}, mountPinia = pinia) => {
    jest.clearAllMocks();
    const options = {
      localVue,
      pinia: mountPinia,
      propsData: {
        appointment: mockAppointment(),
        isEditMode: false,
        eventId: 'EVENT_ID',
        primaryMemberId: 'PM_ID',
        attendees: [mockMember()],
        showTimeSlotError: false,
      },
      mocks: {
        $services: services,
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
        await doMount(false, { computed: { selectedAppointmentProgram() {
          return mockAppointmentProgram({ id: '2' });
        } } });
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentProgramId: '2' }) });
        expect(appointmentProgramStore.getServiceOptionTypes).toHaveBeenCalledWith(wrapper.vm.appointment.serviceOptionId);
      });
    });

    describe('serviceOptions', () => {
      it('returns service options of the selected appointment program, that have active types', async () => {
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [mockOptionItem({ id: 'active-id' })]);
        const appointmentProgram = mockAppointmentProgram({ serviceOptions:
          [mockServiceOption({ serviceOptionType: { optionItemId: 'not-active-id' } }),
            mockServiceOption({ serviceOptionType: { optionItemId: 'active-id' } }),
          ] });

        await doMount(false, { computed: { selectedAppointmentProgram() {
          return appointmentProgram;
        } } });

        expect(wrapper.vm.serviceOptions).toEqual([mockServiceOption({ serviceOptionType: { optionItemId: 'active-id' } })]);
      });
      it('contains the service option of the initial appointment ', async () => {
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [mockOptionItem({ id: 'active-id' })]);
        const appointmentProgram = mockAppointmentProgram({ serviceOptions:
          [mockServiceOption({ serviceOptionType: { optionItemId: 'not-active-id' } }),
            mockServiceOption({ serviceOptionType: { optionItemId: 'active-id' } }),
          ] });

        await doMount(false, { computed: { selectedAppointmentProgram() {
          return appointmentProgram;
        } } });

        await wrapper.setProps({ appointment: new Appointment({ serviceOptionId: 'not-active-id' }) });

        expect(wrapper.vm.serviceOptions).toEqual(
          [mockServiceOption(
            { serviceOptionType: { optionItemId: 'active-id' } },
            mockServiceOption({ serviceOptionType: { optionItemId: 'not-active-id' } }),
          )],
        );
      });
    });

    describe('selectedServiceOption', () => {
      it('returns the service Option selected by the user from the dropdown', async () => {
        await doMount(false, { computed: { serviceOptions() {
          return [mockServiceOption({ id: '1' }), mockServiceOption({ id: '2' })];
        } } });

        await wrapper.setData({ localAppointment: mockAppointment({ serviceOptionId: '2' }) });
        expect(wrapper.vm.selectedServiceOption).toEqual(mockServiceOption({ id: '2' }));
      });
    });

    describe('allModalities', () => {
      it('calls the store getter', async () => {
        await doMount(false, { computed: { selectedAppointmentProgram() {
          return mockAppointmentProgram({ id: '2' });
        } } });
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentProgramId: '2' }) });
        expect(appointmentProgramStore.getAppointmentModalities).toHaveBeenCalledWith(wrapper.vm.appointment.appointmentModalityId);
      });
    });

    describe('modalities', () => {
      it('returns the modalities of the selected service option', async () => {
        appointmentProgramStore.getAppointmentModalities = jest.fn(() => [mockOptionItem({ id: 'in' }), mockOptionItem({ id: 'out' })]);
        await doMount(false, { computed: { selectedServiceOption() {
          return mockServiceOption({ appointmentModalities: [{ optionItemId: 'in' }] });
        } } });

        expect(wrapper.vm.modalities).toEqual([mockOptionItem({ id: 'in' })]);
      });
    });

    describe('serviceOptionStaffMembers', () => {
      it('returns the staff members that belong to the selected appointment program and service option', async () => {
        appointmentStaffMemberStore.getByCriteria = jest.fn(() => [
          mockAppointmentStaffMember({ serviceOptionIds: ['so-1'] }),
          mockAppointmentStaffMember({ serviceOptionIds: ['so-2'] }),
        ]);
        await doMount(false, { computed: {
          selectedAppointmentProgram() {
            return mockAppointmentProgram({ id: 'ap-1' });
          },
          selectedServiceOption() {
            return mockServiceOption({ id: 'so-1' });
          },
        } });

        expect(appointmentStaffMemberStore.getByCriteria).toHaveBeenCalledWith('ap-1', true, ['appointmentProgramId']);
        expect(wrapper.vm.serviceOptionStaffMembers).toEqual([mockAppointmentStaffMember({ serviceOptionIds: ['so-1'] })]);
      });
    });

    describe('displayedStaffMemberIds', () => {
      test(
        'level 6 - it returns the id of the current user first, then nextAvailableMemberId, and all other user account ids of the staff members, in alphabetical order',
        async () => {
          userStore.getUserId = jest.fn(() => 'my-id');
          userAccountMetadataStore.getById = jest.fn((id) => (mockUserAccountMetadata({ id, givenName: id })));

          await doMount(false, { computed: {
            selectedServiceOption() {
              return mockServiceOption({ id: 'so-1' });
            },
            serviceOptionStaffMembers() {
              return [
                mockAppointmentStaffMember({ userAccountId: 'm-bbb' }),
                mockAppointmentStaffMember({ userAccountId: 'm-aaa' }),
                mockAppointmentStaffMember({ userAccountId: 'my-id' }),
              ];
            },
          } });

          expect(wrapper.vm.displayedStaffMemberIds).toEqual(['my-id', wrapper.vm.nextAvailableMemberId, 'm-aaa', 'm-bbb']);
        },
      );

      test('level 2 - it returns the id of the current user', async () => {
        const pinia = getPiniaForUser(UserRoles.level2);
        useMockAppointmentProgramStore(pinia);
        useMockAppointmentStaffMemberStore(pinia);
        const { userStore } = useMockUserStore(pinia);
        const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
        useMockCaseFileStore(pinia);

        userStore.getUserId = jest.fn(() => 'my-id');
        userAccountMetadataStore.getById = jest.fn((id) => (mockUserAccountMetadata({ id, givenName: id })));

        await doMount(false, { computed: {
          selectedServiceOption() {
            return mockServiceOption({ id: 'so-1' });
          },
          serviceOptionStaffMembers() {
            return [
              mockAppointmentStaffMember({ userAccountId: 'm-aaa' }),
              mockAppointmentStaffMember({ userAccountId: 'my-id' }),
            ];
          },
        } }, pinia);

        expect(wrapper.vm.displayedStaffMemberIds).toEqual(['my-id']);
      });

      test('level 0 - it returns only next available member id', async () => {
        const pinia = getPiniaForUser(UserRoles.level0);
        useMockAppointmentProgramStore(pinia);
        useMockAppointmentStaffMemberStore(pinia);
        const { userStore } = useMockUserStore(pinia);
        const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
        useMockCaseFileStore(pinia);

        userStore.getUserId = jest.fn(() => 'my-id');
        userAccountMetadataStore.getById = jest.fn((id) => (mockUserAccountMetadata({ id, givenName: id })));

        await doMount(false, { computed: {
          selectedServiceOption() {
            return mockServiceOption({ id: 'so-1' });
          },
          serviceOptionStaffMembers() {
            return [
              mockAppointmentStaffMember({ userAccountId: 'm-aaa' }),
              mockAppointmentStaffMember({ userAccountId: 'my-id' }),
            ];
          },
        } }, pinia);

        expect(wrapper.vm.displayedStaffMemberIds).toEqual([wrapper.vm.nextAvailableMemberId]);
      });
    });

    describe('isOnline', () => {
      it('returns false if no modality is selected, true if the selected modality is online', async () => {
        await doMount(false, { computed: {
          allModalities() {
            return [mockOptionItem({ id: 'online-id', isOnline: true }), mockOptionItem({ id: 'offline-id', isOnline: false })];
          },
        } });
        expect(wrapper.vm.isOnline).toBeFalsy();
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentModalityId: 'online-id' }) });
        expect(wrapper.vm.isOnline).toBeTruthy();
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentModalityId: 'offline-id' }) });
        expect(wrapper.vm.isOnline).toBeFalsy();
      });
    });

    describe('selectedTime', () => {
      test('getter - it returns the local appointment start and end time as date range', async () => {
        await doMount();
        await wrapper.setData({ selectedDate: '2024-10-01',
          localAppointment: mockAppointment({ startDate: '2024-10-01 09:00', endDate: '2024-10-01 10:00' }) });
        expect(wrapper.vm.selectedTime).toEqual({ startDateTime: '2024-10-01 09:00', endDateTime: '2024-10-01 10:00' });
      });
      test('setter - it sets the local appointment start and end time', async () => {
        await doMount(false);
        wrapper.vm.fetchStaffMemberAvailability = jest.fn();
        wrapper.vm.selectedTime = { startDateTime: '2024-10-01T13:00:00.000Z', endDateTime: '2024-10-01T14:00:00.000Z' };
        await wrapper.setData({ selectedDate: '2024-10-01' });
        expect(wrapper.vm.localAppointment.startDate).toEqual('2024-10-01T13:00:00.000Z');
      });
    });
  });

  describe('Methods', () => {
    describe('getServiceOptionTypeName', () => {
      it('returns the type name from the service option types', async () => {
        appointmentProgramStore.getServiceOptionTypes = jest.fn(() => [{ id: '1', name: { translation: { en: 'name-1' } } }, { id: '2', name: { translation: { en: 'name-2' } } }]);
        await doMount();
        const res = await wrapper.vm.getServiceOptionTypeName(mockServiceOption({ serviceOptionType: { optionItemId: '2' } }));
        expect(res).toEqual('name-2');
      });
    });

    describe('getAttendeeName', () => {
      it('returns the full name of the member', async () => {
        const member = mockMember({ identitySet: { firstName: 'John', lastName: 'Doe' }, id: 'm-id-1' });
        await doMount();
        const res = wrapper.vm.getAttendeeName(member);
        expect(res).toEqual('John Doe');
        await wrapper.setProps({ primaryMemberId: 'm-id-1' });
        const res2 = wrapper.vm.getAttendeeName(member);
        expect(res2).toEqual('John Doe (caseFile.appointments.attendee.primary)');
      });
    });

    describe('getStaffMemberName', () => {
      it('returns the right name if the id is nextAvailableMemberId', async () => {
        await doMount();
        expect(wrapper.vm.getStaffMemberName(wrapper.vm.nextAvailableMemberId)).toEqual('caseFile.appointments.nextAvailable');
      });

      it('returns "myself" if the id is that of the current user', async () => {
        userStore.getUserId = jest.fn(() => 'my-id');
        await doMount();
        expect(wrapper.vm.getStaffMemberName('my-id')).toEqual('caseFile.appointments.myself');
      });

      it('returns the name of the user', async () => {
        userAccountMetadataStore.getById = jest.fn(() => (mockUserAccountMetadata({ id: 'u-1', displayName: 'Joe Abc', roleName: { translation: { en: 'Sys admin' } } })));
        await doMount();
        expect(wrapper.vm.getStaffMemberName('u-1')).toEqual('Joe Abc (Sys admin)');
      });
    });

    describe('fetchStaffMembers', () => {
      it('calls fetchByAppointmentProgramId', async () => {
        await doMount(false, { computed: {
          selectedAppointmentProgram() {
            return mockAppointmentProgram({ id: 'ap-1' });
          },
        } });
        await wrapper.vm.fetchStaffMembers();
        expect(appointmentStaffMemberStore.fetchByAppointmentProgramId).toHaveBeenCalledWith('ap-1');
      });
    });

    describe('fetchStaffMemberAvailability', () => {
      it('calls service fetchAvailabilites with the right payload - one staff member', async () => {
        await doMount(true, { computed: { selectedAppointmentProgram() {
          return mockAppointmentProgram({ id: 'a-1' });
        } } });
        await wrapper.setData({ localAppointment: mockAppointment({ userAccountId: 'ua-1' }), selectedDate: '2024-10-01' });
        await wrapper.vm.fetchStaffMemberAvailability;
        expect(wrapper.vm.$services.appointmentStaffMembers.fetchAvailabilites).toHaveBeenCalledWith({
          appointmentProgramId: 'a-1',
          userAccountIds: ['ua-1'],
          selectedDate: '2024-10-01',
          selectedDateStartInUtc: new Date('2024-10-01 0:00').toISOString(),
        });
      });
      it('calls service fetchAvailabilites with the right payload - next available staff member', async () => {
        await doMount(true, { computed: {
          selectedAppointmentProgram() {
            return mockAppointmentProgram({ id: 'a-1' });
          },
          displayedStaffMemberIds() {
            return ['next-available-member', 'u-1', 'u-2'];
          },
        } });
        await wrapper.setData({ localAppointment: mockAppointment({ userAccountId: wrapper.vm.nextAvailableMemberId }), selectedDate: '2024-10-01' });
        await wrapper.vm.fetchStaffMemberAvailability;
        expect(wrapper.vm.$services.appointmentStaffMembers.fetchAvailabilites).toHaveBeenCalledWith({
          appointmentProgramId: 'a-1',
          userAccountIds: ['u-1', 'u-2'],
          selectedDate: '2024-10-01',
          selectedDateStartInUtc: new Date('2024-10-01 0:00').toISOString(),
        });
      });
    });
  });

  describe('watchers', () => {
    describe('selectedAppointmentProgram', () => {
      it('resets the serviceoptionid if there was a program selected previously', async () => {
        appointmentProgramStore.getByCriteria = jest.fn(() => [mockAppointmentProgram({ id: '1' }), mockAppointmentProgram({ id: '2' })]);
        await doMount(true);
        await wrapper.setData({ localAppointment: mockAppointment({ serviceOptionId: 'so-id' }) });
        wrapper.vm.localAppointment.appointmentProgramId = '1';
        await wrapper.vm.$nextTick();
        wrapper.vm.localAppointment.appointmentProgramId = '2';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.localAppointment.serviceOptionId).toEqual(null);
      });

      it('calls fetchStaffMembers', async () => {
        await doMount(true);
        wrapper.vm.fetchStaffMembers = jest.fn();
        wrapper.vm.localAppointment.appointmentProgramId = '1';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.fetchStaffMembers).toHaveBeenCalled();
      });
    });

    describe('selectedServiceOption', () => {
      it('resets the appointmentModalityId and userAccountId if there was an option selected previously', async () => {
        await doMount(true, { computed: { serviceOptions() {
          return [mockServiceOption({ id: '1' }), mockServiceOption({ id: '2' })];
        },
        } });
        await wrapper.setData({ localAppointment: mockAppointment({ appointmentModalityId: 'm-id', userAccountId: 'u-id' }) });
        wrapper.vm.localAppointment.serviceOptionId = '1';
        await wrapper.vm.$nextTick();
        wrapper.vm.localAppointment.serviceOptionId = '2';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.localAppointment.appointmentModalityId).toEqual(null);
        expect(wrapper.vm.localAppointment.userAccountId).toEqual(null);
      });
    });

    describe('selectedDuration', () => {
      it('resets the start and end time of the appointment if it is changed from a previous value', async () => {
        await doMount();
        await wrapper.setData({ selectedDuration: '30' });
        await wrapper.setData({ localAppointment: mockAppointment({ startDate: '2024-10-01 09:00', endDate: '2024-10-01 10:00' }) });
        await wrapper.setData({ selectedDuration: '15' });
        expect(wrapper.vm.localAppointment.startDate).toBeNull();
        expect(wrapper.vm.localAppointment.endDate).toBeNull();
      });
    });

    describe('selectedDate', () => {
      it('emits update:showTimeSlotError resets to false', async () => {
        await doMount();
        await wrapper.setData({ selectedDate: '2024-10-12' });
        expect(wrapper.emitted('update:showTimeSlotError')[0][0]).toEqual(false);
      });
      it('calls fetchStaffMemberAvailability if there is a selected staff member', async () => {
        await doMount();
        wrapper.vm.fetchStaffMemberAvailability = jest.fn();
        await wrapper.setData({ localAppointment: mockAppointment({ userAccountId: 'u-1' }) });
        await wrapper.setData({ selectedDate: '2024-10-12' });
        expect(wrapper.vm.fetchStaffMemberAvailability).toHaveBeenCalled();
      });
    });

    describe('localAppointment.userAccountId', () => {
      it('calls fetchStaffMemberAvailability if there is a selected date', async () => {
        await doMount();
        wrapper.vm.fetchStaffMemberAvailability = jest.fn();
        await wrapper.setData({ selectedDate: '2024-10-12' });
        await wrapper.setData({ localAppointment: mockAppointment({ userAccountId: 'u-1' }) });
        expect(wrapper.vm.fetchStaffMemberAvailability).toHaveBeenCalled();
      });
    });

    describe('isOnline', () => {
      it('stores sendConfirmationEmail into initialSelectedSendConfirmation and sets it to true if isOnline is true', async () => {
        await doMount(false, { computed: {
          allModalities() {
            return [mockOptionItem({ id: 'online-id', isOnline: true }), mockOptionItem({ id: 'offline-id', isOnline: false })];
          },
        } });
        wrapper.vm.localAppointment.sendConfirmationEmail = false;
        wrapper.vm.localAppointment.appointmentModalityId = 'online-id';
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.localAppointment.sendConfirmationEmail).toBeTruthy();
        expect(wrapper.vm.initialSelectedSendConfirmation).toEqual(false);
      });

      it(
        'restores sendConfirmationEmail from initialSelectedSendConfirmation and resets initialSelectedSendConfirmation if isOnline is false',
        async () => {
          await doMount(false, { computed: {
            allModalities() {
              return [mockOptionItem({ id: 'online-id', isOnline: true }), mockOptionItem({ id: 'offline-id', isOnline: false })];
            },
          } });
          wrapper.vm.initialSelectedSendConfirmation = false;
          wrapper.vm.localAppointment.appointmentModalityId = 'offline-id';
          await wrapper.vm.$nextTick();
          expect(wrapper.vm.localAppointment.sendConfirmationEmail).toEqual(false);
          expect(wrapper.vm.initialSelectedSendConfirmation).toBeNull();
        },
      );
    });

    describe('localAppointment', () => {
      it('emits when is changed', async () => {
        await doMount();
        const appt = mockAppointment({ id: '2' });
        await wrapper.setData({ localAppointment: appt });
        expect(wrapper.emitted('update:appointment')[0][0]).toEqual(appt);
      });
    });
  });
});
