import { ApprovalGroup, mockApprovalGroupData } from '.';

describe('>>> ApprovalGroup', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should init roles', () => {
        const approval = new ApprovalGroup(mockApprovalGroupData());
        expect(approval.roles).toEqual(mockApprovalGroupData().roles);
      });

      it('should init minimumAmount', () => {
        const approval = new ApprovalGroup(mockApprovalGroupData());
        expect(approval.minimumAmount).toEqual(mockApprovalGroupData().minimumAmount);
      });

      it('should init maximumAmount', () => {
        const approval = new ApprovalGroup(mockApprovalGroupData());
        expect(approval.maximumAmount).toEqual(mockApprovalGroupData().maximumAmount);
      });

      it('should init editMode', () => {
        const approval = new ApprovalGroup(mockApprovalGroupData());
        expect(approval.editMode).toEqual(mockApprovalGroupData().editMode);
      });

      it('should init addMode', () => {
        const approval = new ApprovalGroup(mockApprovalGroupData());
        expect(approval.addMode).toEqual(mockApprovalGroupData().addMode);
      });
    });

    describe('instantiate when no data is passed', () => {
      it('should init roles', () => {
        const approval = new ApprovalGroup();
        expect(approval.roles).toEqual([]);
      });

      it('should init minimumAmount', () => {
        const approval = new ApprovalGroup();
        expect(approval.minimumAmount).toEqual(0);
      });

      it('should init maximumAmount', () => {
        const approval = new ApprovalGroup();
        expect(approval.maximumAmount).toEqual(0);
      });

      it('should init addMode', () => {
        const approval = new ApprovalGroup();
        expect(approval.addMode).toEqual(true);
      });

      it('should init editMode', () => {
        const approval = new ApprovalGroup();
        expect(approval.editMode).toEqual(false);
      });
    });
  });

  describe('>> methods', () => {
    describe('toDto', () => {
      it('should return a group DTO', () => {
        const approval = new ApprovalGroup();
        const dto = approval.toDto();
        expect(dto).toEqual({
          roles: approval.roles,
          minimum: approval.minimumAmount,
          maximum: approval.maximumAmount,
        });
      });
    });

    describe('setMinimum', () => {
      it('should set minimum', () => {
        const group = new ApprovalGroup();
        const expected = 10;
        group.setMinimum(expected);
        expect(group.minimumAmount).toEqual(expected);
      });
    });

    describe('setMaximum', () => {
      it('should set maximumAmount', () => {
        const group = new ApprovalGroup();
        const expected = 10;
        group.setMaximum(expected);
        expect(group.maximumAmount).toEqual(expected);
      });
    });

    describe('setAddMode', () => {
      it('should set addMode', () => {
        const group = new ApprovalGroup();
        const expected = false;
        group.setAddMode(expected);
        expect(group.addMode).toEqual(expected);
      });
    });

    describe('setEditMode', () => {
      it('should set editMode', () => {
        const group = new ApprovalGroup();
        const expected = false;
        group.setEditMode(expected);
        expect(group.editMode).toEqual(expected);
      });
    });

    describe('setRoles', () => {
      it('should set roles', () => {
        const group = new ApprovalGroup();
        const expected = ['2'];
        group.setRoles(expected);
        expect(group.roles).toEqual(expected);
      });
    });
  });
});
