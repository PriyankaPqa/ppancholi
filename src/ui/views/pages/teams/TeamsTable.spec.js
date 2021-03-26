import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import routes from '@/constants/routes';
import { mockSearchTeams, mockTeamSearchData } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import Component from './TeamsTable.vue';

const localVue = createLocalVue();

describe('TeamsTable.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component, {
      localVue,
      store: {
        ...mockUserStateLevel(5),
      },
    });
  });

  describe('Template', () => {
    describe('showAddButton props', () => {
      it('is true for level 5 users', () => {
        const button = wrapper.find('[data-test="create-team-button"]');
        expect(button.exists()).toBe(true);
      });

      it('is false for level 4 users and lower', () => {
        wrapper = shallowMount(Component, {
          localVue,
          store: {
            ...mockUserStateLevel(4),
          },
        });
        const button = wrapper.find('[data-test="create-team-button"]');
        expect(button.exists()).toBeFalsy();
      });
    });

    describe('actions', () => {
      test('clicking on team name redirects to team details page ', async () => {
        await wrapper.setData({
          azureSearchItems: mockTeamSearchData(),
        });
        const id = mockTeamSearchData()[0].teamId;
        const link = wrapper.findDataTest(`team_link_${id}`);

        expect(link.props('to')).toEqual({
          name: routes.teams.details.name,
          params: {
            id,
          },
        });
      });

      test('edit button calls goToEditTeam', async () => {
        await wrapper.setData({
          azureSearchItems: mockTeamSearchData(),
        });
        const id = mockTeamSearchData()[0].teamId;
        jest.spyOn(wrapper.vm, 'goToEditTeam').mockImplementation(() => {});

        const editButton = wrapper.findDataTest(`edit_team_${id}`);

        await editButton.trigger('click');

        expect(wrapper.vm.goToEditTeam).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Handlers', () => {
    describe('createTeam button', () => {
      it('should call goToCreateTeam', async () => {
        const button = wrapper.find('[data-test="create-team-button"]');

        jest.spyOn(wrapper.vm, 'goToCreateTeam');
        await button.vm.$emit('click-item', {
          text: 'teams.types.create_standard',
          value: 'standard',
          icon: 'mdi-account-multiple',
          dataTest: 'create-standard-team-link',
        });
        expect(wrapper.vm.goToCreateTeam).toBeCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('labels', () => {
      it('should return the header object with the title received from props', async () => {
        wrapper.setProps({ title: 'foo' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'foo',
            searchPlaceholder: 'common.inputs.quick_search',
          },
        });
      });
    });

    describe('menuItems', () => {
      describe('Standard menu', () => {
        it('has the correct text', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-standard-team-link');
          expect(card.text).toBe('teams.types.create_standard');
        });

        it('has the correct value', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-standard-team-link');
          expect(card.value).toBe('standard');
        });

        it('has the correct icon', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-standard-team-link');
          expect(card.icon).toBe('mdi-account-multiple');
        });
      });

      describe('Adhoc menu', () => {
        it('has the correct text', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-adhoc-team-link');
          expect(card.text).toBe('teams.types.create_adhoc');
        });

        it('has the correct value', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-adhoc-team-link');
          expect(card.value).toBe('adhoc');
        });

        it('has the correct icon', async () => {
          const card = wrapper.vm.menuItems.find((c) => c.dataTest === 'create-adhoc-team-link');
          expect(card.icon).toBe('mdi-account-multiple-outline');
        });
      });
    });

    describe('headers', () => {
      test('they are defined correctly', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'teams.team_name',
            sortable: true,
            value: 'TeamName',
            width: '40%',
          },
          {
            text: 'teams.teamtype',
            value: 'TeamType',
            sortable: false,
            width: '10%',
          },
          {
            text: 'teams.table.related_events',
            value: 'EventCount',
            sortable: true,
            width: '10%',
          },
          {
            text: 'teams.primary_contact',
            value: 'PrimaryContactDisplayName',
            sortable: true,
            width: '30%',
          },
          {
            text: 'teams.team_members',
            value: 'TeamMemberCount',
            sortable: true,
            width: '10%',
          },
          {
            text: 'teams.status',
            value: 'TeamStatus',
            sortable: false,
            width: '10%',
          },
          {
            text: '',
            value: 'edit',
            width: '10%',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    describe('goToCreateTeam', () => {
      it('should redirect to the page with the passed argument as param', async () => {
        const mockArg = { value: 'foo' };
        wrapper.vm.goToCreateTeam(mockArg);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.teams.create.name, params: { teamType: 'foo' } });
      });
    });

    describe('fetchData', () => {
      beforeEach(() => {
        const storage = mockStorage();
        storage.team.actions.searchTeams = jest.fn().mockImplementation(() => mockSearchTeams());

        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
        });
      });

      const params = {
        search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
      };

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.$storage.team.actions.searchTeams).toHaveBeenCalledWith({
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        });
      });

      it('returns the search results set the azureSearchItems', async () => {
        const res = await wrapper.vm.fetchData(params);
        expect(res).toEqual(mockSearchTeams());
      });
    });

    describe('getFilterParams', () => {
      it('should get the filter with correct params', () => {
        const params = { search: 'query' };
        const filter = {
          or: [
            {
              TeamName: { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
              PrimaryContactDisplayName: { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
            },
          ],
        };
        expect(wrapper.vm.getFilterParams(params)).toEqual(filter);
      });
    });

    describe('goToEditTeam', () => {
      it('should redirect to the edit page with proper teamType and id for Adhoc', async () => {
        const mockTeam = mockTeamSearchData()[0];
        wrapper.vm.goToEditTeam(mockTeam);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name, params: { teamType: 'standard', id: 'e64a9cd4-4e6b-46a7-b022-e93e0bdc24df', from: wrapper.vm.$route.name },
        });
      });

      it('should redirect to the edit page with proper teamType and id for Standard', async () => {
        const mockTeam = mockTeamSearchData()[1];
        wrapper.vm.goToEditTeam(mockTeam);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name,
          params: { teamType: 'adhoc', id: '6e2d49af-2f9a-4333-9bdb-cd37270e6591', from: wrapper.vm.$route.name },
        });
      });
    });

    describe('getTeamDetailsRoute', () => {
      it('should return correct route', async () => {
        const res = wrapper.vm.getTeamDetailsRoute('id');
        expect(res).toEqual({
          name: routes.teams.details.name,
          params: {
            id: 'id',
          },
        });
      });
    });
  });

  describe('Data', () => {
    test('defaultSortBy', () => {
      expect(wrapper.vm.defaultSortBy).toEqual('TeamName');
    });

    test('customColumns', () => {
      expect(wrapper.vm.customColumns).toEqual([
        'TeamName',
        'TeamType',
        'EventCount',
        'PrimaryContactDisplayName',
        'TeamMemberCount',
        'TeamStatus',
        'edit',
      ]);
    });
  });
});
