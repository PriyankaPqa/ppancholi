import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';
import { IMassActionEntity, MassActionRunType } from '@/entities/mass-action/massActions.types';
import { IRestResponse } from '@/services/httpClient';

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {
  process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity>
  update(id: uuid, payload: {name: string; description: string}): Promise<IMassActionEntity>
  getInvalidFile(massActionId: uuid, runId: uuid): Promise<IRestResponse<string>>
}

export interface IMassActionServiceMock extends IDomainBaseServiceMock<IMassActionEntity>{
  process: jest.Mock<IMassActionEntity>;
  update: jest.Mock<IMassActionEntity>;
  getInvalidFile: jest.Mock<IRestResponse<string>>;
}
