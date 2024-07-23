import { mockQueryEntities, mockQueryEntity, mockEnums, mockListOptions, mockObjectNames, mockPowerBiToken } from '@libs/entities-lib/reporting';
import { mockDomainBaseService } from '../../base';
import { IQueriesServiceMock } from './queries.types';

export const mockQueriesService = (): IQueriesServiceMock => ({
  ...mockDomainBaseService(mockQueryEntities()),
  fetchByType: jest.fn(() => mockQueryEntities()),
  create: jest.fn(() => mockQueryEntity()),
  edit: jest.fn(() => mockQueryEntity()),
  fetchEnums: jest.fn(() => ({ value: mockEnums() })),
  fetchListOptions: jest.fn(() => ({ value: mockListOptions() })),
  fetchPrograms: jest.fn(() => ({ value: mockObjectNames() })),
  fetchEvents: jest.fn(() => ({ value: mockObjectNames() })),
  getPowerBiTokenForReport: jest.fn(() => mockPowerBiToken()),
});
