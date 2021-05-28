import { IOptionItem } from '../../optionItem';
import { IMultilingual, IIdMultilingualName } from '../../../types';

export interface ICaseNoteUser {
  id: string,
  name: string;
}

export interface ICaseNote {
  subject: string;
  category: IOptionItem;
  description: string;
  created: Date | string;
  user?: ICaseNoteUser;
  role?: IIdMultilingualName;
  lastModifiedByFullName?: string;
  lastModifiedDate?: string;
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
}

export interface ICaseNoteSearchData {
  caseFileId: uuid;
  tenantId: uuid;
  subject: string,
  description: string,
  caseNoteCreatedDate: Date | string,
  caseNoteStatusName: IMultilingual,
  caseNoteCategoryName: IMultilingual,
  createdBy: {
    userName: string,
    roleName: IMultilingual,
},
}
