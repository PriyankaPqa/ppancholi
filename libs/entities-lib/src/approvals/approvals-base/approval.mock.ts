import { Status } from '@libs/shared-lib/types';
import { mockApprovalGroup, mockApprovalGroupData } from '../approvals-group';
import { ApprovalAggregatedBy, IApprovalBaseEntity, IApprovalBaseEntityData } from './approval.types';
import { ApprovalBaseEntity } from './approval';
import { mockBaseData } from '../../base';

export const mockBaseApprovalData = (force? : Partial<IApprovalBaseEntityData>): IApprovalBaseEntityData => ({
  ...mockBaseData(),
  name: { translation: { en: 'Approval A en', fr: 'Approval A fr' } },
  aggregatedByType: ApprovalAggregatedBy.TotalFinancialAssistanceOnCaseFile,
  groups: [
    mockApprovalGroup(),
    mockApprovalGroup({ ...mockApprovalGroupData({ minimumAmount: 11, maximumAmount: 100 }) }),
  ],
  approvalBaseStatus: Status.Active,
  ...force,
});

export const mockBaseApprovalEntity = (force = mockBaseApprovalData()): IApprovalBaseEntity => new ApprovalBaseEntity(force);

export const mockBaseApprovalsEntites = () => [
  mockBaseApprovalEntity(),
  mockBaseApprovalEntity(),
];

export const mockBaseApprovalMetadata = () => ({
  ...mockBaseData(),
  approvalBaseStatusName: { translation: { en: 'Active', fr: 'Inactive' } },
});

export const mockBaseApprovalMetadatum = () => [
  mockBaseApprovalMetadata(),
  mockBaseApprovalMetadata(),
];
