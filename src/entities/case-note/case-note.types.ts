import { IEntity, IEntityCombined } from '@/entities/base/base.types';
import { IMultilingual, IListOption } from '@/types';

export interface ICaseNoteUser {
  id: string,
  name: string;
}

export interface ICaseNoteEntity extends IEntity {
  subject?: string;
  caseFileId?: uuid;
  description?: string;
  category?: IListOption;
  userCreatedBy?: {
    userId: uuid,
    userName: string,
    roleId: uuid,
    roleName: IMultilingual,
  };
  userUpdatedBy?: {
    userId: uuid,
    userName: string,
    roleId: uuid,
    roleName: IMultilingual,
  };
  isPinned?: boolean;
  updatedDate: Date | string;

  validate(): Array<string> | boolean;
}

export interface ICaseNoteMetadata extends IEntity {
  caseNoteStatusName: IMultilingual,
  caseNoteCategoryName: IMultilingual,
}

export type ICaseNoteCombined = IEntityCombined<ICaseNoteEntity, ICaseNoteMetadata>
