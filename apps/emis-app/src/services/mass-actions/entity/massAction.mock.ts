import {
  IMassActionFinancialAssistanceCreatePayload,
  IMassActionServiceMock,
} from '@/services/mass-actions/entity/massAction.types';
import { mockMassActionEntities, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockDomainBaseService } from '@libs/core-lib/services/base';

export const mockMassActionService = (): IMassActionServiceMock => ({
  ...mockDomainBaseService(mockMassActionEntities()),
  process: jest.fn(() => mockMassActionEntity()),
  update: jest.fn(() => mockMassActionEntity()),
  getInvalidFile: jest.fn(() => null),
  create: jest.fn(() => mockMassActionEntity()),
  exportList: jest.fn(() => null),
  getValidFile: jest.fn(() => null),
});

export const mockMassActionCreatePayload = (): IMassActionFinancialAssistanceCreatePayload => ({
  name: 'string',
  description: 'string',
  eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  tableId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  programId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  mainCategoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  subCategoryId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  paymentModality: 1,
  amount: 0,
  search: 'search',
  filter: 'filter',
});
