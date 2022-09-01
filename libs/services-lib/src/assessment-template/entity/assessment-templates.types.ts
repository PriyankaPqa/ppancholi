import { IAssessmentTemplateEntity } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAssessmentTemplatesService extends IDomainBaseService<IAssessmentTemplateEntity, { id: uuid, caseFileId: uuid }>{
  create(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity>;
  update(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity>;
  updateAssessmentStructure(item: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity>
}

export interface IAssessmentTemplatesServiceMock extends IDomainBaseServiceMock<IAssessmentTemplateEntity>{
  create: jest.Mock<IAssessmentTemplateEntity>;
  update: jest.Mock<IAssessmentTemplateEntity>;
  updateAssessmentStructure: jest.Mock<IAssessmentTemplateEntity>;
}
