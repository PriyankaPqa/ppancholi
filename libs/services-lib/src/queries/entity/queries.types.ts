import {
  IQuery, QueryType, IPowerBiTokenDetails,
} from '@libs/entities-lib/reporting';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IQueriesService extends IDomainBaseService<IQuery, uuid> {
  fetchByType(type: QueryType): Promise<IQuery[]>;
  edit(query: IQuery): Promise<IQuery>;
  create(query: IQuery): Promise<IQuery>;
  getPowerBiTokenForReport(reportName: string): Promise<IPowerBiTokenDetails>;
}

export interface IQueriesServiceMock extends IDomainBaseServiceMock<IQuery> {
  fetchByType: jest.Mock<IQuery[]>;
  edit: jest.Mock<IQuery>;
  create: jest.Mock<IQuery>;
  getPowerBiTokenForReport: jest.Mock<IPowerBiTokenDetails>;
}
