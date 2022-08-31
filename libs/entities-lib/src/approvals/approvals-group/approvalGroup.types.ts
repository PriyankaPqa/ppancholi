import { IEntity } from '../../base';

export interface IApprovalGroupDTO {
  roles: Array<uuid>;
  minimum: number;
  maximum: number;
}
export interface IApprovalGroupData extends IEntity {
  roles: Array<uuid>
  minimumAmount: number;
  maximumAmount: number;
  editMode: boolean;
  addMode: boolean;
}

export interface IApprovalGroup extends IApprovalGroupData {
  setAddMode(value: boolean):void;
  setEditMode(value: boolean):void;
  setRoles(roles: uuid[]):void;
  setMaximum(value: number):void;
  setMinimum(value: number):void;
  toDto(): IApprovalGroupDTO
}
