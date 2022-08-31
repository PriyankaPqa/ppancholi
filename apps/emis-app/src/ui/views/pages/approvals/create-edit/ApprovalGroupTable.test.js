import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockBaseApprovalEntity } from '@libs/entities-lib/approvals/approvals-base';
import { ApprovalGroup } from '@libs/entities-lib/approvals/approvals-group/approvalGroup';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import Component from './ApprovalGroupTable.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const doMount = () => {
  const options = {
    localVue,
    data: () => ({
      roles: mockRoles(),
    }),
    propsData: {
      approval: mockBaseApprovalEntity(),
    },
    mocks: {
      $storage: storage,
    },
  };
  wrapper = shallowMount(Component, options);
};

describe('ApprovalsLayout.vue', () => {
  describe('Computed', () => {
    describe('headers', () => {
      it('should return proper headers', () => {
        doMount();
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'approvals.nestedTable.headers.group',
            cols: 2,
            align: 'left',
          },
          {
            text: 'approvals.nestedTable.headers.roles',
            cols: 4,
            align: 'left',
          },
          {
            text: 'approvals.nestedTable.headers.minimum',
            cols: 2,
            align: 'left',
          },
          {
            text: 'approvals.nestedTable.headers.maximum',
            cols: 2,
            align: 'left',
          },
          {
            text: '',
            cols: 2,
            align: 'right',
          },
        ]);
      });
    });

    describe('disableAddGroup', () => {
      it('should return true if one group is being edited', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setAddMode(false);
        expect(wrapper.vm.disableAddGroup).toEqual(false);
        group.setEditMode(true);
        expect(wrapper.vm.disableAddGroup).toEqual(true);
      });

      it('should return true if one group is being added', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        expect(wrapper.vm.disableAddGroup).toEqual(false);
        group.setEditMode(true);
        expect(wrapper.vm.disableAddGroup).toEqual(true);
      });
    });

    describe('availableRoles', () => {
      it('should return a list of active L3 and L4 roles', () => {
        doMount();
        const roles = mockRoles();
        expect(wrapper.vm.availableRoles).toEqual(
          roles[0].subitems
            .map((r) => ({ name: r.name, id: r.id }))
            .sort((a, b) => wrapper.vm.$m(a.name).localeCompare(wrapper.vm.$m(b.name))),
        );
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Created', () => {
      it('should fetch roles', () => {
        doMount();
        expect(wrapper.vm.$storage.userAccount.actions.fetchRoles).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('addNewGroup', () => {
      it('should add a new group', () => {
        doMount();
        wrapper.vm.approval.addGroup = jest.fn();
        wrapper.vm.addNewGroup();
        expect(wrapper.vm.approval.addGroup).toBeCalled();
      });
    });

    describe('deleteGroup', () => {
      it('should delete a group', () => {
        doMount();
        wrapper.vm.approval.deleteGroup = jest.fn();
        wrapper.vm.deleteGroup(0);
        expect(wrapper.vm.approval.deleteGroup).toBeCalledWith(0);
      });
    });

    describe('deleteGroupWithConfirmation', () => {
      it('should delete a group if user confirmed', async () => {
        doMount();
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.deleteGroup = jest.fn();
        await wrapper.vm.deleteGroupWithConfirmation(0);
        expect(wrapper.vm.deleteGroup).toBeCalledWith(0);
      });
    });

    describe('buildRoleString', () => {
      it('should create a string of selected roles', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        const expected = wrapper.vm.buildRoleString(group);
        expect(expected).toEqual('Recovery Manager, Operations Manager');
      });
    });

    describe('editGroup', () => {
      it('should set editMode to true', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setEditMode = jest.fn();
        wrapper.vm.editGroup(group);
        expect(group.setEditMode).toBeCalledWith(true);
      });

      it('should set save group as backup', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        wrapper.vm.editGroup(group);
        expect(wrapper.vm.editBackup).toEqual(group);
      });
    });

    describe('cancelEdit', () => {
      it('should restore the backup', () => {
        doMount();
        wrapper.vm.approval.setGroup = jest.fn(() => new ApprovalGroup());
        wrapper.vm.cancelEdit(0);
        expect(wrapper.vm.approval.setGroup).toBeCalledWith(wrapper.vm.editBackup, 0);
      });

      it('should set editMode to false', () => {
        doMount();
        const group = new ApprovalGroup();
        group.setEditMode = jest.fn();
        wrapper.vm.approval.setGroup = jest.fn(() => group);
        wrapper.vm.cancelEdit(0);
        expect(group.setEditMode).toBeCalledWith(false);
      });
    });

    describe('applyEdit', () => {
      it('should set editMode to false', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setEditMode = jest.fn();
        wrapper.vm.applyEdit(0);
        expect(group.setEditMode).toBeCalledWith(false);
      });
    });

    describe('addGroup', () => {
      it('should add a group if the form is valid', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        const group = wrapper.vm.approval.groups[0];
        group.setAddMode = jest.fn();
        await wrapper.vm.addGroup(group);
        expect(group.setAddMode).toBeCalledWith(false);
      });

      it('should do nothing if form is not valid', async () => {
        doMount();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        const group = wrapper.vm.approval.groups[0];
        group.setAddMode = jest.fn();
        await wrapper.vm.addGroup(group);
        expect(group.setAddMode).not.toBeCalledWith(false);
      });
    });

    describe('getMinAmountRules', () => {
      it('should return proper rules if no previous group', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.minimumAmount = 10;
        group.maximumAmount = 5;

        const expected = wrapper.vm.getMinAmountRules(group.minimumAmount, 0);
        expect(expected).toEqual({
          isValid: false,
          messageKey: 'approvals.rules.cannot_equal_max',
        });
      });

      it('should return proper rules if previous group', () => {
        doMount();
        const group = wrapper.vm.approval.groups[1];
        const previousGroup = wrapper.vm.approval.groups[0];

        group.minimumAmount = 5;
        previousGroup.maximumAmount = 10;

        const expected = wrapper.vm.getMinAmountRules(group.minimumAmount, 1);
        expect(expected).toEqual({
          isValid: false,
          messageKey: 'approvals.rules.greater_than_previous',
        });
      });
    });

    describe('getMaxAmountRules', () => {
      it('should validate that the max is greater than min', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];

        group.maximumAmount = 15;
        group.minimumAmount = 15;

        const expected = wrapper.vm.getMaxAmountRules(group.maximumAmount, 0);
        expect(expected).toEqual({
          isValid: false,
          messageKey: 'validations.minValueStrict',
          injection: { value: 15 },
        });
      });

      it('should validate that the max is less than min of next group', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        const nextGroup = wrapper.vm.approval.groups[1];

        group.maximumAmount = 15;
        nextGroup.minimumAmount = 10;

        const expected = wrapper.vm.getMaxAmountRules(group.maximumAmount, 0);
        expect(expected).toEqual({
          isValid: false,
          messageKey: 'approvals.rules.cannot_greater_than_next',
        });
      });

      it('should validate that the max is following the min of next group by a cent', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        const nextGroup = wrapper.vm.approval.groups[1];

        group.maximumAmount = 9.90;
        nextGroup.minimumAmount = 10;

        const expected = wrapper.vm.getMaxAmountRules(group.maximumAmount, 0);
        expect(expected).toEqual({
          isValid: false,
          messageKey: 'approvals.rules.maximum_next_cent',
        });
      });
    });

    describe('disableAction', () => {
      it('should return false if no group being edited', () => {
        doMount();
        expect(wrapper.vm.disableAction(0)).toEqual(false);
      });

      it('should return false if a current group is edited', async () => {
        doMount();
        await wrapper.setData({
          groupIndexBeingEdited: 1,
        });
        expect(wrapper.vm.disableAction(1)).toEqual(false);
      });

      it('should return true if a different group is edited', async () => {
        doMount();
        await wrapper.setData({
          groupIndexBeingEdited: 0,
        });
        expect(wrapper.vm.disableAction(1)).toEqual(true);
      });
    });
  });
});
