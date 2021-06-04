import _cloneDeep from 'lodash/cloneDeep';
import { IIdMultilingualName, IMultilingual } from '@/types';
import utils from '../utils';
import {
  ECaseFileStatus, ECaseFileTriage, ICaseFile, ICaseFileHousehold, ICaseFileLabel, ICaseFileSearchData,
} from './case-file.types';

export class CaseFile implements ICaseFile {
  id: uuid;

  assignedTeamIds: uuid[];

  assignedIndividualIds: uuid[];

  caseFileNumber: string;

  caseFileStatus: ECaseFileStatus;

  caseFileStatusName: IMultilingual;

  created: Date | string;

  event: IIdMultilingualName;

  household: ICaseFileHousehold;

  lastActionDate: Date | string;

  isDuplicate: boolean;

  tags: IIdMultilingualName[];

  labels: ICaseFileLabel[];

  timestamp: Date | string;

  triage: ECaseFileTriage;

  triageName: IMultilingual;

  tenantId: uuid;

  constructor(data: ICaseFileSearchData) {
    this.id = data.caseFileId;

    this.assignedIndividualIds = [...data.assignedIndividualIds];

    this.assignedTeamIds = [...data.assignedTeamIds];

    this.caseFileNumber = data.caseFileNumber;

    this.caseFileStatus = data.caseFileStatus;

    this.caseFileStatusName = utils.initMultilingualAttributes(data.caseFileStatusName);

    this.created = new Date(data.caseFileCreatedDate);

    this.event = {
      id: data.event?.id,
      name: utils.initMultilingualAttributes(data.event?.name),
    };

    this.isDuplicate = data.isDuplicate;

    this.household = data.household ? _cloneDeep(data.household) : null;

    this.lastActionDate = data.lastActionDate ? new Date(data.lastActionDate) : null;

    this.tags = data.tags?.map((tag) => ({
      id: tag.id,
      name: utils.initMultilingualAttributes(tag.name),
    }));

    this.labels = data.labels.map((l) => ({ ...l }));

    this.timestamp = data.timestamp ? new Date(data.timestamp) : null;

    this.triage = data.triage;

    this.triageName = utils.initMultilingualAttributes(data.triageName);

    this.tenantId = data.tenantId;
  }

  private validateAttributes(errors: Array<string>) {
    if (!this.household.id) {
      errors.push('The household id is required');
    }

    if (!this.caseFileNumber) {
      errors.push('The case file number is required');
    }

    if (!this.caseFileStatus) {
      errors.push('The case file status is required');
    }

    if (!this.event.id) {
      errors.push('The event id is required');
    }

    if (!this.triage) {
      errors.push('The triage level is required');
    }
  }

  /**
   * Validate business rules (non specific to the application)
   */
  validate(): Array<string> | boolean {
    const errors: Array<string> = [];

    this.validateAttributes(errors);
    if (!errors.length) {
      return true;
    }

    return errors;
  }
}
