import { Status } from '@libs/shared-lib/src/types';
import { ApprovalBaseEntity } from './approval';
import { mockBaseApprovalData } from './approval.mock';
import { ApprovalGroup, mockApprovalGroupData } from '../approvals-group';

describe('>>> ApprovalBaseEntity', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should init name', () => {
        const approval = new ApprovalBaseEntity(mockBaseApprovalData());
        expect(approval.name).toEqual(mockBaseApprovalData().name);
      });

      it('should init aggregatedByType', () => {
        const approval = new ApprovalBaseEntity(mockBaseApprovalData());
        expect(approval.aggregatedByType).toEqual(mockBaseApprovalData().aggregatedByType);
      });

      it('should init groups', () => {
        const approval = new ApprovalBaseEntity(mockBaseApprovalData());
        expect(approval.groups).toEqual(mockBaseApprovalData().groups);
      });

      it('should init approvalBaseStatus', () => {
        const approval = new ApprovalBaseEntity(mockBaseApprovalData());
        expect(approval.approvalBaseStatus).toEqual(mockBaseApprovalData().approvalBaseStatus);
      });
    });

    describe('instantiate when no data is passed', () => {
      it('should call reset', () => {
        const approval = new ApprovalBaseEntity();
        expect(approval.name).toEqual({ translation: { en: '', fr: '' } });
      });

      it('should init aggregatedBy', () => {
        const approval = new ApprovalBaseEntity();
        expect(approval.aggregatedByType).toEqual(null);
      });

      it('should init groups', () => {
        const approval = new ApprovalBaseEntity();
        expect(approval.groups).toEqual([]);
      });

      it('should init approvalBaseStatus', () => {
        const approval = new ApprovalBaseEntity();
        expect(approval.approvalBaseStatus).toEqual(Status.Active);
      });
    });
  });

  describe('setGroup', () => {
    it('should update a specified group', () => {
      const approval = new ApprovalBaseEntity();
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '1' })));
      approval.setGroup(new ApprovalGroup(mockApprovalGroupData({ id: '2' })), 0);
      expect(approval.groups[0].id).toEqual('2');
    });
  });

  describe('addGroup', () => {
    it('should add a group', () => {
      const approval = new ApprovalBaseEntity();
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '1' })));
      expect(approval.groups[0].id).toEqual('1');
    });

    it('should set minimum amount to next cent of maximum amount of previous group', () => {
      const approval = new ApprovalBaseEntity();
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '1' })));
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '2' })));
      expect(approval.groups[1].minimumAmount).toEqual(10.01);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group', () => {
      const approval = new ApprovalBaseEntity();
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '1' })));
      approval.deleteGroup(0);
      expect(approval.groups.length).toEqual(0);
    });

    it('should adjust minimum amount to next cent of maximum amount of previous group', () => {
      const approval = new ApprovalBaseEntity();
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '1', minimumAmount: 1, maximumAmount: 2 })));
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '2', minimumAmount: 2.01, maximumAmount: 5 })));
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '3', minimumAmount: 5.01, maximumAmount: 10 })));
      approval.addGroup(new ApprovalGroup(mockApprovalGroupData({ id: '3', minimumAmount: 10.01, maximumAmount: 15 })));
      approval.deleteGroup(1);
      expect(approval.groups[1].minimumAmount).toEqual(2.01);
    });
  });
});
