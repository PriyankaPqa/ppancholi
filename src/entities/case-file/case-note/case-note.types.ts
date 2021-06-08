import { IOptionItem } from '../../optionItem';
import { IMultilingual, IIdMultilingualName } from '../../../types';

export interface ICaseNoteUser {
  id: string,
  name: string;
}

export interface ICaseNote {
  id?: uuid;
  subject: string;
  category: IOptionItem;
  description: string;
  created: Date | string;
  user?: ICaseNoteUser;
  role?: IIdMultilingualName;
  lastModifiedByFullName?: string;
  lastModifiedDate?: Date | string;
  isPinned: boolean;
}

export interface ICaseNoteData {
  subject: string;
  caseFileId: uuid;
  description: string;
  category: {
    optionItemId: uuid,
    specifiedOther: string,
  };
  userCreatedBy: {
    userId: uuid,
    userName: string,
    roleId: uuid,
    roleName: IMultilingual,
  },
  isPinned: boolean;
}

export interface ICaseNoteSearchData {
  id: uuid;
  caseFileId: uuid;
  tenantId: uuid;
  subject: string,
  description: string,
  caseNoteCreatedDate: Date | string,
  caseNoteStatusName: IMultilingual,
  caseNoteCategoryId: uuid,
  caseNoteCategoryName: IMultilingual,
  createdBy: {
    userName: string,
    roleName: IMultilingual,
  },
  caseNoteUpdatedDate: Date | string,
  updatedBy: {
    userName: string,
  }
  isPinned: boolean;
}
