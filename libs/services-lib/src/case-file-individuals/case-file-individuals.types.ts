import { ICaseFileIndividualEntity, ReceivingAssistanceDetail } from '@libs/entities-lib/case-file-individual';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface ICaseFileIndividualsService extends IDomainBaseService<ICaseFileIndividualEntity, { id: uuid, caseFileId: uuid }> {
  createCaseFileIndividual(item: ICaseFileIndividualEntity): Promise<ICaseFileIndividualEntity>;
  addReceiveAssistanceDetails(caseFileId: uuid, id: uuid, item: ReceivingAssistanceDetail): Promise<ICaseFileIndividualEntity>;
}

export interface ICaseFileIndividualsServiceMock extends IDomainBaseServiceMock<ICaseFileIndividualEntity> {
  createCaseFileIndividual: jest.Mock<ICaseFileIndividualEntity>;
  addReceiveAssistanceDetails: jest.Mock<ICaseFileIndividualEntity>;
}
