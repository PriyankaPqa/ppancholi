import { IIdMultilingualName } from '../../../types';
import { IOptionItem } from '../../optionItem';
import { ICaseNote, ICaseNoteSearchData, ICaseNoteUser } from './case-note.types';

export class CaseNote implements ICaseNote {
  subject: string;

  category: IOptionItem;

  description: string;

  created: Date | string;

  user?: ICaseNoteUser;

  role?: IIdMultilingualName;

  lastModifiedByFullName?: string;

  constructor(data: ICaseNoteSearchData) {
    const { createdBy } = data;

    this.subject = data.subject;

    this.description = data.description;

    this.category = {
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

    this.lastModifiedByFullName = createdBy?.userName;

    this.created = data.caseNoteCreatedDate;
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
