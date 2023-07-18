import { Status, mockBaseData } from '@libs/entities-lib/src/base';
import { ApprovalTableEntity, IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalAggregatedBy } from '@libs/entities-lib/src/approvals/approvals-base';
import { IApprovalGroupData, mockApprovalGroup } from '@libs/entities-lib/src/approvals/approvals-group';

export const mockApprovalGroupData = (force? : Partial<IApprovalGroupData>): IApprovalGroupData => ({
  ...mockBaseData(),
  roles: ['e626199b-7358-40d3-a246-c5f8759862c6', 'ebbf9e55-d817-4a35-8f4c-653993f73956'],
  minimumAmount: 1,
  maximumAmount: 10,
  editMode: false,
  addMode: false,
  ...force,
});

export const mockApprovalTableData = (force? : Partial<IApprovalTableEntityData>): IApprovalTableEntityData => ({
  ...mockBaseData(),
  name: { translation: { en: 'Approval Group en', fr: 'Approval Group fr' } },
  aggregatedByType: ApprovalAggregatedBy.IndividualPaymentTotal,
  groups: [
    mockApprovalGroup({ ...mockApprovalGroupData({ minimumAmount: 11, maximumAmount: 100 }) }),
  ],
  approvalBaseStatus: Status.Active,
  eventId: '',
  programId: '',
  ...force,
});

export const mockApprovalTableRequest = (force = mockApprovalTableData()): IApprovalTableEntity => new ApprovalTableEntity(force);
