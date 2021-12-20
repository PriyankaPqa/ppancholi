import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import Component from './MassActionBaseTable.vue';
import { MassActionType } from '@/entities/mass-action';
import routes from '@/constants/routes';

const localVue = createLocalVue();

const storage = mockStorage();

describe('MassActionBaseTable.vue', () => {
  let wrapper;

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massActionType: MassActionType.ImportValidationOfImpactStatus,
          detailsRouteName: routes.massActions.importValidationStatus.details.name,
          addRouteName: routes.massActions.importValidationStatus.create.name,
          tableTitle: 'tableTitle',
          searchEndpoint: 'searchEndpoint',
          showAddButton: true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToAdd', () => {
      it('should redirect to create page', () => {
        wrapper.vm.goToAdd();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: wrapper.vm.addRouteName });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          massActionType: MassActionType.ImportValidationOfImpactStatus,
          detailsRouteName: routes.massActions.importValidationStatus.details.name,
          addRouteName: routes.massActions.importValidationStatus.create.name,
          tableTitle: 'tableTitle',
          searchEndpoint: 'searchEndpoint',
          showAddButton: true,
        },
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
