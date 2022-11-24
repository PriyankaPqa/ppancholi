import { IMultilingual } from '@libs/shared-lib/types';
import { IApprovalBaseEntity, IApprovalBaseEntityData, IApprovalBaseMetadata } from '../approvals-base';
import { IEntityCombined } from '../../base';

export interface IApprovalTableEntityData extends IApprovalBaseEntityData {
  eventId: uuid;
  programId: uuid;
}

export interface IApprovalTableEntity extends IApprovalBaseEntity, IApprovalTableEntityData {
  setProgramId(id: uuid):void;
}

export interface IApprovalTableMetadata extends IApprovalBaseMetadata {
  programId: uuid;
  programName: IMultilingual;
}

export type IApprovalTableCombined = IEntityCombined<IApprovalTableEntity, IApprovalTableMetadata>;
