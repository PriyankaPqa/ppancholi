import { createLocalVue, shallowMount } from '@/test/testSetup';
import { MassActionType } from '@libs/entities-lib/mass-action';
import { mockProvider } from '@/services/provider';
import routes from '@/constants/routes';
import Component from './AddRemoveTeamMembersMassActionHome.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('AddRemoveTeamMembersMassActionHome.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $services: services,
      },
    });
  });
  describe('Data', () => {
    it('should have proper mass action type', () => {
      expect(wrapper.vm.massActionTypeData).toEqual(MassActionType.AddRemoveTeamMembers);
    });

    it('should have proper detailsRouteName', () => {
      expect(wrapper.vm.detailsRouteNameData).toEqual(routes.massActions.addRemoveTeamMembers.details.name);
    });

    it('should have proper table title', () => {
      expect(wrapper.vm.tableTitleData).toEqual('massAction.addRemoveTeamMembersTable.title');
    });
  });

  describe('Computed', () => {
    describe('customColumns', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.customColumns).toEqual({
          name: 'Entity/Name',
          dateCreated: 'Entity/Created',
          projected: 'Metadata/LastRun/Results/Total',
          successful: 'Metadata/LastRun/Results/Successes',
          status: 'Metadata/LastRun/RunStatus',
          deleteButton: 'deleteButton',
        });
      });
    });

    describe('headers', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.headers).toEqual(
          [
            {
              text: wrapper.vm.$t('massAction.common.name'),
              align: 'start',
              sortable: true,
              value: wrapper.vm.customColumns.name,
            },
            {
              text: wrapper.vm.$t('massAction.common.dateCreated'),
              value: wrapper.vm.customColumns.dateCreated,
              sortable: true,
            },
            {
              text: wrapper.vm.$t('massAction.common.projected'),
              value: wrapper.vm.customColumns.projected,
              sortable: true,
            },
            {
              text: wrapper.vm.$t('massAction.common.successful'),
              value: wrapper.vm.customColumns.successful,
              sortable: true,
            },
            {
              text: wrapper.vm.$t('massAction.common.status'),
              value: wrapper.vm.customColumns.status,
              sortable: false,
            },
            {
              align: 'end',
              text: wrapper.vm.$t('common.delete'),
              class: 'rc-transparent-text',
              value: 'deleteButton',
              sortable: false,
            },
          ],
        );
      });
    });

    describe('menuItems', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.menuItems).toEqual([{
          text: wrapper.vm.$t('massAction.addRemoveTeamMembersTable.table.add'),
          action: 'add',
          icon: 'mdi-account-multiple-plus',
          dataTest: 'add-team-members',
        }, {
          text: wrapper.vm.$t('massAction.addRemoveTeamMembersTable.table.remove'),
          action: 'remove',
          icon: 'mdi-account-multiple-minus',
          dataTest: 'remove-team-members',
        }]);
      });
    });
  });

  describe('Methods', () => {
    describe('goToAdd', () => {
      it('should redirect to correct route with correct query', () => {
        wrapper.vm.goToAdd({ action: 'add' });
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({
          name: routes.massActions.addRemoveTeamMembers.create.name,
          query: { action: 'add' },
        });
      });
    });
  });
});
