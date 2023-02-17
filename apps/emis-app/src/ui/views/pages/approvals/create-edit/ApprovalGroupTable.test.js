import { shallowMount, createLocalVue } from '@/test/testSetup';
import { ApprovalGroup } from '@libs/entities-lib/approvals/approvals-group/approvalGroup';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { useMockApprovalTableStore } from '@/pinia/approval-table/approval-table.mock';
import { mockApprovalTableEntity, mockCombinedApprovalTable } from '@libs/entities-lib/approvals/approvals-table';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import Component from './ApprovalGroupTable.vue';

const localVue = createLocalVue();
let wrapper;
const { pinia, approvalTableStore } = useMockApprovalTableStore();
const { userAccountStore } = useMockUserAccountStore(pinia);

const doMount = (editMode = false) => {
  const combinedApprovalTable = mockCombinedApprovalTable();
  combinedApprovalTable.entity.groups[0].setRoles(['a6ffce22-8396-43c9-bdc3-6532925af251']);
  combinedApprovalTable.entity.groups[1].setRoles(['85315955-e20e-40bd-a672-f60b2871a0ab']);

  const roles = mockRoles();
  roles[0].subitems[0].status = Status.Inactive; // Disabled Operations Manager roles

  const options = {
    localVue,
    pinia,
    data: () => ({
      roles,
      localApproval: combinedApprovalTable.entity,
    }),
    propsData: {
      approval: combinedApprovalTable.entity,
      editMode,
    },
  };

  wrapper = shallowMount(Component, options);
};

describe('ApprovalGroupTable.vue', () => {
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
      it('should return true if one group is being added', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setAddMode(false);
        expect(wrapper.vm.disableAddGroup).toEqual(false);
        group.setAddMode(true);
        expect(wrapper.vm.disableAddGroup).toEqual(true);
      });

      it('should return true if one group is being added', () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setEditMode(false);
        expect(wrapper.vm.disableAddGroup).toEqual(false);
        wrapper.setData({ editBackup: group });
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

    describe('groupBeingEdited', () => {
      it('should return true if a group is being edited with a change', () => {
        doMount();
        const group = { roles: ['1'], minimumAmount: 10, maximumAmount: 20 };
        wrapper.setData({ editBackup: { ...group } });
        wrapper.vm.approval.groups[0].editMode = true;
        group.minimumAmount = 15;
        expect(wrapper.vm.groupBeingEdited).toBe(true);
      });

      it('should return false otherwise', () => {
        doMount();
        expect(wrapper.vm.groupBeingEdited).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('Created', () => {
      it('should fetch roles', async () => {
        doMount();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(userAccountStore.fetchRoles).toBeCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('addNewGroupRow', () => {
      it('should add a new group row', () => {
        doMount();
        wrapper.vm.approval.addGroup = jest.fn();
        wrapper.vm.addNewGroupRow();
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

      it('should delete a group if user confirmed in edit mode', async () => {
        doMount(true);
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.deleteGroup = jest.fn();
        await wrapper.vm.deleteGroupWithConfirmation(0);
        expect(approvalTableStore.removeGroup).toBeCalledWith({ approvalId: wrapper.vm.approval.id, groupId: wrapper.vm.approval.groups[0].id });
        expect(wrapper.emitted('edit:success')[0][0]).toEqual(mockApprovalTableEntity());
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
      it('should set editMode to false', async () => {
        doMount();
        const group = wrapper.vm.approval.groups[0];
        group.setEditMode = jest.fn();
        await wrapper.vm.applyEdit(0);
        expect(group.setEditMode).toBeCalledWith(false);
      });

      it('should update the group in editMode', async () => {
        doMount(true);
        const group = wrapper.vm.approval.groups[0];
        group.setEditMode = jest.fn();
        await wrapper.vm.applyEdit(0);
        expect(approvalTableStore.editGroup).toBeCalledWith({ approvalId: wrapper.vm.approval.id, group: wrapper.vm.approval.groups[0] });
        expect(wrapper.emitted('edit:success')[0][0]).toEqual(mockApprovalTableEntity());
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

      it('should add a group if the form is valid in edit mode', async () => {
        doMount(true);
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        const group = wrapper.vm.approval.groups[0];
        group.setAddMode = jest.fn();
        await wrapper.vm.addGroup(group);
        expect(approvalTableStore.addGroup).toBeCalledWith({ approvalId: wrapper.vm.approval.id, group });
        expect(wrapper.emitted('edit:success')[0][0]).toEqual(mockApprovalTableEntity());
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

    describe('groupSameAsBackup', () => {
      it('should return false if roles are different', () => {
        doMount();
        const group = { roles: ['1'], minimumAmount: 10, maximumAmount: 20 };
        wrapper.setData({ editBackup: { ...group } });
        group.roles = ['1', '2'];
        expect(wrapper.vm.groupSameAsBackup(group)).toBe(false);
      });

      it('should return false if minimum amount is different', () => {
        doMount();
        const group = { roles: ['1'], minimumAmount: 10, maximumAmount: 20 };
        wrapper.setData({ editBackup: { ...group } });
        group.minimumAmount = 15;
        expect(wrapper.vm.groupSameAsBackup(group)).toBe(false);
      });

      it('should return false if maximum amount is different', () => {
        doMount();
        const group = { roles: ['1'], minimumAmount: 10, maximumAmount: 20 };
        wrapper.setData({ editBackup: { ...group } });
        group.maximumAmount = 25;
        expect(wrapper.vm.groupSameAsBackup(group)).toBe(false);
      });

      it('should return true if the group has no changes', () => {
        doMount();
        const group = { roles: ['1'], minimumAmount: 10, maximumAmount: 20 };
        wrapper.setData({ editBackup: { ...group } });
        expect(wrapper.vm.groupSameAsBackup(group)).toBe(true);
      });
    });
  });
});
