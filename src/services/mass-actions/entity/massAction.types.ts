import { IDomainBaseService } from '@/services/base';
import { IMassActionEntity, MassActionRunType } from '@/entities/mass-action/massActions.types';

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {
  process(id: uuid, runType: MassActionRunType): Promise<IMassActionEntity>
  update(id: uuid, payload: {name: string; description: string}): Promise<IMassActionEntity>
}

export interface IMassActionServiceMock {
  process: jest.Mock<IMassActionEntity>;
  update: jest.Mock<IMassActionEntity>;
}
