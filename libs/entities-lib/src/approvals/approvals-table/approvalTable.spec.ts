import { ApprovalTableEntity } from './approvalTable';
import { mockApprovalTableData } from './approvalTable.mock';

describe('>>> Approval', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should init eventId', () => {
        const approval = new ApprovalTableEntity(mockApprovalTableData());
        expect(approval.eventId).toEqual(mockApprovalTableData().eventId);
      });

      it('should init programId', () => {
        const approval = new ApprovalTableEntity(mockApprovalTableData());
        expect(approval.programId).toEqual(mockApprovalTableData().programId);
      });
    });

    describe('instantiate when no data is passed', () => {
      it('should init eventId', () => {
        const approval = new ApprovalTableEntity();
        expect(approval.eventId).toEqual('');
      });

      it('should init programId', () => {
        const approval = new ApprovalTableEntity();
        expect(approval.programId).toEqual('');
      });
    });
  });

  describe('setProgramId', () => {
    it('should set the program Id', () => {
      const approval = new ApprovalTableEntity();
      approval.setProgramId('1');
      expect(approval.programId).toEqual('1');
    });
  });
});
