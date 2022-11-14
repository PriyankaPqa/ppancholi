import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template/assessment-template.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAssessmentFormsService extends IDomainBaseService<IAssessmentFormEntity, { id: uuid }>{
  getForBeneficiary(id: uuid): Promise<IAssessmentFormEntity>;
  create(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  update(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  updateAssessmentStructure(item: IAssessmentFormEntity): Promise<IAssessmentFormEntity>
  fetchByProgramId(programId: uuid): Promise<IAssessmentFormEntity[]>;
}

export interface IAssessmentFormsServiceMock extends IDomainBaseServiceMock<IAssessmentFormEntity>{
  getForBeneficiary: jest.Mock<IAssessmentFormEntity>;
  create: jest.Mock<IAssessmentFormEntity>;
  update: jest.Mock<IAssessmentFormEntity>;
  updateAssessmentStructure: jest.Mock<IAssessmentFormEntity>;
  fetchByProgramId: jest.Mock<IAssessmentFormEntity[]>;
}
