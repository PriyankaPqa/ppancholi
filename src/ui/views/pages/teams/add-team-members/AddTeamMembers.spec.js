import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import { mockTeamMembersData } from '@/entities/team';
import { RcDialog } from '@crctech/component-library';
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
        teamMembers: mockTeamMembersData(),
        teamId: 'abc',
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

  describe('Template', () => {
    describe('RcDialog', () => {
      describe('submit button', () => {
        it('is disabled if no selected members', () => {
          const component = wrapper.findComponent(RcDialog);
          expect(component.props('submitButtonDisabled')).toEqual(true);
        });

        it('is enabled if at least one selected members', async () => {
          const component = wrapper.findComponent(RcDialog);
          await wrapper.setData({
            selectedUsers: [{}],
          });
          expect(component.props('submitButtonDisabled')).toEqual(false);
        });
      });
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

        expect(storage.userAccount.getters.getByCriteria).toHaveBeenCalledWith('test', false, ['displayName', 'emailAddress']);
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
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_disabled');
      });

      it('returns row_active if the user is currently selected', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => true);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('row_active');
      });

      it('returns "" otherwise', () => {
        jest.spyOn(wrapper.vm, 'isAlreadyInTeam').mockImplementation(() => false);
        jest.spyOn(wrapper.vm, 'isSelected').mockImplementation(() => false);
        const user = mockTeamMembersData()[0];
        expect(wrapper.vm.getClassRow(user)).toEqual('');
      });
    });

    describe('isAlreadyInTeam', () => {
      it('returns true if the user is already in the team', () => {
        const user = mockTeamMembersData()[0];
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
        const user = mockTeamMembersData()[0];
        wrapper.vm.selectedUsers = mockTeamMembersData();
        expect(wrapper.vm.isSelected(user)).toBeTruthy();
      });

      it('returns false if the user is not selected', () => {
        const user = mockTeamMembersData()[0];
        wrapper.vm.selectedUsers = [];
        expect(wrapper.vm.isSelected(user)).toBeFalsy();
      });
    });

    describe('onSelectAll', () => {
      it('updates selectedUsers with all selected members when user is selecting', () => {
        wrapper.vm.selectedUsers = mockTeamMembersData();
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
        expect(wrapper.vm.selectedUsers).toEqual([...mockTeamMembersData(), ...items]);
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
        wrapper.vm.selectedUsers = [...mockTeamMembersData(), ...items];
        wrapper.vm.onSelectAll({ items, value: false });
        expect(wrapper.vm.selectedUsers).toEqual(mockTeamMembersData());
      });
    });

    describe('submit', () => {
      it('calls addTeamMembers actions with correct parameters (selectedUsers)', async () => {
        await wrapper.vm.submit();
        expect(storage.team.actions.addTeamMembers).toHaveBeenCalledWith('abc', wrapper.vm.selectedUsers);
      });

      it('calls close method', async () => {
        jest.spyOn(wrapper.vm, 'close').mockImplementation(() => true);
        await wrapper.vm.submit();
        expect(wrapper.vm.close).toHaveBeenCalledTimes(1);
      });
    });
  });
});
