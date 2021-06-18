import { IEntity } from '@/entities/base/base.types';

export interface IDomainBaseService<T extends IEntity> {
  get(id: uuid): Promise<T>;
  getAll(): Promise<T[]>;
  getAllIncludingInactive(): Promise<T[]>;
  activate(id: uuid): Promise<T>;
  deactivate(id: uuid): Promise<T>;
}

export interface IDomainBaseServiceMock <T extends IEntity> {
  get: jest.Mock<T>;
  getAll: jest.Mock<Array<T>>;
  getAllIncludingInactive: jest.Mock<Array<T>>;
  activate: jest.Mock<T>;
  deactivate: jest.Mock<T>;
}
