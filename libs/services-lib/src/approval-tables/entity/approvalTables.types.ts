import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { IMultilingual, Status } from '@libs/shared-lib/types';
import { ApprovalAggregatedBy } from '@libs/entities-lib/approvals/approvals-base';
import { IApprovalGroup, IApprovalGroupDTO } from '@libs/entities-lib/approvals/approvals-group';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICreateApprovalTableRequest {
  eventId: uuid;
  programId: uuid;
  name: IMultilingual,
  aggregatedByType: ApprovalAggregatedBy,
  groups: IApprovalGroupDTO[],
  approvalBaseStatus: Status
}

export interface IEditApprovalTableRequest {
  programId: uuid;
  name: IMultilingual,
  aggregatedByType: ApprovalAggregatedBy,
  approvalBaseStatus: Status
}

export interface IApprovalTablesService extends IDomainBaseService<IApprovalTableEntityData, uuid> {
  create(data: IApprovalTableEntity): Promise<IApprovalTableEntityData>;
  getApprovalsTableByEventId(eventId: uuid): Promise<IApprovalTableEntityData[]>;
  getApprovalTableByProgramId(programId: uuid): Promise<IApprovalTableEntityData>
  edit(approvalId: uuid, payload: IApprovalTableEntity): Promise<IApprovalTableEntityData>
  addGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData>
  removeGroup(approvalId: uuid, groupId: uuid): Promise<IApprovalTableEntityData>
  editGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData>
}

export interface IApprovalTablesServiceMock extends IDomainBaseServiceMock<IApprovalTableEntityData> {
  create: jest.Mock<IApprovalTableEntityData>;
  getApprovalsTableByEventId: jest.Mock<IApprovalTableEntityData[]>;
  getApprovalTableByProgramId: jest.Mock<IApprovalTableEntityData>;
  edit: jest.Mock<IApprovalTableEntityData>;
  addGroup: jest.Mock<IApprovalTableEntityData>;
  removeGroup: jest.Mock<IApprovalTableEntityData>;
  editGroup: jest.Mock<IApprovalTableEntityData>;
}
