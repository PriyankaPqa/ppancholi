import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockCombinedApprovalTable } from '@libs/entities-lib/approvals/approvals-table';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { Status } from '@libs/entities-lib/base';
import Component from './ApprovalDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();

let wrapper;

const combinedApprovalTable = mockCombinedApprovalTable();
combinedApprovalTable.entity.groups[0].setRoles(['a6ffce22-8396-43c9-bdc3-6532925af251']);
combinedApprovalTable.entity.groups[1].setRoles(['85315955-e20e-40bd-a672-f60b2871a0ab']);
storage.approvalTable.actions.fetch = jest.fn(() => combinedApprovalTable);

const doMount = () => {
  const roles = mockRoles();
  roles[0].subitems[0].status = Status.Inactive; // Disabled Operations Manager roles

  const options = {
    localVue,
    data: () => ({
      roles,
      approval: combinedApprovalTable.entity,
      localApproval: combinedApprovalTable.entity,
      approvalMetadata: combinedApprovalTable.metadata,
    }),
    mocks: {
      $storage: storage,
      $route: {
        params: {
          approvalId: 'approvalId',
        },
      },
    },
  };
  wrapper = shallowMount(Component, options);
};

describe('ApprovalDetails', () => {
  describe('Computed', () => {
    describe('title', () => {
      it('should return right title', () => {
        doMount();
        expect(wrapper.vm.title).toEqual('approvalsTable.tableDetails');
      });
    });

    describe('approvalId', () => {
      it('should be linked to id in the route parameter', () => {
        doMount();
        expect(wrapper.vm.approvalId).toEqual('approvalId');
      });
    });

    describe('aggregatedBy', () => {
      it('should return correct array', () => {
        doMount();
        expect(wrapper.vm.aggregatedBy).toEqual([
          {
            text: 'Individual payment total',
            value: 2,
          },
          {
            text: 'Total financial assistance on case file',
            value: 1,
          },
        ]);
      });
    });

    describe('filteredGroups', () => {
      it('should return approval groups based on current search', async () => {
        doMount();

        await wrapper.setData({
          search: 'ope',
        });

        expect(wrapper.vm.filteredGroups).toEqual([
          {
            groupIndex: 'approvals.nestedTable.group',
            maximum: '$10.00',
            minimum: '$1.00',
            roles: 'Operations Manager',
          },
        ]);
      });
    });
  });

  describe('Mounted', () => {
    it('should call loadData', () => {
      doMount();
      wrapper.vm.loadData = jest.fn();
      wrapper.vm.$options.mounted.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.loadData).toBeCalled();
    });
  });

  describe('Methods', () => {
    describe('goToEdit', () => {
      it('should redirect to edit page', () => {
        doMount();
        wrapper.vm.goToEdit();
        expect(wrapper.vm.$router.push).toBeCalledWith({
          name: routes.events.approvals.edit.name,
          params: {
            approvalId: 'approvalId',
          },
        });
      });
    });

    describe('back', () => {
      it('should redirect to approval list page', () => {
        doMount();
        wrapper.vm.back();
        expect(wrapper.vm.$router.replace).toBeCalledWith({
          name: routes.events.approvals.home.name,
        });
      });
    });

    describe('loadData', () => {
      it('should fetch the approval table by id', () => {
        doMount();
        wrapper.vm.loadData();
        expect(wrapper.vm.$storage.approvalTable.actions.fetch).toBeCalledWith('approvalId');
      });

      it('should set approval with entity', () => {
        doMount();
        expect(wrapper.vm.approval).toEqual(combinedApprovalTable.entity);
      });

      it('should set approvalMetadata with metadata', () => {
        doMount();
        expect(wrapper.vm.approvalMetadata).toEqual(combinedApprovalTable.metadata);
      });

      it('should set localApproval with approval', () => {
        doMount();
        expect(wrapper.vm.localApproval).toEqual(combinedApprovalTable.entity);
      });

      it('should fetch and set roles', () => {
        doMount();
        wrapper.vm.loadData();
        expect(wrapper.vm.$storage.userAccount.actions.fetchRoles).toBeCalled();
      });
    });
  });
});
