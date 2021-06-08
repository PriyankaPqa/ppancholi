import { IIdMultilingualName } from '../../../types';
import { IOptionItem } from '../../optionItem';
import { ICaseNote, ICaseNoteSearchData, ICaseNoteUser } from './case-note.types';

export class CaseNote implements ICaseNote {
  id: uuid;

  subject: string;

  category: IOptionItem;

  description: string;

  created: Date | string;

  user?: ICaseNoteUser;

  role?: IIdMultilingualName;

  lastModifiedDate: Date | string;

  lastModifiedByFullName?: string;

  isPinned: boolean;

  constructor(data: ICaseNoteSearchData) {
    const { createdBy } = data;

    this.id = data.id;

    this.subject = data.subject;

    this.description = data.description;

    this.category = {
      id: data.caseNoteCategoryId,
      name: data.caseNoteCategoryName,
      orderRank: null,
      status: null,
      isOther: null,
      isDefault: null,
      subitems: [],
    };

    this.user = {
      id: null,
      name: createdBy?.userName,
    };

    this.role = {
      id: null,
      name: createdBy?.roleName,
    };

    if (data.updatedBy) {
      this.lastModifiedByFullName = data.updatedBy?.userName;
      this.lastModifiedDate = data.caseNoteUpdatedDate;
    } else {
      this.lastModifiedByFullName = data.createdBy.userName;
      this.lastModifiedDate = data.caseNoteCreatedDate;
    }

    this.created = data.caseNoteCreatedDate;

    this.isPinned = data.isPinned;
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.subject) {
      errors.push('The subject is required');
    }

    if (!this.category) {
      errors.push('The category is required');
    }

    if (!this.description) {
      errors.push('The description is required');
    }
  }

  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
