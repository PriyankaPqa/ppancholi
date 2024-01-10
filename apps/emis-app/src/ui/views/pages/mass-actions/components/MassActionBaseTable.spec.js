import { createLocalVue, shallowMount } from '@/test/testSetup';

import { MassActionType } from '@libs/entities-lib/mass-action';
import routes from '@/constants/routes';

import Component from './MassActionBaseTable.vue';

const localVue = createLocalVue();

const additionalColumns = [{ name: 'totalAmount',
  index: 4,
  header: {
    text: 'massAction.common.total',
    value: 'Metadata/LastRun/TotalAmount',
    sortable: true,
  },
  templateFct: jest.fn(),
}];

let wrapper;

const doMount = (props) => {
  const options = {
    localVue,
    propsData: {
      massActionType: MassActionType.ImportValidationOfImpactStatus,
      detailsRouteName: routes.massActions.importValidationStatus.details.name,
      addRouteName: routes.massActions.importValidationStatus.create.name,
      tableTitle: 'tableTitle',
      searchEndpoint: 'searchEndpoint',
      showAddButton: true,
      ...props,
    },
  };
  wrapper = shallowMount(Component, options);
};

describe('MassActionBaseTable.vue', () => {
  describe('Methods', () => {
    beforeEach(() => {
      doMount();
    });
    describe('goToAdd', () => {
      it('should redirect to create page', () => {
        wrapper.vm.goToAdd();
        expect(wrapper.vm.$router.push)
          .toHaveBeenLastCalledWith({ name: wrapper.vm.addRouteName });
      });
    });
  });

  describe('Computed', () => {
    describe('customColumns', () => {
      it('should return correct columns without type', () => {
        doMount();

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

      it('should return correct columns with type', () => {
        doMount({ showType: true });
        expect(wrapper.vm.customColumns)
          .toEqual({
            name: 'Entity/Name',
            type: 'Entity/Type',
            dateCreated: 'Entity/Created',
            projected: 'Metadata/LastRun/Results/Total',
            successful: 'Metadata/LastRun/Results/Successes',
            status: 'Metadata/LastRun/RunStatus',
            deleteButton: 'deleteButton',
          });
      });

      it('adds additionalColumns', () => {
        doMount({ additionalColumns });
        expect(wrapper.vm.customColumns)
          .toEqual({
            name: 'Entity/Name',
            dateCreated: 'Entity/Created',
            projected: 'Metadata/LastRun/Results/Total',
            successful: 'Metadata/LastRun/Results/Successes',
            status: 'Metadata/LastRun/RunStatus',
            deleteButton: 'deleteButton',
            totalAmount: 'Metadata/LastRun/TotalAmount',
          });
      });
    });
    describe('headers', () => {
      it('should return correct headers', () => {
        doMount();
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
            text: 'common.delete',
            class: 'rc-transparent-text',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers)
          .toEqual(headers);
      });

      it('should return correct headers with type', () => {
        doMount({ showType: true });
        const headers = [
          {
            text: 'massAction.common.name',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.name,
          },
          {
            text: 'massAction.common.type',
            align: 'start',
            sortable: true,
            value: 'Entity/Type',
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
            text: 'common.delete',
            class: 'rc-transparent-text',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers)
          .toEqual(headers);
      });

      it('adds additionalColumns', () => {
        doMount({ additionalColumns });
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
            sortable: true,
            text: 'massAction.common.total',
            value: 'Metadata/LastRun/TotalAmount',
          }, {
            text: 'massAction.common.status',
            value: wrapper.vm.customColumns.status,
            sortable: false,
          }, {
            align: 'end',
            text: 'common.delete',
            class: 'rc-transparent-text',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers)
          .toEqual(headers);
      });
    });
  });
});
