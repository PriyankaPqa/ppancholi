import { IAssessmentFormEntity, IAssessmentTotalSubmissions, IdParams } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAssessmentFormsService extends IDomainBaseService<IAssessmentFormEntity, IdParams> {
  getForBeneficiary(id: uuid): Promise<IAssessmentFormEntity>;
  create(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  update(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  updateAssessmentStructure(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>
  fetchByProgramId(programId: uuid): Promise<IAssessmentFormEntity[]>;
  htmlToWord(data: string, filename: string): Promise<string>;
  assessmentTotalSubmissions(id: uuid): Promise<IAssessmentTotalSubmissions>;
}

export interface IAssessmentFormsServiceMock extends IDomainBaseServiceMock<IAssessmentFormEntity> {
  getForBeneficiary: jest.Mock<IAssessmentFormEntity>;
  create: jest.Mock<IAssessmentFormEntity>;
  update: jest.Mock<IAssessmentFormEntity>;
  updateAssessmentStructure: jest.Mock<IAssessmentFormEntity>;
  fetchByProgramId: jest.Mock<IAssessmentFormEntity[]>;
  htmlToWord: jest.Mock<string>;
  assessmentTotalSubmissions: jest.Mock<IAssessmentTotalSubmissions>;
}
