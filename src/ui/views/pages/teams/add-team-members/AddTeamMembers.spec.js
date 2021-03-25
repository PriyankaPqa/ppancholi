import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockAppUserData } from '@/entities/app-user';
import Component from './AddTeamMembers.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('AddTeamMembers.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        show: true,
        teamMembers: mockAppUserData(),
      },
      store: {
        modules: {
          team: {
            state: {
              submitLoading: true,
            },
          },
        },
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('headers', () => {
      it('is correctly defined', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'teams.member_name',
            class: 'team_member_header',
            filterable: false,
            sortable: true,
            value: 'displayName',
          },
          {
            text: 'teams.member_email',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: 'emailAddress',
          },
          {
            text: 'teams.member_role',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: 'role',
          },
          {
            text: 'teams.member_status',
            class: 'team_member_header',
            filterable: false,
            sortable: false,
            value: '',
          },
        ]);
      });
    });

    describe('availableMembers', () => {
      it('it calls searchAppUser with current search', async () => {
        wrapper.vm.search = 'test';

        await wrapper.vm.$nextTick();

        expect(storage.appUser.getters.searchAppUser).toHaveBeenCalledWith('test', false, ['displayName', 'mail']);
      });
    });

    describe('loading', () => {
      it('is linked to submitLoading', async () => {
        expect(wrapper.vm.loading).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('close', () => {
      it('emit update:show with false', () => {
        wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0]).toEqual([false]);
      });
    });

    describe('getClassRow', () => {
      it('returns row_disabled if the user is already in the team', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('getRole', () => {
      it('returns the displayName property of the role from Azure AD', () => {
        const user = mockAppUserData()[0];
        expect(wrapper.vm.getRole(user)).toEqual('Contributor M');
      });
    });

    describe('isAlreadyInTeam', () => {
      it('returns true if the user is already in the team', () => {
        const user = mockAppUserData()[0];
        expect(wrapper.vm.isAlreadyInTeam(user)).toBeTruthy();
      });

      it('returns false if the user does not belong to the team', () => {
        const user = {
          id: '5',
          displayName: 'Test Brown',
          givenName: 'TEst',
          jobTitle: 'jobTitle',
          mail: null,
          userPrincipalName: 'test@test.com',
          roles: [],
        };
        expect(wrapper.vm.isAlreadyInTeam(user)).toBeFalsy();
      });
    });

    describe('isSelected', () => {
      it('returns true if the user is being selected', () => {
        const user = mockAppUserData()[0];
        wrapper.vm.selectedUsers = mockAppUserData();
        expect(wrapper.vm.isSelected(user)).toBeTruthy();
      });

      it('returns false if the user is not selected', () => {
        const user = mockAppUserData()[0];
        wrapper.vm.selectedUsers = [];
        expect(wrapper.vm.isSelected(user)).toBeFalsy();
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        wrapper.vm.selectedUsers = mockAppUserData();
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'TEst',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            roles: [],
          },
        ];
        wrapper.vm.onSelectAll({ items, value: true });
        expect(wrapper.vm.selectedUsers).toEqual([...mockAppUserData(), ...items]);
      });

      it('updates selectedUsers by removing unselected members', () => {
        const items = [
          {
            id: '5',
            displayName: 'Test Brown',
            givenName: 'TEst',
            jobTitle: 'jobTitle',
            mail: null,
            userPrincipalName: 'test@test.com',
            roles: [],
          },
        ];
        wrapper.vm.selectedUsers = [...mockAppUserData(), ...items];
        wrapper.vm.onSelectAll({ items, value: false });
        expect(wrapper.vm.selectedUsers).toEqual(mockAppUserData());
      });
    });

    describe('submit', () => {
      it('calls addTeamMembers actions with correct parameters (selectedUsers)', async () => {
        await wrapper.vm.submit();
        expect(storage.team.actions.addTeamMembers).toHaveBeenCalledWith(wrapper.vm.selectedUsers);
      });

      it('calls close method', async () => {
        jest.spyOn(wrapper.vm, 'close').mockImplementation(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });
    });
  });
});
