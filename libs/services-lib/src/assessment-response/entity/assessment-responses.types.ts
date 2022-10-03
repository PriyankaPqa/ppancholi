import { IAssessmentResponseCreateRequest, IAssessmentResponseEntity } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAssessmentResponsesService extends IDomainBaseService<IAssessmentResponseEntity, { id: uuid }>{
  getForBeneficiary(id: uuid): Promise<IAssessmentResponseEntity>;
  create(item: IAssessmentResponseCreateRequest): Promise<IAssessmentResponseEntity>;
  update(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>;
  saveAssessmentAnsweredQuestions(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>
  completeSurvey(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>
  completeSurveyByBeneficiary(item: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>
}

export interface IAssessmentResponsesServiceMock extends IDomainBaseServiceMock<IAssessmentResponseEntity>{
  getForBeneficiary: jest.Mock<IAssessmentResponseEntity>;
  create: jest.Mock<IAssessmentResponseCreateRequest>;
  update: jest.Mock<IAssessmentResponseEntity>;
  saveAssessmentAnsweredQuestions: jest.Mock<IAssessmentResponseEntity>;
  completeSurvey: jest.Mock<IAssessmentResponseEntity>;
  completeSurveyByBeneficiary: jest.Mock<IAssessmentResponseEntity>;
}
