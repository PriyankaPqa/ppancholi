import { IListOption, IUserInformation } from '@libs/shared-lib/types';
import { IEntity, IEntityCombined } from '../base';

export interface ICaseNoteUser {
  id: string,
  name: string;
}

export interface ICaseNoteEntity extends IEntity {
  subject?: string;
  caseFileId?: uuid;
  description?: string;
  category?: IListOption;
  userCreatedBy?: IUserInformation;
  userUpdatedBy?: IUserInformation;
  isPinned?: boolean;
  updatedDate: Date | string;

  validate(): Array<string> | boolean;
}

export type ICaseNoteCombined = IEntityCombined<ICaseNoteEntity, IEntity>;

export type IdParams = { id: uuid, caseFileId: uuid };
export type IdMetadataParams = { id: uuid, caseFileId: uuid };
