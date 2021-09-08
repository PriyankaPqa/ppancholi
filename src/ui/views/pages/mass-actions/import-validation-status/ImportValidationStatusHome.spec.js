import { createLocalVue, shallowMount } from '@/test/testSetup';

import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import Component from './ImportValidationStatusHome.vue';
import { MassActionType } from '@/entities/mass-action';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusHome.vue', () => {
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
      expect(wrapper.vm.massActionType).toEqual(MassActionType.ImportValidationOfImpactStatus);
    });

    it('should have proper detailsRouteName', () => {
      expect(wrapper.vm.detailsRouteName).toEqual(routes.massActions.importValidationStatus.details.name);
    });

    it('should have proper table title', () => {
      expect(wrapper.vm.tableTitle).toEqual('massAction.impactValidationStatusTable.title');
    });

    it('should have proper search end point', () => {
      expect(wrapper.vm.searchEndpoint).toEqual('validate-impact-status-mass-actions');
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
      it('should redirect to create page', () => {
        wrapper.vm.goToAdd();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.massActions.importValidationStatus.create.name });
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
            width: '50%',
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
          }, {
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
  });
});
