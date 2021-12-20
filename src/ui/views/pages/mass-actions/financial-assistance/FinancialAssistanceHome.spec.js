import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './FinancialAssistanceHome.vue';
import { MassActionMode, MassActionType } from '@/entities/mass-action';
import routes from '@/constants/routes';

const localVue = createLocalVue();

const storage = mockStorage();

describe('FinancialAssistanceHome.vue', () => {
  let wrapper;

  describe('Data', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    it('should have proper mass action type', () => {
      expect(wrapper.vm.massActionTypeData).toEqual(MassActionType.FinancialAssistance);
    });

    it('should have proper detailsRouteName', () => {
      expect(wrapper.vm.detailsRouteNameData).toEqual(routes.massActions.financialAssistance.details.name);
    });

    it('should have proper table title', () => {
      expect(wrapper.vm.tableTitleData).toEqual('massAction.financialAssistanceTable.title');
    });

    it('should have proper search end point', () => {
      expect(wrapper.vm.searchEndpointData).toEqual('financial-assistance-mass-actions');
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToAdd', () => {
      it('should redirect to correct route if we process via file', () => {
        wrapper.vm.goToAdd({ value: 'file' });
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({
          name: routes.massActions.financialAssistance.create.name,
          query: { mode: MassActionMode.File },
        });
      });

      it('should show dialog to filter by list', () => {
        wrapper.vm.goToAdd({ value: 'list' });
        expect(wrapper.vm.showProcessByList).toEqual(true);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('customColumns', () => {
      it('should return correct columns', () => {
        expect(wrapper.vm.customColumns)
          .toEqual({
            name: 'Entity/Name',
            dateCreated: 'Entity/Created',
            projected: 'Metadata/LastRun/Results/Total',
            successful: 'Metadata/LastRun/Results/Successes',
            totalAmount: 'Metadata/LastRun/TotalAmount',
            status: 'Metadata/LastRun/RunStatus',
            deleteButton: 'deleteButton',
          });
      });
    });

    describe('headers', () => {
      it('should return correct headers', () => {
        const headers = [
          {
            text: 'massAction.common.name',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.name,
          },
          {
            text: 'massAction.common.dateCreated',
            value: wrapper.vm.customColumns.dateCreated,
            sortable: true,
          }, {
            text: 'massAction.common.projected',
            value: wrapper.vm.customColumns.projected,
            sortable: true,
          }, {
            text: 'massAction.common.successful',
            value: wrapper.vm.customColumns.successful,
            sortable: true,
          },
          {
            sortable: true,
            text: 'massAction.common.total',
            value: wrapper.vm.customColumns.totalAmount,
          },
          {
            text: 'massAction.common.status',
            value: wrapper.vm.customColumns.status,
            sortable: false,
          }, {
            align: 'end',
            text: '',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers).toEqual(headers);
      });
    });

    describe('menuItems', () => {
      it('should return proper items to add', () => {
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'massAction.financialAssistance.table.add.list',
          value: 'list',
          icon: 'mdi-filter-variant',
          dataTest: 'fa-mass-action-list',
        }, {
          text: 'massAction.financialAssistance.table.add.file',
          value: 'file',
          icon: 'mdi-upload',
          dataTest: 'fa-mass-action-file',
        }]);
      });
    });
  });
});
