import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAssessmentFormsService extends IDomainBaseService<IAssessmentFormEntity, { id: uuid, caseFileId: uuid }>{
  create(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  update(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
}

export interface IAssessmentFormsServiceMock extends IDomainBaseServiceMock<IAssessmentFormEntity>{
  create: jest.Mock<IAssessmentFormEntity>;
  update: jest.Mock<IAssessmentFormEntity>;
}
