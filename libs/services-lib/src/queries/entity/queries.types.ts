import {
  IQuery, QueryType,
} from '@libs/entities-lib/reporting';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IQueriesService extends IDomainBaseService<IQuery, uuid> {
  fetchByType(type: QueryType): Promise<IQuery[]>;
}

export interface IQueriesServiceMock extends IDomainBaseServiceMock<IQuery> {
  fetchByType: jest.Mock<IQuery[]>;
}
