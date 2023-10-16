import { mockQueryEntities, mockQueryEntity } from '@libs/entities-lib/reporting';
import { mockDomainBaseService } from '../../base';
import { IQueriesServiceMock } from './queries.types';

export const mockQueriesService = (): IQueriesServiceMock => ({
  ...mockDomainBaseService(mockQueryEntities()),
  fetchByType: jest.fn(() => mockQueryEntities()),
  create: jest.fn(() => mockQueryEntity()),
  edit: jest.fn(() => mockQueryEntity()),
});
