import { IApprovalBaseEntity, IApprovalBaseEntityData } from '../approvals-base';
import { IEntity, IEntityCombined } from '../../base';

export interface IApprovalTableEntityData extends IApprovalBaseEntityData {
  eventId: uuid;
  programId: uuid;
}

export interface IApprovalTableEntity extends IApprovalBaseEntity, IApprovalTableEntityData {
  setProgramId(id: uuid):void;
}

export type IApprovalTableCombined = IEntityCombined<IApprovalTableEntity, IEntity>;

export type IdParams = uuid;
