/**
 * @group ui/components/teams
 */

/* eslint-disable */
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockCombinedTeams } from '@/entities/team';
import { mockStorage } from '@/store/storage';
import Component from './TeamsTable.vue';
import flushPromises from 'flush-promises';

const localVue = createLocalVue();
const storage = mockStorage();
const team = mockCombinedTeams()[0];
const teamId = team.entity.id;

describe('TeamsTable.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = true, level = 5) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      mocks: {
        $hasLevel: (lvl) => {
          return lvl <= 'level' + level;
        },
        $storage: storage,
      },
    });
    await wrapper.vm.$nextTick();
  };

  describe('Template', () => {
    describe('showAddButton props', () => {
      it('is true for level 5 users', async () => {
        await mountWrapper(true, 5);
        const button = wrapper.find('[data-test="create-team-button"]');
        expect(button.exists()).toBe(true);
      });

      it('is false for level 4 users and lower', async () => {
        await mountWrapper(true, 4);
        const button = wrapper.find('[data-test="create-team-button"]');
        expect(button.exists()).toBeFalsy();
      });
    });

    describe('edit-button', () => {
      it('should be visible for level 4 and above', async () => {
        await mountWrapper(true, 4);
        await flushPromises();
        const button = wrapper.findDataTest(`edit_team_${teamId}`);
        expect(button.exists()).toBe(true);
      });

      it('should be hidden for level 3 and below', async () => {
        await mountWrapper(true, 3);
        const button = wrapper.findDataTest(`edit_team_${teamId}`);
        expect(button.exists()).toBeFalsy();
      });
    });

    describe('actions', () => {
      test('clicking on team name redirects to team details page ', async () => {
        await mountWrapper();
        await flushPromises();
        const link = wrapper.findDataTest(`team_link_${teamId}`);

        expect(link.props('to')).toEqual({
          name: routes.teams.details.name,
          params: {
            id: teamId,
          },
        });
      });

      test('edit button calls goToEditTeam', async () => {
        await mountWrapper();
        await flushPromises();
        jest.spyOn(wrapper.vm, 'goToEditTeam').mockImplementation(() => { });

        const editButton = wrapper.findDataTest(`edit_team_${teamId}`);

        await editButton.trigger('click');

        expect(wrapper.vm.goToEditTeam).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Handlers', () => {
    describe('createTeam button', () => {
      it('should call goToCreateTeam', async () => {
        await mountWrapper();
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

    beforeEach(async () => {
      await mountWrapper(false);
    });

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
            value: wrapper.vm.customColumns.name,
            width: '40%',
          },
          {
            text: 'teams.teamtype',
            value: wrapper.vm.customColumns.type,
            sortable: true,
            width: '10%',
          },
          {
            text: 'teams.table.related_events',
            value: wrapper.vm.customColumns.eventCount,
            sortable: true,
            width: '10%',
          },
          {
            text: 'teams.primary_contact',
            value: wrapper.vm.customColumns.primaryContact,
            sortable: true,
            width: '30%',
          },
          {
            text: 'teams.team_members',
            value: wrapper.vm.customColumns.teamMemberCount,
            sortable: true,
            width: '10%',
          },
          {
            text: 'teams.status',
            value: wrapper.vm.customColumns.status,
            sortable: true,
            width: '10%',
          },
          {
            text: '',
            value: wrapper.vm.customColumns.edit,
            width: '10%',
            sortable: false,
          },
        ]);
      });
    });

    test('customColumns', () => {
      expect(wrapper.vm.customColumns).toEqual({
        name: 'Entity/Name',
        type: 'Metadata/TeamTypeName/Translation/en',
        eventCount: 'Metadata/EventCount',
        primaryContact: 'Metadata/PrimaryContactDisplayName',
        teamMemberCount: 'Metadata/TeamMemberCount',
        status: 'Metadata/TeamStatusName/Translation/en',
        edit: 'edit',
      });
    });
  });

  describe('Methods', () => {

    beforeEach(async () => {
      await mountWrapper(false);
    });

    describe('goToCreateTeam', () => {
      it('should redirect to the page with the passed argument as param', async () => {
        const mockArg = { value: 'foo' };
        wrapper.vm.goToCreateTeam(mockArg);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.teams.create.name, params: { teamType: 'foo' } });
      });
    });

    describe('fetchData', () => {
      const params = {
        search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
      };

      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.$storage.team.actions.search).toHaveBeenCalledWith({
          search: 'query',
          searchMode: 'all',
          queryType: 'full',
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        }, null, true);
      });

      it('returns the search results', async () => {
        const res = await wrapper.vm.fetchData(params);
        expect(res).toEqual({ ids: ['1'], count: 1 });
      });
    });

    describe('goToEditTeam', () => {
      it('should redirect to the edit page with proper teamType and id for Standard', async () => {
        const mockTeam = mockCombinedTeams()[0];
        wrapper.vm.goToEditTeam(mockTeam);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name, params: { teamType: 'standard', id: mockCombinedTeams()[0].entity.id, from: wrapper.vm.$route.name },
        });
      });

      it('should redirect to the edit page with proper teamType and id for Adhoc', async () => {
        const mockTeam = mockCombinedTeams()[1];
        wrapper.vm.goToEditTeam(mockTeam);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.teams.edit.name,
          params: { teamType: 'adhoc', id: mockCombinedTeams()[1].entity.id, from: wrapper.vm.$route.name },
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
});
