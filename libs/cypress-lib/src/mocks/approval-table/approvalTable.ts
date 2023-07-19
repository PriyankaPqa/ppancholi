import { Status, mockBaseData } from '@libs/entities-lib/src/base';
import { ApprovalTableEntity, IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { ApprovalAggregatedBy } from '@libs/entities-lib/src/approvals/approvals-base';
import { IApprovalGroupData, mockApprovalGroup } from '@libs/entities-lib/src/approvals/approvals-group';

export const mockApprovalGroupData = (force? : Partial<IApprovalGroupData>): IApprovalGroupData => ({
  ...mockBaseData(),
  roles: ['9a8b8859-1f7e-483d-9e31-3c334a14230d', 'd214dd7d-f7e0-455d-8b25-e7c32b77aea5'],
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
