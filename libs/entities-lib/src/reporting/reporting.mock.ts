import { mockBaseData } from '../base';

import {
  IQuery, QueryType, ReportingTopic,
} from './reporting.types';

export const mockQueryEntity = (force?: Partial<IQuery>) : IQuery => ({
  ...mockBaseData(),
  name: 'some query',
  queryType: QueryType.Custom,
  state: 'state',
  topic: ReportingTopic.HouseholdMembers,
  owner: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
  createdBy: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
  ...force,
});

export const mockQueryEntities = () : IQuery[] => [
  mockQueryEntity({ id: '1' }),
  mockQueryEntity({ id: '2', queryType: QueryType.StandardL6en, owner: null, name: 'second' }),
  mockQueryEntity({ id: '3', createdBy: 'd9cd254a-f527-4000-95ea-285442253cda', name: 'mon troisième', topic: ReportingTopic.HouseholdPrimary }),
  mockQueryEntity({ id: '4', createdBy: 'd9cd254a-f527-4000-95ea-285442253cda', name: 'mon quatrième', topic: ReportingTopic.HouseholdPrimary }),
];
