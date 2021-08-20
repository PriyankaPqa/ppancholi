import { IProgramEntity } from '@/entities/program';
import { IDomainBaseService } from '@/services/base';

interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export interface IProgramsService extends IDomainBaseService<IProgramEntity, UrlParams> {
  createProgram(payload: IProgramEntity): Promise<IProgramEntity>;
  updateProgram(payload: IProgramEntity): Promise<IProgramEntity>;
}

export interface IProgramsServiceMock {
  createProgram: jest.Mock<IProgramEntity>;
  updateProgram: jest.Mock<IProgramEntity>;
}
