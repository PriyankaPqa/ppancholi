import {
  EnumEntry,
  ObjectName,
  IQuery, ListOption, QueryType, ODataResult, IPowerBiTokenDetails,
} from '@libs/entities-lib/reporting';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IQueriesService extends IDomainBaseService<IQuery, uuid> {
  fetchEnums(): Promise<ODataResult<EnumEntry>>;
  fetchListOptions(): Promise<ODataResult<ListOption>>;
  fetchPrograms(): Promise<ODataResult<ObjectName>>;
  fetchEvents(): Promise<ODataResult<ObjectName>>;
  fetchByType(type: QueryType): Promise<IQuery[]>;
  edit(query: IQuery): Promise<IQuery>;
  create(query: IQuery): Promise<IQuery>;
  getPowerBiTokenForReport(reportName: string): Promise<IPowerBiTokenDetails>;
}

export interface IQueriesServiceMock extends IDomainBaseServiceMock<IQuery> {
  fetchEnums: jest.Mock<ODataResult<EnumEntry>>;
  fetchListOptions: jest.Mock<ODataResult<ListOption>>;
  fetchPrograms: jest.Mock<ODataResult<ObjectName>>;
  fetchEvents: jest.Mock<ODataResult<ObjectName>>;
  fetchByType: jest.Mock<IQuery[]>;
  edit: jest.Mock<IQuery>;
  create: jest.Mock<IQuery>;
  getPowerBiTokenForReport: jest.Mock<IPowerBiTokenDetails>;
}
