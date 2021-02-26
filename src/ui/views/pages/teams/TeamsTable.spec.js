import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockUserStateLevel } from '@/test/helpers';
import routes from '@/constants/routes';
import { mockSearchTeams } from '@/entities/team';
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
            value: 'Name',
            width: '40%',
          },
          {
            text: 'teams.teamtype',
            value: 'type',
            sortable: false,
            width: '10%',
          },
          {
            text: 'teams.table.related_events',
            value: 'events',
            sortable: false,
            width: '10%',
          },
          {
            text: 'teams.primary_contact',
            value: 'primaryContact',
            sortable: false,
            width: '30%',
          },
          {
            text: 'teams.team_members',
            value: 'members',
            sortable: false,
            width: '10%',
          },
          {
            text: 'teams.status',
            value: 'status',
            sortable: false,
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

      it('should set the azureSearchItems', async () => {
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.azureSearchItems).toEqual(mockSearchTeams().value);
      });

      it('should set the azureSearchCount', async () => {
        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.azureSearchCount).toEqual(mockSearchTeams()['@odataCount']);
      });
    });

    describe('getFilterParams', () => {
      it('should get the filter with correct params', () => {
        const params = { search: 'query' };
        const filter = {
          or: [
            {
              Name: { or: [{ contains_az: params.search }, { startsWith_az: params.search }] },
            },
          ],
        };
        expect(wrapper.vm.getFilterParams(params)).toEqual(filter);
      });
    });
  });

  describe('Data', () => {
    test('defaultSortBy', () => {
      expect(wrapper.vm.defaultSortBy).toEqual('Name');
    });

    test('customColumns', () => {
      expect(wrapper.vm.defaultSortBy).toEqual('Name');
    });
  });
});
