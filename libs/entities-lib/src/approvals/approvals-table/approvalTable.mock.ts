import { mockBaseApprovalData } from '../approvals-base';
import { IApprovalTableEntity, IApprovalTableEntityData } from './approvalTable.types';
import { ApprovalTableEntity } from './approvalTable';

export const mockApprovalTableData = (force? : Partial<IApprovalTableEntityData>): IApprovalTableEntityData => ({
  ...mockBaseApprovalData(force),
  eventId: '',
  programId: '',
  ...force,
});

export const mockApprovalTablesData = () => ([
  mockApprovalTableData(),
  mockApprovalTableData(),
]);

export const mockApprovalTableEntity = (force = mockApprovalTableData()): IApprovalTableEntity => new ApprovalTableEntity(force);

export const mockApprovalTableEntities = () => [
  mockApprovalTableEntity(),
  mockApprovalTableEntity(),
];
