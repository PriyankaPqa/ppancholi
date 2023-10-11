import { mockQueryEntities } from '@libs/entities-lib/reporting';
import { mockDomainBaseService } from '../../base';
import { IQueriesServiceMock } from './queries.types';

export const mockQueriesService = (): IQueriesServiceMock => ({
  ...mockDomainBaseService(mockQueryEntities()),
  fetchByType: jest.fn(() => mockQueryEntities()),
});
