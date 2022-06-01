import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockCombinedUserAccounts } from '@/entities/user-account';
import { mockStorage } from '@/store/storage';

import { mockAssignedTeamMembers } from '@/entities/case-file';
import Component from '../case-file-activity/components/ViewAssigned.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const doMount = (shallow = false, storage) => {
  const options = {
    localVue,
    propsData: {
      caseFile: {
        id: 'mock-id',
        assignedTeamMembers: mockAssignedTeamMembers(),
        assignedTeamIds: [],
      },
      show: true,
    },
    mocks: {
      $storage: storage,
    },
  };
  if (shallow) {
    wrapper = shallowMount(Component, options);
  } else {
    wrapper = mount(Component, options);
  }
};

describe('ViewAssigned.vue', () => {
  storage.userAccount.actions.search = jest.fn(() => ({ ids: [mockCombinedUserAccounts()[0].entity.id] }));
  storage.userAccount.getters.getByIds = jest.fn(() => ([mockCombinedUserAccounts()[0]]));

  describe('Template', () => {
    describe('dialog', () => {
      it('displays the view assigned dialog', () => {
        doMount(true, storage);
        const element = wrapper.findDataTest('view-assigned-dialog');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Life Cycle', () => {
    describe('created', () => {
      beforeEach(() => {
        doMount(true, storage);
        wrapper.vm.setAssignedIndividuals = jest.fn();
        wrapper.vm.fetchUserAccounts = jest.fn();
        wrapper.vm.fetchTeams = jest.fn();
      });

      it('calls fetchUserAccounts with proper params', async () => {
        jest.clearAllMocks();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        const ids = ['mock-assigned-individual-id-3', 'mock-assigned-individual-id-1', 'mock-assigned-individual-id-2'];
        expect(wrapper.vm.fetchUserAccounts).toHaveBeenCalledWith(ids);
      });

      it('calls setAssignedIndividuals', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.setAssignedIndividuals).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.userAccount.getters.getByIds = jest.fn(() => ([
        { entity: { id: 'mock-assigned-individual-id-1', displayName: 'User A' } },
        { entity: { id: 'mock-assigned-individual-id-2', displayName: 'User B' } },
        { entity: { id: 'mock-assigned-individual-id-3', displayName: 'User C' } },
      ]));

      storage.team.getters.getByIds = jest.fn(() => ([
        { entity: { id: 'mock-assigned-team-id-1', name: 'Team A' } },
        { entity: { id: 'mock-assigned-team-id-2', name: 'Team B' } },
      ]));
      doMount(true, storage);
    });

    describe('close', () => {
      it('emits update:show false', async () => {
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('fetchUserAccounts', () => {
      it('should fetch user accounts by ids', async () => {
        const ids = ['1', '2'];
        const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
        await wrapper.vm.fetchUserAccounts(ids);
        expect(wrapper.vm.$storage.userAccount.actions.search).toHaveBeenCalledWith({ filter });
      });
    });

    describe('fetchTeams', () => {
      it('should fetch teams by ids', async () => {
        const ids = ['1', '2'];
        const filter = `search.in(Entity/Id, '${ids.join('|')}', '|')`;
        await wrapper.vm.fetchTeams(ids);
        expect(wrapper.vm.$storage.team.actions.search).toHaveBeenCalledWith({ filter });
      });
    });

    describe('setAssignedIndividuals', () => {
      it('build the proper object, attaching team info on each user', async () => {
        wrapper.vm.setAssignedIndividuals();

        expect(wrapper.vm.assignedIndividuals).toEqual([
          {
            entity: {
              displayName: 'User A',
              id: 'mock-assigned-individual-id-1',
            },
            id: 'mock-assigned-individual-id-1',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              displayName: 'User B',
              id: 'mock-assigned-individual-id-2',
            },
            id: 'mock-assigned-individual-id-2',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              displayName: 'User C',
              id: 'mock-assigned-individual-id-3',
            },
            id: 'mock-assigned-individual-id-3',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-2',
            teamName: 'Team B',
          },
          {
            entity: {
              displayName: 'User A',
              id: 'mock-assigned-individual-id-1',
            },
            id: 'mock-assigned-individual-id-1',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              displayName: 'User B',
              id: 'mock-assigned-individual-id-2',
            },
            id: 'mock-assigned-individual-id-2',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-1',
            teamName: 'Team A',
          },
          {
            entity: {
              displayName: 'User C',
              id: 'mock-assigned-individual-id-3',
            },
            id: 'mock-assigned-individual-id-3',
            isPrimaryContact: false,
            teamId: 'mock-assigned-team-id-2',
            teamName: 'Team B',
          }]);
      });
    });
  });
});
