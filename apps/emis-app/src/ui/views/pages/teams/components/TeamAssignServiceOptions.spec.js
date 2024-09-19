import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedUserAccount } from '@libs/entities-lib/user-account';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockProvider } from '@/services/provider';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import { mockAppointmentProgram, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { mockTeamEntity, mockTeamsDataAddHoc } from '@libs/entities-lib/team';
import { EFilterKeyType } from '@libs/component-lib/types';
import flushPromises from 'flush-promises';
import Component from './TeamAssignServiceOptions.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia } = useMockUserAccountStore();
const { teamStore } = useMockTeamStore(pinia);
const { appointmentStaffMemberStore } = useMockAppointmentStaffMemberStore(pinia);
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);

const event = mockEventEntity();

describe('TeamAssignServiceOptions.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, additionalOverwrites = {}) => {
    jest.clearAllMocks();
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        teamId: 'team-id',
        teamMembers: [mockCombinedUserAccount()],
        events: [event],
      },
      mocks: {
        $services: services,
      },
      ...additionalOverwrites,
    });

    await flushPromises();
  };

  describe('Template', () => {
    describe('event drowpdown', () => {
      it('renders when the team is standard', async () => {
        teamStore.getById = jest.fn(() => mockTeamEntity());
        await mountWrapper(true);
        const element = wrapper.findDataTest('team_assignServiceOptions_event');
        expect(element.exists()).toBeTruthy();
      });
      it('does not renders when the team is ad hoc', async () => {
        teamStore.getById = jest.fn(() => mockTeamsDataAddHoc());
        await mountWrapper(true);
        const element = wrapper.findDataTest('team_assignServiceOptions_event');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('appointment program drowpdown', () => {
      it('renders', async () => {
        await mountWrapper(true);
        const element = wrapper.findDataTest('team_assignServiceOptions_appointmentProgram');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('assign service options table', () => {
      it('renders only if an appointment program is selected', async () => {
        await mountWrapper(true);
        const element = wrapper.findDataTest('team_assignServiceOptions_table');
        expect(element.exists()).toBeFalsy();

        await wrapper.setData({ selectedAppointmentProgramId: 'id' });
        const element2 = wrapper.findDataTest('team_assignServiceOptions_table');
        expect(element2.exists()).toBeTruthy();
      });
    });
  });

  describe('watch', () => {
    describe('selectedEvent', () => {
      it('calls onSelectEvent', async () => {
        teamStore.getById = jest.fn(() => mockTeamEntity());
        await mountWrapper();
        wrapper.vm.onSelectEvent = jest.fn();
        expect(wrapper.vm.onSelectEvent).toHaveBeenCalledTimes(0);
        await wrapper.setData({ selectedEvent: mockEventEntity({ id: 'ev-new-1' }) });
        expect(wrapper.vm.onSelectEvent).toHaveBeenCalledTimes(1);
      });
    });

    describe('events', () => {
      it('sets the selected event if the team is ad hoc', async () => {
        teamStore.getById = jest.fn(() => mockTeamsDataAddHoc());
        await mountWrapper();
        expect(wrapper.vm.selectedEvent).toEqual(wrapper.vm.events[0]);
        const event2 = mockEventEntity({ id: 'ev-adhoc-1' });
        await wrapper.setProps({ events: [event2] });
        expect(wrapper.vm.selectedEvent).toEqual(event2);
      });
    });

    describe('selectedAppointmentProgramId', () => {
      it('calls fetchStaffMembers', async () => {
        await mountWrapper();
        wrapper.vm.fetchStaffMembers = jest.fn();
        await wrapper.setData({ selectedAppointmentProgramId: '' });
        expect(wrapper.vm.fetchStaffMembers).toHaveBeenCalledTimes(0);
        await wrapper.setData({ selectedAppointmentProgramId: 'abc' });
        expect(wrapper.vm.fetchStaffMembers).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('team', () => {
      it('calls the store', async () => {
        await mountWrapper(true);
        expect(teamStore.getById).toHaveBeenCalledWith('team-id');
      });
    });

    describe('selectedAppointmentProgram', () => {
      it('calls the appt program store if there is a selected program id', async () => {
        await mountWrapper(true);
        await wrapper.setData({ selectedAppointmentProgramId: 'ap-id' });
        expect(appointmentProgramStore.getById).toHaveBeenCalledWith('ap-id');
        expect(wrapper.vm.selectedAppointmentProgram).toEqual(mockAppointmentProgram());
      });
    });

    describe('staffMembers', () => {
      it('calls the appt staff member store ', async () => {
        await mountWrapper(true);
        await wrapper.setData({ selectedAppointmentProgramId: 'ap-id' });
        expect(appointmentStaffMemberStore.getByAppointmentProgramId).toHaveBeenCalledWith('ap-id');
        expect(wrapper.vm.staffMembers).toEqual([mockAppointmentStaffMember()]);
      });
    });
  });

  describe('lifecycle - created', () => {
    it('sets the selected event if the team is adhoc', async () => {
      teamStore.getById = jest.fn(() => mockTeamsDataAddHoc());
      await mountWrapper();
      const hook = wrapper.vm.$options.created[0];
      hook.call(wrapper.vm);
      expect(wrapper.vm.selectedEvent).toEqual(event);
    });
  });

  describe('Methods', () => {
    describe('onSelectEvent', () => {
      it('resets selectedAppointmentProgramId and calls fetchAppointmentProgram', async () => {
        await mountWrapper();
        wrapper.vm.fetchAppointmentPrograms = jest.fn();
        wrapper.setData({ selectedAppointmentProgramId: 'abc' });
        await wrapper.vm.onSelectEvent();
        expect(wrapper.vm.selectedAppointmentProgramId).toEqual('');
        expect(wrapper.vm.fetchAppointmentPrograms).toHaveBeenCalled();
      });
    });

    describe('fetchAppointmentPrograms', () => {
      it('calls useAppointmentProgramStore and sets the appointmentPrograms', async () => {
        const program = mockAppointmentProgram();
        appointmentProgramStore.search = jest.fn(() => ({ values: [program] }));
        await mountWrapper();
        await wrapper.setData({ selectedEvent: mockEventEntity() });
        await wrapper.vm.fetchAppointmentPrograms();
        expect(appointmentProgramStore.search).toHaveBeenCalledWith({ params: {
          filter: { 'Entity/EventId': { value: mockEventEntity().id, type: EFilterKeyType.Guid }, 'Entity/AppointmentProgramStatus': 'Active' },
          top: 999,
          skip: 0,
        } });
        expect(wrapper.vm.appointmentPrograms).toEqual([program]);
      });
    });

    describe('fetchStaffMembers', () => {
      it('calls useAppointmentStaffMemberStore search', async () => {
        await mountWrapper();
        await wrapper.setData({ selectedAppointmentProgramId: 'p-id' });
        await wrapper.vm.fetchStaffMembers();
        expect(appointmentStaffMemberStore.search).toHaveBeenCalledWith({ params: {
          filter: { 'Entity/AppointmentProgramId': { value: 'p-id', type: EFilterKeyType.Guid } },
          top: 999,
          skip: 0,
        } });
      });
    });
  });
});
