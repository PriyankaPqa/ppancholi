import { IApprovalTableEntity, IApprovalTableEntityData } from '@libs/entities-lib/approvals/approvals-table';
import { IMultilingual } from '@libs/shared-lib/types';
import { ApprovalAggregatedBy } from '@libs/entities-lib/approvals/approvals-base';
import { IApprovalGroupDTO } from '@libs/entities-lib/approvals/approvals-group';
import { Status } from '@libs/entities-lib/base';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICreateApprovalTableRequest {
  eventId: uuid;
  programId: uuid;
  name: IMultilingual,
  aggregatedByType: ApprovalAggregatedBy,
  groups: IApprovalGroupDTO[],
  status: Status
}

export interface IApprovalTablesService extends IDomainBaseService<IApprovalTableEntity, uuid>{
  create(data: IApprovalTableEntityData): Promise<IApprovalTableEntityData>;
  getApprovalsTableByEventId(eventId: uuid): Promise<IApprovalTableEntityData[]>;
}

export interface IApprovalTablesServiceMock extends IDomainBaseServiceMock<IApprovalTableEntity> {
  create: jest.Mock<IApprovalTableEntityData>;
  getApprovalsTableByEventId: jest.Mock<IApprovalTableEntityData[]>;
}
