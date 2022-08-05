import { IProgramEntity } from '@libs/entities-lib/program';
import { IDomainBaseService, IDomainBaseServiceMock } from '@libs/core-lib/services/base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export interface IProgramsService extends IDomainBaseService<IProgramEntity, UrlParams> {
  createProgram(payload: IProgramEntity): Promise<IProgramEntity>;
  updateProgram(payload: IProgramEntity): Promise<IProgramEntity>;
}

export interface IProgramsServiceMock extends IDomainBaseServiceMock<IProgramEntity>{
  createProgram: jest.Mock<IProgramEntity>;
  updateProgram: jest.Mock<IProgramEntity>;
}
