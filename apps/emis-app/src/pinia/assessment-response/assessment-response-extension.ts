import { BaseStoreComponents } from '@libs/stores-lib/base/base.types';
import { AssessmentResponsesService, IAssessmentResponsesServiceMock } from '@libs/services-lib/assessment-response/entity';
import {
  IAssessmentResponseCreateRequest,
  IAssessmentResponseEntity, IQuestionResponse, IdParams,
} from '@libs/entities-lib/assessment-template';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IAssessmentResponseEntity, IdParams>,
  entityService: AssessmentResponsesService | IAssessmentResponsesServiceMock,
) {
  async function create(payload: IAssessmentResponseCreateRequest) {
    const data = await entityService.create(payload);
    if (data) {
      baseComponents.addNewlyCreatedId(data);
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function update(payload: IAssessmentResponseEntity) {
    const data = await entityService.update(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function saveAssessmentAnsweredQuestions(payload: IAssessmentResponseEntity) {
    const data = await entityService.saveAssessmentAnsweredQuestions(payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function editAssessmentAnsweredQuestion(payload:
      { id: string, responses: IQuestionResponse[], assessmentQuestionIdentifier: string, parentIndexPath: string, questionId: uuid }) {
    const data = await entityService.editAssessmentAnsweredQuestion(payload.id, payload);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  return {
    create,
    update,
    saveAssessmentAnsweredQuestions,
    editAssessmentAnsweredQuestion,
  };
}
