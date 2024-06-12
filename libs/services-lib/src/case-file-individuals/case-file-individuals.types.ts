import { ICaseFileIndividualEntity, ReceivingAssistanceDetail, TemporaryAddress } from '@libs/entities-lib/case-file-individual';
import { ICurrentAddressData } from '@libs/entities-lib/value-objects/current-address';
import { IDomainBaseService, IDomainBaseServiceMock } from '../base';

export interface ICaseFileIndividualsService extends IDomainBaseService<ICaseFileIndividualEntity, { id: uuid, caseFileId: uuid }> {
  createCaseFileIndividual(item: ICaseFileIndividualEntity): Promise<ICaseFileIndividualEntity>;
  addReceiveAssistanceDetails(caseFileId: uuid, id: uuid, item: ReceivingAssistanceDetail): Promise<ICaseFileIndividualEntity>;
  addTemporaryAddress(caseFileId: uuid, id: uuid, item: ICurrentAddressData): Promise<ICaseFileIndividualEntity>;
  editTemporaryAddress(caseFileId: uuid, id: uuid, item: TemporaryAddress): Promise<ICaseFileIndividualEntity>
}

export interface ICaseFileIndividualsServiceMock extends IDomainBaseServiceMock<ICaseFileIndividualEntity> {
  createCaseFileIndividual: jest.Mock<ICaseFileIndividualEntity>;
  addReceiveAssistanceDetails: jest.Mock<ICaseFileIndividualEntity>;
  addTemporaryAddress: jest.Mock<ICaseFileIndividualEntity>;
  editTemporaryAddress: jest.Mock<ICaseFileIndividualEntity>;
}
