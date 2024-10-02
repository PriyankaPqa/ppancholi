import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import helpers from '@/ui/helpers/helpers';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockTeamEntity } from '@libs/entities-lib/team';
import Component from './AddRemoveTeamMembersMassActionCreateDetails.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia, teamStore } = useMockTeamStore();

const formCopy = {
  teamId: '123',
};

describe('AddRemoveTeamMembersMassActionCreateDetails.vue', () => {
  let wrapper;
  const doMount = async (options) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        form: { teamId: '' },
      },
      data() {
        return {
          loading: false,
          formCopy: {
            teamId: '',
          },
          teamSearch: '',
          teams: [],
        };
      },
      mocks: {
        $services: services,
      },
      ...options,
    });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    await doMount();
  });

  describe('Methods', () => {
    describe('fetchTeams', () => {
      it('should call teams search with proper params when it is called with searchQuery', async () => {
        helpers.toQuickSearchSql = jest.fn(() => ({ somefilter: 'team-name' }));
        teamStore.search = jest.fn(() => ({ values: [mockTeamEntity({ id: 'id-1' })] }));
        await wrapper.vm.fetchTeams('team-name');
        expect(teamStore.search).toHaveBeenCalledWith({ params: { filter: { somefilter: 'team-name' }, orderBy: 'Entity/Name asc', top: 5 }, includeInactiveItems: true });
        expect(wrapper.vm.teams).toEqual([mockTeamEntity({ id: 'id-1' })]);
      });

      it('should call teams search with proper params when it is called with searchTeamId', async () => {
        teamStore.search = jest.fn(() => ({ values: [mockTeamEntity({ id: 'team-id-123' })] }));
        await wrapper.vm.fetchTeams('', 'team-id-123');
        expect(teamStore.search).toHaveBeenCalledWith(
          { params: { filter: { Entity: { Id: { value: 'team-id-123', type: 'guid' } } }, orderBy: 'Entity/Name asc', top: 5 }, includeInactiveItems: true },
        );
        expect(wrapper.vm.teams).toEqual([mockTeamEntity({ id: 'team-id-123' })]);
      });
    });
  });

  describe('watcher', () => {
    describe('formCopy', () => {
      it('should emit update event with proper params', async () => {
        await wrapper.setData({ formCopy: { ...formCopy, teamId: 'new-team-id' } });
        expect(wrapper.emitted('update:form')[0][0]).toEqual(wrapper.vm.formCopy);
      });
    });

    describe('teamSearch', () => {
      it('should call debounceSearch', async () => {
        wrapper.vm.debounceSearch = jest.fn();
        await wrapper.setData({ teamSearch: 'new-search' });
        expect(wrapper.vm.debounceSearch).toHaveBeenCalled();
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should set formCopy data and call fetchTeams', async () => {
        await wrapper.setProps({
          form: { teamId: 'original-team-id' },
        });
        wrapper.vm.fetchTeams = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        hook.call(wrapper.vm);
        expect(wrapper.vm.formCopy).toEqual({ teamId: 'original-team-id' });
        expect(wrapper.vm.fetchTeams).toHaveBeenCalledWith('', 'original-team-id');
      });
    });
  });
});
