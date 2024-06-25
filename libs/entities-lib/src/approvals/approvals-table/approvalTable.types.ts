import { IApprovalBaseEntity, IApprovalBaseEntityData } from '../approvals-base';

export interface IApprovalTableEntityData extends IApprovalBaseEntityData {
  eventId: uuid;
  programId: uuid;
}

export interface IApprovalTableEntity extends IApprovalBaseEntity, IApprovalTableEntityData {
  setProgramId(id: uuid):void;
}

export type IdParams = uuid;
