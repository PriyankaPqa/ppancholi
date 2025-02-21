import { mockMassActionEntities, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import {
  IMassActionFinancialAssistanceCreatePayload,
  IMassActionServiceMock,
} from './massAction.types';
import { mockDomainBaseService } from '../../base';

export const mockMassActionService = (): IMassActionServiceMock => ({
  ...mockDomainBaseService(mockMassActionEntities()),
  process: jest.fn(() => mockMassActionEntity()),
  update: jest.fn(() => mockMassActionEntity()),
  getInvalidFile: jest.fn(() => null),
  getEmailTemplate: jest.fn(() => ({ translation: { en: 'en', fr: 'fr' } })),
  create: jest.fn(() => mockMassActionEntity()),
  exportList: jest.fn(() => null),
  getValidFile: jest.fn(() => null),
  downloadTemplate: jest.fn(() => null),
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
