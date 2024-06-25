import { IMultilingual, Status } from '@libs/shared-lib/src/types';
import { IEntity } from '../../base';
import { IApprovalGroup } from '../approvals-group';

export enum ApprovalAggregatedBy {
  TotalFinancialAssistanceOnCaseFile = 1,
  IndividualPaymentTotal = 2,
}

export interface IApprovalBaseEntityData extends IEntity {
  aggregatedByType: ApprovalAggregatedBy
  name: IMultilingual;
  groups: Array<IApprovalGroup>
  approvalBaseStatus: Status;
}

export interface IApprovalBaseEntity extends IApprovalBaseEntityData {
  addGroup(group?: IApprovalGroup): void;
  deleteGroup(indexToRemove: number):void;
  setGroup(group: IApprovalGroup, index: number): IApprovalGroup;
  fillEmptyMultilingualAttributes(): void;
}

export interface IApprovalBaseMetadata extends IEntity {
  approvalBaseStatusName: IMultilingual;
}
