import {
  IAssessmentFormEntity,
} from './assessment-template.types';
import { AssessmentBaseEntity } from './assessment-base';

export class AssessmentFormEntity extends AssessmentBaseEntity implements IAssessmentFormEntity {
  eventId: uuid;

  programId: uuid | null;

  constructor(data?: IAssessmentFormEntity) {
    super(data);
    this.eventId = data?.eventId;
    this.programId = data?.programId;
  }
}
